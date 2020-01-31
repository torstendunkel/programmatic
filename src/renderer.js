var ch = ch || {};
ch.tam = ch.tam || {};

ch.tam.addnexusRender = (function () {

    "use strict";

    var settings = {
        version: '%%VERSION%%',  // filled by grunt
        environment: '%%ENVIRONMENT%%', // filled by grunt
        scriptBase: '%%SCRIPTBASE%%', // filled by grunt
        identifier: 'ppn_sb_billboard3_DE_20min', //fallback
        member: 3646, // fallback variables
        numads: 4, // fallback variables
        tagid: 9518829, // fallback variables
        jsonUrl: 'config.json',
        jsonpUrl: 'config_jsonp.js',
        idPrefix: 'main',
        adMarker: {
            de: 'Anzeige',
            fr: 'Publicité',
            it: 'Pubblicità',
            en: 'Sponsored'
        },
        moreText: {
            de: 'Mehr ..',
            fr: 'Plus ..',
            it: 'Più ..',
            en: 'More ..'
        },
        sampling: {
            main: 0.025, // main sampling all other types are multiplied with this. e.g. 5% of the users will send logs but only 10% of these 5% will send info logs
            error: 1,
            info: 0.1,
            warning: 0.1
        },
        trackingPixelClass: 'pixel',
        moreNode: 'div',
        showMore: false,
        logging: "true", // logging via loggly
        moreInTxt: false,
        imageMinifyUrl : 'https://imagemin.da-services.ch/?img=',
        imageMinifyOptions : '&width=320',
        moreBtn: '<{{moreNode}} class="url"><a target="_blank" href="{{href}}">{{more}}</a></{{moreNode}}>',
        trackingPixel: '<img class="{{trackingPixelClass}}" src="{{imgSrc}}" width="0" height="0" style="display:none"/>',
        wrapper: '<div class="{{identifier}}"><div class="ppncaption">Werbung</div><div id="ppninnerbox" class="ppninnerbox">{{content}}</div><div class="tnlogo"><a href="https://goo.gl/gJLreW" target="_blank">{{admarker}}</a></div>',
        template: '<div class="singlebox bottom left right" id="{{id}}" data-href="{{href}}"><a target="_blank" href="{{href}}"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="{{href}}">{{title}}</a></div><div class="text"><a target="_blank" href="{{href}}">{{description}} </a>{{moreInTxt}}</div>{{moreOutTxt}}{{impression}}</div>'

    };

    var Renderer = function (config) {

        //TODO: remove this when apn bug fixed
        document.head.appendChild(this.prepareStyle("style", 'iframe[tabindex="-1"]{display:none}'));


        //set stack for logglylog even if not enabled
        window._LTracker = window._LTracker || [];
        this.startTime = new Date().getTime();
        this.config = config;
        this.init();
    };

    Renderer.prototype = {

        init: function () {
            var _this = this;
            this.settings = settings;
            this.options = {};
            this.scriptTag = document.getElementsByTagName('script');

            var index = this.scriptTag.length - 1;
            this.scriptTag = this.scriptTag[index];
            this.loadedAds = {};
            this.adsLoaded = {};
            this.loadedCreatives = [];
            this.adBuckets = {};
            this.adErrors = [];
            this.logs = [];

            this.ads = {};


            this.logger("start renderer");

            this.validateOptions(function () {
                _this.addAppNexusLib();
                if (!_this.config) {
                    _this.loadStyle();
                }

                // load dummy data for development
                if (_this.options.demo) {
                    _this.loadJSON('../../dummy.json', function (data) {
                        var data = JSON.parse(data);
                        data.identifier = _this.options.identifier;
                        _this.render(data);
                    });
                    _this.loadStyle();
                } else {
                    apntag.anq.push(function () {
                        _this.prepareTags();
                    });
                    _this.checkForMRAID();
                    _this.addLoggly();
                }


            });

            //register fallback timer
            this.checkAstLoaded();

        },


        // to get better results in android app try to load the ast again if it is not loaded after a timeout.
        // Sometimes the js is not executed for no reason.
        checkAstLoaded: function () {
            var _this = this;
            setTimeout(function () {
                if (!_this.astFallbackTriggered && !apntag.loaded) {
                    _this.astFallbackTriggered = true;

                    //force all following logs do be done as "followup"
                    _this.forceSession = _this.followUp = true;

                    apntag.l = false;
                    _this.addAppNexusLib();


                    // do not log this case... only log the following action (adblocked or loaded at seconds time) to save some requests
                    _this.logger("AST not loaded. Try to load again");
                    _this.checkAstLoaded();

                } else if (_this.astFallbackTriggered && apntag.loaded) {
                    _this.logglyLog({
                        type: "warning",
                        message: "AST loaded with second try."
                    }, true);
                } else if (_this.astFallbackTriggered) {
                    _this.logglyLog({
                        type: "warning",
                        message: "AST adblocked."
                    }, true);
                }

            }, 10000);

        },

        // validates the options object to check if ads can be requested and rendered
        // options priority:
        // 1. settings by hash
        // 2. settings by json or inline rendered
        // 3. default settings
        validateOptions: function (callback) {
            var _this = this;
            //parsing the hash
            this.hashOptions = this.parseHash();

            // identifier must be set to load json and css
            this.options.identifier = this.options.identifier || this.hashOptions.identifier || (this.config ? this.config.identifier : undefined) || this.settings.identifier;

            // if the json is rendered into the file we do not need to load it
            if (this.config) {
                _this.setOptions(this.config, callback);
            } else {
                //loading the config json to override settings
                this.loadJSON(this.settings.jsonUrl, function (json) {
                    try {
                        json = JSON.parse(json);
                    } catch (e) {
                        _this.logglyLog({
                                type: "error",
                                message: "malformed json setting"
                            }
                        );
                        json = {};
                    }
                    _this.setOptions(json, callback);
                });
            }
        },

        setOptions: function (json, callback, jsonp) {
            var _this = this;
            _this.hashOptions.numads = _this.hashOptions.numads || json.numads || this.parseNumadsFromIdentifier(this.options.identifier) || this.settings.numads;
            //language is guessed by the identifier when not in hash-options or in json
            _this.hashOptions.lang = _this.hashOptions.lang || json.lang || _this.guessLangFromIdentifier(_this.options.identifier);

            //save the identifier because it may be set by the checkbeforeRender function
            var tidentifier = this.options.identifier;
            this.options = this.merge(this.merge(this.settings, json), this.hashOptions);
            this.options.identifier = tidentifier;


            if (jsonp) {
                this.logger("Options loaded with jsonp");
                this.logglyLog({
                    type: "info",
                    message: "config loaded via jsonp"
                })
            }


            if (typeof callback === "function") {
                this.logger("Options set to", _this.options);
                callback.call();
            } else if (typeof this.callbackAfterOptionsAssign === 'function') {
                this.callbackAfterOptionsAssign.call(this);
            }
        },

        prepareTags: function () {
            var cNums;
            //generate main tags
            var tags = this.generateTagArray(this.options.tagid, this.options.numads, this.settings.idPrefix);
            //store the numads for each bucket so that the adavailable function knows when one bucket is fully loaded/available
            this.ads["main"] = {
                identifier: this.options.identifier,
                numads: this.options.numads,
                adsLoaded: 0,
                noBid: 0,
                loadedAds: [],
                complete: false
            };
            this.loadedCreatives["main"] = [];

            //if challenges available get challengers ads array
            if (this.options.challenge && this.options.ctagid) {
                this.parseChallengeData();
                for (var i = 0; i < this.options.challenge.length; i++) {
                    cNums = this.parseNumadsFromIdentifier(this.options.challenge[i]);
                    tags = tags.concat(this.generateTagArray(this.options.ctagid[i], cNums, "challenge" + i));
                    this.ads["challenge" + i] = {
                        identifier: this.options.challenge[i],
                        numads: cNums,
                        adsLoaded: 0,
                        noBid: 0,
                        loadedAds: [],
                        complete: false
                    };

                    this.loadedCreatives["challenge" + i] = [];
                }
                this.options.challengeNumAds = this.parseNumadsFromIdentifier(this.options.challenge);
                tags = tags.concat(this.generateTagArray(this.options.ctagid, this.options.challengeNumAds, "challenge"));
            }
            this.logger("tags defined", tags);
            this.loadAds(tags);

        },

        generateTagArray: function (tagId, numads, prefix) {
            var arr = [];
            var adObj;
            for (var i = 0; i < numads; i++) {
                adObj = {
                    tagId: parseInt(tagId),
                    allowedFormats: ['native'],
                    allowSmallerSizes: true,
                    sizes: [[1, 1]],
                    targetId: prefix + i,
                    prebid: true,

                    native: {
                        title: {
                            required: true,
                            max_length: this.options.maxTitleLength ? parseInt(this.options.maxTitleLength) : undefined
                        },
                        body: {
                            required: true,
                            max_length: this.options.maxBodyLength ? parseInt(this.options.maxBodyLength) : undefined
                        },
                        image: {
                            required: true
                        },
                        sponsoredBy: {
                            required: false
                        },
                        cta: {
                            required: false
                        }
                    }
                };


                //if defined merge the global AppNexus Config to the adObj
                if (window.anConfigAd) {
                    this.logger("merging appnexus config ad");
                    try {
                        adObj = this.merge(adObj, window.anConfigAd);
                        if (typeof this.getForcedAds === "function") {
                            adObj = this.merge(adObj, this.getForcedAds());
                        }
                    } catch (e) {
                        this.logglyLog({
                            type: "error",
                            message: "could not merge appnexus config ad"
                        });
                    }

                    /*
                    this.logglyLog({
                        type: "info",
                        message: "merging anConfigAd",
                        adconfig: window.anConfigAd
                    });
                    */


                } else if (this.options.supplyType) {
                    // in some cases we need to pass the appmode via the options and then we generate dummy app ids as well
                    adObj.supplyType = this.options.supplyType;
                }

                if (this.options.forceCreativeId) {
                    window.anConfigFirst = {
                        forceCreativeId: this.options.forceCreativeId
                    }
                }

                // if defined merge the global AppNexuFirst Config to the first adObj
                if (i == 0 && window.anConfigFirst) {
                    try {
                        this.logger("merging appnexus config ad for first ad");
                        if (window.anConfigFirst.forceCreativeId && typeof window.anConfigFirst.forceCreativeId !== "number") {
                            window.anConfigFirst.forceCreativeId = parseInt(window.anConfigFirst.forceCreativeId.match(/\d+/g)[0]);
                        }
                        adObj = this.merge(adObj, window.anConfigFirst);
                    } catch (e) {
                        this.logglyLog({
                            type: "error",
                            message: "could not merge anConfigFirst"
                        });
                    }

                    this.logglyLog({
                        type: "info",
                        message: "merging adConfigFirst",
                        adconfig: window.anConfigFirst
                    });

                }
                arr.push(adObj);

                if (!this.secondTry) {
                    apntag.onEvent('adAvailable', prefix + i, this.adAvailable.bind(this, prefix + "-" + i, prefix));
                    apntag.onEvent('adNoBid', prefix + i, this.adNoBid.bind(this, prefix + "-" + i, prefix));
                    apntag.onEvent('adRequestFailure', prefix + i, this.handleAdError.bind(this, prefix + "-" + i, prefix));
                    apntag.onEvent('adBadRequest', prefix + i, this.handleAdError.bind(this, prefix + "-" + i, prefix));
                    apntag.onEvent('adError', prefix + i, this.handleAdError.bind(this, prefix + "-" + i, prefix));

                }

            }
            return arr;
        },

        getTargetingFromMap: function () {
            var keywords = {};
            if (window.targetingmap) {
                try {
                    keywords = JSON.parse(window.targetingmap);
                } catch (e) {
                    if (typeof window.targetingmap === "object") {
                        keywords = window.targetingmap;
                    } else {
                        this.logglyLog({
                            type: "error",
                            message: "not parsable targeting map",
                            map: window.targetingmap
                        });
                    }
                }
            }

            // dfp puts every targetingkey inside an array. So we remove it from there
            for (var key in keywords) {
                if (typeof keywords[key] !== "string" && typeof keywords[key] === "object") {
                    if (keywords[key].length === 1) {
                        keywords[key] = keywords[key][0];
                    }
                }
            }
            return keywords;
        },

        loadAds: function (tags) {
            // pass the global kv to appnexus
            var keywords = this.getTargetingFromMap();


            //set global page options
            var pageObj = {
                member: parseInt(this.options.member) || this.settings.member,
                keywords: keywords
            };
            if (window.anConfigPage) {
                this.logger("merging appnexus config page");
                try {
                    pageObj = this.merge(pageObj, window.anConfigPage);
                } catch (e) {
                    this.logglyLog({
                        type: "error",
                        message: "could not merge appnexus config page"
                    });

                }
            } else if (this.options.supplyType) {
                // if supplytype set by options to app_mode generate dummy app ids
                var dummyDeviceId = {
                    device: {
                        deviceId: {
                            idfa: this.generateIdfa(),
                            aaid: this.generateAaid()
                        }
                    }
                };
                pageObj = this.merge(pageObj, dummyDeviceId);
            }


            apntag.setPageOpts(pageObj);

            for (var i = 0; i < tags.length; i++) {
                apntag.defineTag(tags[i]);
            }
            this.logger("sending AST request");
            apntag.loadTags();
        },

        adAvailable: function (id, bucket, data) {

            var handleAsNobid = false;
            // check for duplicates
            if (this.loadedCreatives[bucket].indexOf(data.creativeId) !== -1) {
                this.ads[bucket].duplicatesFound = true;
                this.logger("douplicate ad found", data.creativeId);
                handleAsNobid = true;
            }

            // when this template has a fallbackLayout we can treat duplicates as nobids
            if (this.options.fallBackLayout && handleAsNobid) {
                this.adNoBid(id, bucket);
            } else {
                this.loadedCreatives[bucket].push(data.creativeId);
                this.ads[bucket].adsLoaded += 1;
                data.id = id;
                this.ads[bucket].loadedAds.push(data);
                this.logger("ad available", id);
                this.checkBucketStatus(bucket);
            }
        },

        adNoBid: function (id, bucket) {
            this.ads[bucket].adsLoaded += 1;
            this.ads[bucket].noBid += 1;
            this.logger("received no bid", id);
            this.checkBucketStatus(bucket);

        },

        // ad Errors normally only appear when blocked by adblocker
        handleAdError: function (id, bucket, adError) {
            this.logger("Ad Error received");
            this.adErrors.push(adError);


            // treat as if there where no bid for this ad
            this.adNoBid(id, bucket);

        },

        checkBucketStatus: function (bucket) {
            if (this.ads[bucket].adsLoaded === this.ads[bucket].numads) {
                this.logger(bucket, "ready");
                //when all requested ads are available then this bucket is complete
                if (this.ads[bucket].noBid === 0) {
                    this.ads[bucket].complete = true;
                }
                //also allow some "main" ads to render even if not ads are loaded (needs to be defined in the config.json)
                else if ((this.ads[bucket].numads - this.ads[bucket].noBid) > 0) {
                    var adsAvailable = this.ads[bucket].numads - this.ads[bucket].noBid;
                    this.ads[bucket].complete = this.checkLayoutSwitch(bucket, adsAvailable);
                }


                //when all ads are ready compare their cpm
                if (this.checkIfAllBucketsAreReady()) {
                    this.compareCPMs();
                }
            }
        },

        checkIfAllBucketsAreReady: function () {
            for (var i in this.ads) {
                if (this.ads.hasOwnProperty(i) && this.ads[i].adsLoaded !== this.ads[i].numads) {
                    return false;
                }
            }
            return true;
        },


        /*
         check in config if a different layout is available for the ammount of available ads
         */
        checkLayoutSwitch: function (bucket, adsAvailable) {
            if (this.options.fallBackLayout && this.options.fallBackLayout[adsAvailable]) {

                var oldIdentifier = this.ads[bucket].identifier;

                this.ads[bucket].identifier = this.options.fallBackLayout[adsAvailable];
                var message = "Not enough ads";
                if (this.ads[bucket].duplicatesFound) {
                    message = "Douplicate creatives";
                }
                this.logger("switching from", oldIdentifier, "to layout", this.ads[bucket].identifier, message);
                this.logglyLog({
                    type: "info",
                    message: "Layout changed:" + message,
                    oldLayout: oldIdentifier,
                    newLayout: this.ads[bucket].identifier
                });

                this.ads[bucket].layoutSwitched = true;

                return true;
            }
            return false;
        },


        // this function will compare the loaded ads. The prio is the following:
        // 1. Main ad (identifier)
        // 2. Ad with the lowest ammount of loaded ads
        // 3. Highest CPM
        compareCPMs: function () {
            this.logger("compare CPMs", this.ads);

            var adCPM;
            var highestCPM = -1;
            var currentLowestAdNum = 100; //prefer the campaign with the lowest num of ads (start with 100 so that the first loaded ad will be below this value)
            var bestAd;
            var tAd;
            this.challengeWon = false;
            //only for logging
            this.challengeData = {};

            var preferredAd;
            var sencond_preferredAd;

            for (var i in this.ads) {
                adCPM = 0;
                if (this.ads.hasOwnProperty(i)) {
                    tAd = this.ads[i];
                    // only start comparision when all ads in this bucket are sucessfully requested
                    this.challengeData[this.ads[i].identifier] = [];
                    if (tAd.complete) {

                        var loadedAds = this.ads[i].numads;

                        for (var j = 0; j < this.ads[i].loadedAds.length; j++) {
                            this.challengeData[this.ads[i].identifier].push(this.ads[i].loadedAds[j].cpm);
                            this.logger("CPM for single ad", this.ads[i].identifier, j, this.ads[i].loadedAds[j].cpm);
                            adCPM += parseFloat(this.ads[i].loadedAds[j].cpm);

                        }

                        tAd.totalCPM = adCPM;

                        // this is the best ad (highest CPM) but maybe we have some preferred ads
                        if (adCPM > highestCPM) {
                            highestCPM = adCPM;
                            bestAd = tAd;
                        }

                        // save the main ad if data available
                        if (i === "main") {
                            preferredAd = tAd;
                        } else if (currentLowestAdNum > loadedAds) {
                            currentLowestAdNum = loadedAds;
                            sencond_preferredAd = tAd;
                        }


                    } else {
                        this.challengeData[this.ads[i].identifier].push("no data received");
                        this.logger("can not compare " + this.ads[i].identifier, "no ads: " + this.ads[i].noBid, "or delayed");
                    }
                }
            }

            if (bestAd) {
                //always use the prefered ad when available
                if (preferredAd) {
                    bestAd = preferredAd;
                    this.logger("preferred Ad available. Ignore CPM Comparision");
                } else if (sencond_preferredAd) {
                    bestAd = sencond_preferredAd;
                    this.logger("2nd preferred Ad available. Ignore CPM Comparision");
                } else {
                    this.logger("preferred and 2nd preferred Ad not available use challenge ads instead");
                }

                if (bestAd.identifier !== this.options.identifier) {
                    this.challengeWon = true;
                }
                this.logger("Selected Ad: " + bestAd.identifier + " CPM: ", bestAd.totalCPM);
                this.checkBeforeRender(bestAd);

            } else {
                this.logger("no best ad available", this.ads);
                if (this.options.passback) {
                    this.handlePassback();
                } else {

                    if (this.secondTry && this.thirdTry) {
                        this.collapseParentFrame();
                    }
                    //choose some fallbacks
                    else if (this.secondTry) {
                        this.thirdTry = true;
                        this.tryToLoadFallback();
                    }
                    // try again
                    else {
                        this.secondTry = true;
                        this.tryToLoadAdsAgain();
                    }
                }
            }
        },

        tryToLoadAdsAgain: function () {
            this.logger("No Ads for rendering available try a senconds time");
            // this.forceSession = this.followUp = true;
            this.loadedAds = {};
            this.adsLoaded = {};
            this.loadedCreatives = [];
            this.adBuckets = {};
            this.adErrors = [];
            this.logs = [];
            this.ads = {};

            this.options.challenge = this.options.challenge ? this.options.challenge.join(",") : this.options.challenge;
            this.options.ctagid = this.options.ctagid ? this.options.ctagid.join(",") : this.options.ctagid;


            if(window.mappingTable && window.mappingTable[this.options.tagid]){
                this.options.member = 3741;
                this.options.tagid = window.mappingTable[this.options.tagid];
            }

            this.prepareTags();
        },

        tryToLoadFallback: function () {

            this.logger("No Ads for rendering available force fallback");
            // this.forceSession = this.followUp = true;
            this.loadedAds = {};
            this.adsLoaded = {};
            this.loadedCreatives = [];
            this.adBuckets = {};
            this.adErrors = [];
            this.logs = [];
            this.ads = {};

            //forced ads are on that seat
            this.options.member = 3646;
            //some old placement
            this.options.tagid = settings.tagid;
            var forceAds = {
                de: ["63342611", "63342512", "63340022", "62786656"],
                fr: ["64423481", "64423485", "64423489"],
                it: [],
                en: []
            };

            window.anConfigAd = {};
            this.getForcedAds = function () {
                var ads = forceAds[this.options.lang];
                var r = Math.round(Math.random() * (ads.length - 1));
                return {
                    forceCreativeId: ads.splice(r, 1)[0]
                }
            };

            this.options.challenge = this.options.challenge ? this.options.challenge.join(",") : this.options.challenge;
            this.options.ctagid = this.options.ctagid ? this.options.ctagid.join(",") : this.options.ctagid;
            this.prepareTags();

        },


        handlePassback: function () {
            if (this.inIframe()) {
                this.logglyLog({
                    type: "warning",
                    message: "can not show ad",
                    info: "redirecting to passback",
                    passbackUrl: this.options.passback
                });
                //CU
                window.location.href = decodeURIComponent(this.options.passback);
            } else {
                this.logglyLog({
                    type: "error",
                    message: "Passback defined but not in iframe"
                })
            }

        },


        // check if the ad we want to render is the main ad. Otherwise we have to load css and config.json first
        checkBeforeRender: function (ad) {
            var _this = this;

            ad = this.sortByCPM(ad);

            if (this.challengeWon) {
                this.logger("load css and json for " + ad.identifier);
                //overwrite the identifier to force the script to load css and json for the new identifier
                this.options.identifier = ad.identifier;
                this.config = undefined;
                // wait until new style is loaded and than render


                this.callbackAfterOptionsAssign = function () {
                    _this.loadStyle(function () {
                        _this.logger("new style loaded for " + _this.options.identifier);
                        _this.render(ad);
                    });

                };

                this.validateOptions();
            }
            // in this case we can render directly because style is available because in production it is rendered into the content, we just have to add it
            // here we are ignoring the case (only in preview) that the main css is loaded via http and slower than the appnexus response
            else {
                if (this.preReneredStyle) {
                    document.head.appendChild(this.preReneredStyle);
                }
                this.render(ad);
            }
        },

        render: function (ad) {
            if (this.isRendered) {
                this.logger("rendering invoked multiple time. Ingoring multiple rendring.");
                this.logglyLog({
                    type: "warning",
                    message: "rendering invoked multiple times"
                });

                return;
            }
            this.logger("render " + ad.identifier);

            var data = {
                content: '',
                identifier: ad.identifier,
                admarker: this.options.adMarker[this.options.lang]
            };


            this.adDataLog = [];

            for (var i = 0; i < ad.loadedAds.length; i++) {
                data.content += this.renderNativeAd(ad.loadedAds[i]);
            }

            var renderedAd = this.appendToBody(this.tmpl(this.options.wrapper, data));

            // just to be safe ;) Necessary for IE in challenge mode load event is fired twice..
            this.isRendered = true;

            this.initClickTracking(ad);

            if (this.options.script) {
                this.executeScript(this.options.script);
            }

            this.logger("Ad Render complete");
            this.logglyLog({
                type: "info",
                message: "elem rendered",
                renderedAds: ad.loadedAds.length,
                adData: this.adDataLog,
                renderTime: new Date().getTime() - this.startTime,
                challenge: this.options.challenge !== undefined,
                challengeWon: this.challengeWon,
                challengeData: this.challengeData ? this.challengeData : "no data available",
                cpm: (Math.floor(ad.totalCPM * 100) / 100),
                secondTry: this.secondTry || false,
                forcedFallback: this.thirdTry ? "true" : "false",
                layoutSwitch: ad.layoutSwitched || false, // says that ad was only rendered because of layoutswitch
                duplicates: ad.duplicatesFound || false,
                topAst: this.useTopAst || false,
                member : this.options.member.toString()
            });


            document.documentElement.setAttribute("lang", this.options.lang);

            this.addResizeTrigger();

            this.addImageErrorHandler(renderedAd);

        },


        addImageErrorHandler: function(ad){
            var imgs = ad.querySelectorAll('.adimage');
            for(var i=0; i<imgs.length; i++){
                if(imgs[i].nodeName.toLocaleLowerCase() === 'img'){
                    imgs[i].onerror = this.imageErrorHandler.bind(this,imgs[i],false);
                }else if(imgs[i].style.backgroundImage !== ''){
                    var hiddenImg = new Image();
                    hiddenImg.src = imgs[i].style.backgroundImage.slice(4, -1).replace(/"/g, "");
                    hiddenImg.onerror = this.imageErrorHandler.bind(this,imgs[i],true);
                }
            }
        },

        imageErrorHandler: function(img, bgImage){
          if(img){
              var orig = this.findOrigImage(img);
              if(orig){
                  if(bgImage){
                      var oldSrc = img.style.backgroundImage;
                      img.style.backgroundImage = 'url("'+orig+'")';
                  }else{
                      var oldSrc = img.getAttribute('src');
                      img.setAttribute('src',orig);
                  }

                  //only log if minified image is broken
                  if(oldSrc.indexOf(this.options.imageMinifyUrl) !== -1){
                      this.logglyLog({
                          type: "warning",
                          message : "minifying failed",
                          src : oldSrc,
                          bgImage : bgImage
                      })
                  }

              }else{
                  this.logglyLog({
                      type: "error",
                      message : "no orig image found",
                      bgImage : bgImage
                  })
              }
          }
        },

        findOrigImage: function(img){
            var i=0;
            var node = img;
            while(i<10){
                if(node.getAttribute('data-image-orig')){
                    return node.getAttribute('data-image-orig');
                }else{
                    node = node.parentElement;
                }
                i+=1;
            }
        },

        renderNativeAd: function (data) {

            var moreBtn = this.renderMoreBtn(data.native.clickUrl);


            var obj = {
                title: data.native.title.substring(0, 25), // LIMIT characters DASB-756
                img: data.native.image ? data.native.image.url : '',
                description: data.native.body.substring(0, 90),  // LIMIT characters DASB-756
                href: data.native.clickUrl,
                impression: '',
                //id: data.id,
                id: data.targetId,
                moreInTxt: this.options.moreInTxt ? moreBtn : '',
                moreOutTxt: !this.options.moreInTxt ? moreBtn : '',
                sponsored: data.native.sponsoredBy || ''
            };

            obj = this.generateMinifyImages(obj);


            // logging only
            this.adDataLog.push({
                title: data.native.title,
                description: data.native.body,
                img: obj.img,
                href: obj.href,
                creative: data.creativeId,
                exceedSpecs: data.native.body && data.native.body.length > 90 || data.native.title && data.native.title.length > 25
            });


            obj = this.addCustomFields(obj, data);

            // omg we do not have an impression and click pixel
            if (this.options.template.indexOf("{{impression}}") === -1) {
                this.logger("no impression pixel available. try creating one");
                this.logglyLog({
                    type: "warning",
                    message: "template does not contain tracking pixel."
                });
                // render the pixel before the last div
                this.options.template = this.options.template.replace(/<\/div>$/, "{{impression}}</div>");
            }


            //add impression pixels to the native ad
            if (data.native && data.native.impressionTrackers && data.native.impressionTrackers.length > 0) {
                var impressionTracker = data.native.impressionTrackers;
                for (var i = 0; i < impressionTracker.length; i++) {

                    // when we force a creative we need to remove the test=1 param to count correctly
                    if (this.thirdTry) {
                        impressionTracker[i] = impressionTracker[i].replace("&test=1", "");
                    }

                    this.logger("adding impression", data.targetId);
                    obj.impression += this.tmpl(this.options.trackingPixel, {
                        imgSrc: impressionTracker[i],
                        trackingPixelClass: this.options.trackingPixelClass
                    });
                }
            }

            // add the creative id
            this.options.template = this.options.template.replace(/<div/, '<div data-creative-id="' + data.creativeId + '" data-image-orig="'+ (obj.imgOrig || '') +'"');
            var renderedAd = this.tmpl(this.options.template, obj);

            return renderedAd;
        },

        generateMinifyImages: function(obj){
            if(this.options.imageMinifyUrl){
                obj.imgOrig  = obj.img;
                obj.img  = this.options.imageMinifyUrl + encodeURIComponent(obj.img) + this.options.imageMinifyOptions;
            }
            return obj;
        },

        // this function adds data custom data defined in the options/hash/config to the render obj
        addCustomFields: function (renderObj, dataObj) {
            if (this.options.customFields) {
                for (var i in this.options.customFields) {
                    if (this.options.customFields.hasOwnProperty(i)) {
                        renderObj[i] = this.options.customFields[i].split(".").reduce(this.stringToObjectPath, dataObj) || '';
                    }
                }
            }
            return renderObj;
        },

        // transforms a dot notated string into an object: a.b.c returns c in the object {a:b{c:""}}
        stringToObjectPath: function (obj, i) {
            if (obj) {
                return obj[i]
            }
        },

        renderMoreBtn: function (clickUrl) {
            var data = {
                more: this.options.more ? this.options.more : this.options.showMore ? this.options.moreText[this.options.lang] : '',
                moreNode: this.options.moreNode,
                href: clickUrl
            };

            return this.tmpl(this.options.moreBtn, data);
        },

        // function will fake resize to force dfp (if used) to fit the adslot to the correct size
        addResizeTrigger: function () {

            var imgs = document.getElementsByTagName('img');
            window.dispatchEvent(new Event('resize'));

            if (imgs && imgs.length > 0) {
                for (var i = 0; i < imgs.length; i++) {
                    if (imgs[i].className.indexOf("adimage") !== -1) {
                        imgs[i].onload = function () {
                            window.dispatchEvent(new Event('resize'));
                        }
                    }
                }
            }
        },


        // function sorts all ads by hightest cpm first to ensure that the best ad is at the top
        sortByCPM: function (ad) {

            this.logger("sort ads by cpm");

            try {
                ad.loadedAds = ad.loadedAds.sort(function (a, b) {
                    return b.cpm - a.cpm;
                });
            } catch (e) {
                this.logglyLog({
                    type: "error",
                    message: "can not sort by cpm",
                    ad: ad
                })
            }
            return ad;

        },

        initClickTracking: function (ad) {
            for (var i = 0; i < ad.loadedAds.length; i++) {
                if (ad.loadedAds[i].native && ad.loadedAds[i].native.clickTrackers && ad.loadedAds[i].native.clickTrackers.length > 0) {
                    for (var j = 0; j < ad.loadedAds[i].native.clickTrackers.length; j++) {
                        if (this.dnt) {
                            continue;
                        }
                        this.addClickTracking(ad.loadedAds[i].targetId, ad.loadedAds[i].native.clickTrackers[j]);
                    }
                }
            }
        },

        addClickTracking: function (id, trackingUrl) {
            var elem = document.getElementById(id);
            if (elem) {
                this.logger("add click tracking", elem);
                this.addEvent(elem, 'click', this.handleElemClick.bind(this, elem, trackingUrl))
            } else {
                this.logger("can not add click tracking!");
                this.logglyLog({
                    type: "error",
                    message: "can not ad click tracking. Maybe Id is missing"
                })
            }
        },

        handleElemClick: function (elem, trackingUrl, e) {
            this.setTrackingPixel(trackingUrl);
            this.openUrl(elem, e);
        },


        openUrl: function (elem, e) {
            var href = elem.getAttribute("data-href");

            if (!href) {
                var links = elem.getElementsByTagName("a");
                if (links && links[0]) {
                    href = links[0];
                }
            }

            // if we have a global clickthrough url combine it. Super for AB testing
            if (window.clickThroughUrl) {
                href = window.clickThroughUrl + href;
            }

            //just prevent default if we have a href. otherwise stick to browser default behavior
            if (href) {
                e.preventDefault();
                window.open(href);
            }

            this.logglyLog({
                type: "info",
                message: "elem clicked",
                href: href
            });
        },

        setTrackingPixel: function (trackingUrl) {

            // when we force a creative we need to remove the test=1 param to count correctly
            if (this.thirdTry) {
                trackingUrl = trackingUrl.replace("./bn=0/test=1/", "");
            }

            (new Image()).src = trackingUrl;
        },

        guessLangFromIdentifier: function (identifier) {
            var tLang = identifier.toLowerCase();
            var lang = "en";
            if (tLang.indexOf("_fr_") !== -1 || tLang.indexOf("_ro_") !== -1) {
                lang = "fr";
            } else if (tLang.indexOf("_it_") !== -1) {
                lang = "it";
            } else if (tLang.indexOf("_de_") !== -1) {
                lang = "de";
            }
            return lang;
        },

        parseNumadsFromIdentifier: function (identifier) {
            try {
                return parseInt(identifier.match(/\d+/)[0]);
            } catch (e) {
                return null;
            }
        },

        parseChallengeData: function () {
            var challenge = this.options.challenge;
            var ctagId = this.options.ctagid;
            if (!challenge || !ctagId) {
                return null;
            }
            var match = challenge.match(/\[*[\S,]+\]*/g);
            ctagId = ctagId.match(/\[*[\d,]+\]*/g);
            if (match && ctagId) {
                try {
                    this.options.challenge = JSON.parse("[\"" + match[0].match(/\[*\S+\]*/g)[0].replace(/\[|\]/gi, '').split(',').join('","') + "\"]");
                    this.options.ctagid = JSON.parse("[\"" + ctagId[0].match(/\[*\S+\]*/g)[0].replace(/\[|\]/gi, '').split(',').join('","') + "\"]");

                } catch (e) {
                    console.warn("can not parse challenge data challenge or ctagid", this.options.challenge, this.options.ctagid);
                    this.options.challenge = this.options.ctagid = [];
                }
            }

        },

        collapseParentFrame: function () {
            var type = "warning";
            var message = "can not show ad";
            var reason = "not enough ads for rendering";
            var info;

            this.logger("try to hide ad");
            /*
             if(this.useMRAID){
             if (mraid && mraid.getState() === 'loading') {
             mraid.addEventListener('ready', this.collapseParentFrame.bind(this));
             return;
             }else if(mraid){
             mraid.close();
             info = "closing wrapper with mraid";
             }else{
             type = "error";
             info = "MRAID not available";
             }
             }
             */
            if (this.useMRAID || this.inIframe()) {
                var totmConnect = document.createElement('script');
                totmConnect.src = "https://tdn.da-services.ch/libs/totmConnect.js";
                document.body.appendChild(totmConnect);
                totmConnect.onload = function () {
                    window.connector.push({close: true});
                };
            }

            try {
                info = "collapsing iframe";
                window.parent.document.getElementById(window.frameElement.id).style.height = "0px";
            } catch (e) {
                info = "can not hide iframe because not same origin";
            }
            document.documentElement.style.background = "#F2F2F2";

            this.logglyLog({
                type: type,
                message: message,
                info: info,
                reason: reason,
                renderTime: new Date().getTime() - this.startTime,
                adsRequested: this.options.numads,
                adsAvailable: this.options.numads - this.ads["main"].noBid,
                secondTry: this.secondTry || false,
                forcedFallback: this.thirdTry || false
            });

            if (typeof window.noAdCallback === "function") {
                window.noAdCallback.call();
            }

        },

        // checks if script should include MRAID
        checkForMRAID: function () {
            if (this.options.supplyType === "mobile_app" || (window.anConfigAd && window.anConfigAd.supplyType === "mobile_app")) {
                this.addMRAID();
                this.useMRAID = true;
            } else {
                this.useMRAID = false;
            }
            this.logger("use MRAID", this.useMRAID);
        },


        // function checks if error occur because of adblock or something else
        checkForBlock: function () {
            this.logglyLog({
                type: "info",
                message: "ad errors received",
                errors: this.adErrors
            })
        },

        // ###########################  HELPER  ###########################

        addEvent: function (elem, evnt, func) {
            if (elem.addEventListener) // W3C DOM
                elem.addEventListener(evnt, func, false);
            else if (elem.attachEvent) { // IE DOM
                elem.attachEvent("on" + evnt, func);
            } else { // No much to do
                elem[evnt] = func;
            }
        },

        appendToBody: function (content) {
            //check where to render
            var domNode = this.createDomNodeFromHTML(content)[0];
            document.body.appendChild(domNode);
            return domNode;

        },
        executeScript: function (script) {
            window.eval(script);
        },
        tmpl: function (template, data) {
            var prop, regProp, html = template;
            for (prop in data) {
                if (data.hasOwnProperty(prop)) {
                    regProp = new RegExp("{{" + prop + "}}", "gim");
                    html = html.replace(regProp, data[prop]);
                }
            }
            return html;
        },

        createDomNodeFromHTML: function (html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return div.childNodes;
        },

        loadStyle: function (cb) {
            var _this = this;
            this.logger("appending to head", this.options.scriptBase + '/' + this.options.identifier + "/style.css");

            if (this.preReneredStyle) {
                this.removeElement(this.preReneredStyle);
            }


            var head = window.document.getElementsByTagName('head')[0];
            var style = document.createElement('link');

            head.appendChild(style);
            style.setAttribute('rel', 'stylesheet');
            style.setAttribute('type', 'text/css');
            style.setAttribute('href', this.options.scriptBase + "/" + this.options.identifier + '/style.css');

            style.onload = function () {
                _this.styleLoaded = true;
                if (typeof cb === "function") {
                    cb.call(_this);
                }
            }
        },


        loadJSON: function (url, callback) {

            var _this = this;
            this.logger("loading json: ", url);

            var xobj = new XMLHttpRequest();
            var href = this.settings.scriptBase + '/' + this.options.identifier + '/' + url;

            var timeout = setTimeout(function () {
                _this.logger("Timeout exceeded");
                _this.loadConfigWithJSONP("timeout");
            }, 3000);

            xobj.open('GET', href, true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState === 4) {
                    clearTimeout(timeout);
                }
                if (xobj.readyState == 4 && xobj.status == "200") {
                    callback(xobj.responseText);
                } else if (xobj.readyState == 4 && xobj.status != "200") {
                    _this.loadConfigWithJSONP(xobj.status);
                }
            };
            xobj.send(null);


        },


        loadConfigWithJSONP: function (status) {

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = this.settings.scriptBase + '/' + this.options.identifier + '/' + this.options.jsonpUrl;
            document.getElementsByTagName('head')[0].appendChild(script);


            this.logger("Config could not be loaded. Load config with jsonp");
            this.logglyLog({
                type: "info",
                message: "config.json could not loaded fallback to jsonp",
                status: status
            }, true);

        },


        addLoggly: function () {

            if (this.options.logging === "false" && !this.options.debug) {
                return;
            }
            // sampling 5% if not in sampling group disable loggly logging
            if (Math.random() > this.options.sampling.main && !this.options.debug) {
                this.logger("logging disabled");
                this.options.logging = "false";
                return;
            }

            this.logger("Loggly enabled");

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://cloudfront.loggly.com/js/loggly.tracker-2.1.min.js';
            document.getElementsByTagName('head')[0].appendChild(script);

            window._LTracker.push(
                {
                    'logglyKey': 'b0e65e43-6b7e-42e8-b0e5-a7323592ec04',
                    'sendConsoleErrors': false,
                    'tag': 'loggly-jslogger'
                });
        },

        logglyLog: function (data, forceLog) {
            if (data.error) {
                console.error(data.message);
            }
            if (this.options.logging === "false") {
                return;
            }


            // with this param once set you can log all events in this session from now on
            this.forceSession = this.forceSession ? true : forceLog;
            // log the first occurrence as the normal event and all following as type followup to do better analysis
            if (this.forceSession) {
                if (this.followUp) {
                    data.type = "followup";
                }
                this.followUp = true;
            }


            //extra sampling for log types when not in debug mode
            if (!this.options.debug && !this.forceSession) {
                switch (data.type) {
                    case "info" :
                        if (Math.random() > this.options.sampling.info) {
                            return
                        }
                        break;
                    case "warning" :
                        if (Math.random() > this.options.sampling.warning) {
                            return
                        }
                        break;
                    case "error" :
                        if (Math.random() > this.options.sampling.error) {
                            return
                        }
                        break;
                    default :
                        this.logger("loggly no type defined");
                        return;
                }
            }

            // adding default values to each log
            data.identifier = this.options.identifier;
            data.userAgent = navigator.userAgent;
            data.appType = window.anConfigAd ? window.anConfigAd.supplyType : "none";
            // just pass the url when warning or error
            data.url = window.location.href;
            data.inIframe = this.inIframe();
            data.target = this.scriptUrl.join("#");
            data.mraid = this.useMRAID;
            data.referrer = document.referrer.replace();
            data.version = this.options.version;
            data.environment = this.options.environment;

            var customer = this.options.identifier.split('_');
            data.customer = customer[customer.length - 1].replace('.', '');

            window._LTracker.push(data);
        },

        addAppNexusLib: function () {

            //check if we can access the parent ast.js
            try {
                if (top && top.apntag) {
                    window.apntag = top.apntag;
                    this.useTopAst = true;
                    this.logger("use top AST.js");
                }
            } catch (e) {
            }


            window.apntag = window.apntag || {};
            //create a queue on the apntag object
            apntag.anq = apntag.anq || [];

            var _this = this;

            if (!this.useTopAst) {
                //load ast.js - async
                (function () {
                    var d = document, scr = d.createElement('script'), pro = d.location.protocol,
                        tar = d.getElementsByTagName("head")[0];
                    scr.type = 'text/javascript';
                    scr.async = true;
                    if (_this.options.useOldAst) {
                        scr.src = ((pro === 'https:') ? 'https' : 'http') + '://d1rkf0bq85yx06.cloudfront.net/anprebid/src/oldAst.js';
                    } else {
                        scr.src = ((pro === 'https:') ? 'https' : 'http') + '://acdn.adnxs.com/ast/ast.js';
                    }

                    if (!apntag.l) {
                        apntag.l = true;
                        tar.insertBefore(scr, tar.firstChild);
                    }
                })();
            }
        },

        addMRAID: function () {
            this.logger("appending mraid.js to head");
            var head = document.getElementsByTagName('head').item(0),
                js = document.createElement('script'),
                s = 'mraid.js';
            js.setAttribute('type', 'text/javascript');
            js.setAttribute('src', s);
            head.appendChild(js);
        },

        // This function is called with the build css in production mode
        prepareStyle: function (type, css) {
            var head = document.head || document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            this.preReneredStyle = style;
            return style;
        },

        removeElement: function (element) {
            element && element.parentNode && element.parentNode.removeChild(element);
        },

        logger: function () {
            //save all logs
            this.logs.push(arguments);

            if (this.options && this.options.debug) {
                var t = this.lastTs ? new Date().getTime() - this.lastTs : undefined;
                this.totalTime = this.totalTime !== undefined ? this.totalTime + t : 0;
                console.log(Array.prototype.slice.call(arguments), t !== undefined ? t + "/" + this.totalTime + "ms" : 0 + "/" + this.totalTime + "ms");
            }
            this.lastTs = new Date().getTime();
        },

        //merge two objects
        merge: function (obj1, obj2) {
            var obj3 = {};
            for (var attrname in obj1) {
                if (obj1.hasOwnProperty(attrname)) {
                    obj3[attrname] = obj1[attrname];
                }

            }
            for (var attrname2 in obj2) {
                if (obj2.hasOwnProperty(attrname2)) {
                    obj3[attrname2] = obj2[attrname2];
                }
            }
            return obj3;
        },

        inIframe: function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },


        generateIdfa: function () {
            return this.getRandomString(8) + "-" + this.getRandomString(4) + "-" + this.getRandomString(4) + "-" + this.getRandomString(4) + "-" + this.getRandomString(12);
        },

        generateAaid: function () {
            return this.getRandomString(8) + "-" + this.getRandomString(4) + "-" + this.getRandomString(4) + "-" + this.getRandomString(4) + "-" + this.getRandomString(12);
        },

        getRandomString: function (length) {
            var text = "";
            var possible = "abcdef0123456789";
            for (var i = 0; i < length; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        },


        parseHash: function () {
            try {
                this.hashOptions = {};
                var temp = this.scriptTag.src.split('#');
                this.scriptUrl = temp;

                if (temp.length > 1) {
                    this.hash = decodeURIComponent(temp[1]);
                    return JSON.parse('{"' + this.hash.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                }
            } catch (e) {
                this.logglyLog({
                    tag: "error",
                    message: "hash parsing failed"
                })
            }
            return {};
        },
        showLogs: function () {
            for (var i = 0; i < this.logs.length; i++) {
                console.log(this.logs[i]);
            }
        }
    };
    return Renderer;
})();





//var adRenderer = new ch.tam.addnexusRender(window.renderingConfig);

