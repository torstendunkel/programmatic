var ch = ch || {};
ch.tam = ch.tam || {};

ch.tam.addnexusRender = (function () {

    "use strict";

    var settings = {
        identifier: 'ppn_sb_billboard3_DE_20min', //fallback
        member: 3646, // fallback variables
        numads: 4, // fallback variables
        tagid: 9518829, // fallback variables
        jsonUrl: 'config.json',
        idPrefix: 'main',
        adMarker: {
            de: 'Anzeige',
            fr: 'Publicité',
            it: 'Pubblicità'
        },
        moreText: {
            de: 'Mehr ..',
            fr: 'Plus ..',
            it: 'Più ..'
        },
        sampling : {
          main : 0.05, // main sampling all other types are multiplied with this. e.g. 5% of the users will send logs but only 10% of these 5% will send info logs
          error : 1,
          info : 0.1,
          warning: 0.2
        },
        challengeTimeout: 1000,
        trackingPixelClass: 'pixel',
        moreNode: 'div',
        showMore: false,
        logging : "false", // logging via loggly
        moreInTxt: false,
        moreBtn: '<{{moreNode}} class="url"><a target="_blank" href="{{href}}">{{more}}</a></{{moreNode}}>',
        trackingPixel: '<img class="{{trackingPixelClass}}" src="{{imgSrc}}" width="0" height="0" style="display:none"/>',
        wrapper: '<div class="{{identifier}}"><div class="ppncaption">Werbung</div><div id="ppninnerbox" class="ppninnerbox">{{content}}</div><div class="tnlogo"><a href="https://goo.gl/gJLreW" target="_blank">{{admarker}}</a></div>',
        template: '<div class="singlebox bottom left right" id="{{id}}" data-href="{{href}}"><a target="_blank" href="{{href}}"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="{{href}}">{{title}}</a></div><div class="text"><a target="_blank" href="{{href}}">{{description}} </a>{{moreInTxt}}</div>{{moreOutTxt}}{{impression}}</div>'

    };

    var Renderer = function (config) {

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
            this.adBuckets = {};

            this.ads = {};

            this.validateOptions(function () {
                _this.addAppNexusLib();
                if (!_this.config) {
                    _this.loadStyle();
                }
                apntag.anq.push(function () {
                    _this.prepareTags();
                });

                _this.checkForMRAID();
                _this.addLoggly();
            });
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

        setOptions: function (json, callback) {
            var _this = this;
            _this.hashOptions.numads = _this.hashOptions.numads || json.numads || this.parseNumadsFromIdentifier(this.options.identifier) || this.settings.numads;
            //language is guessed by the identifier when not in hash-options or in json
            _this.hashOptions.lang = _this.hashOptions.lang || json.lang || _this.guessLangFromIdentifier(_this.options.identifier);

            //save the identifier because it may be set by the checkbeforeRender function
            var tidentifier = this.options.identifier;
            this.options = this.merge(this.merge(this.settings, json), this.hashOptions);
            this.options.identifier = tidentifier;

            if (typeof callback === "function") {
                this.logger("Options set to",_this.options);
                callback.call();
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
                }
                this.options.challengeNumAds = this.parseNumadsFromIdentifier(this.options.challenge);
                tags = tags.concat(this.generateTagArray(this.options.ctagid, this.options.challengeNumAds, "challenge"));
            }
            this.logger("tags defined",tags);
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
                    prebid: true
                };




                //if defined merge the global AppNexus Config to the adObj
                if(window.anConfigAd){
                    this.logger("merging appnexus config ad");
                    try{
                        adObj = this.merge(adObj,window.anConfigAd);
                    }catch(e){
                        this.logglyLog({
                            type: "error",
                            message : "could not merge appnexus config ad"
                        });
                    }
                }else if(this.options.supplyType){
                    // in some cases we need to pass the appmode via the options and then we generate dummy app ids as well
                    adObj.supplyType = this.options.supplyType;
                }

                // if defined merge the global AppNexuFirst Config to the first adObj
                if(i==0 && window.anConfigFirst){
                    try{
                        this.logger("merging appnexus config ad for first ad");
                        if(window.anConfigFirst.forceCreativeId){
                            window.anConfigFirst.forceCreativeId = parseInt(window.anConfigFirst.forceCreativeId.match(/\d+/g)[0]);
                        }
                        adObj = this.merge(adObj,window.anConfigFirst);
                    }catch(e){
                        this.logglyLog({
                            type: "error",
                            message : "could not merge anConfigFirst"
                        });
                    }
                }
                arr.push(adObj);
                apntag.onEvent('adAvailable', prefix + i, this.adAvailable.bind(this, prefix + "-" + i, prefix));
                apntag.onEvent('adNoBid', prefix + i, this.adNoBid.bind(this, prefix + "-" + i, prefix));
                apntag.onEvent('adRequestFailure', prefix + i, this.handleAdError.bind(this, prefix + "-" + i, prefix));
                apntag.onEvent('adBadRequest', prefix + i, this.handleAdError.bind(this, prefix + "-" + i, prefix));
            }
            return arr;
        },

        loadAds: function (tags) {
            //set global page options
            var pageObj = {
                member: parseInt(this.options.member) || this.settings.member
            };
            if(window.anConfigPage){
                this.logger("merging appnexus config page");
                try{
                    pageObj = this.merge(pageObj,window.anConfigPage);
                }catch(e){
                    this.logglyLog({
                        type: "error",
                        message : "could not merge appnexus config page"
                    });

                }
            }else if(this.options.supplyType){
                // if supplytype set by options to app_mode generate dummy app ids
                var dummyDeviceId = {
                    device : {
                        deviceId : {
                            idfa : this.generateIdfa(),
                            aaid : this.generateAaid()
                        }
                    }
                };
                pageObj = this.merge(pageObj,dummyDeviceId);
            }


            apntag.setPageOpts(pageObj);

            for (var i = 0; i < tags.length; i++) {
                apntag.defineTag(tags[i]);
            }
            this.logger("sending AST requesst");
            apntag.loadTags();
        },

        adAvailable: function (id, bucket, data) {
            this.ads[bucket].adsLoaded += 1;
            data.id = id;
            this.ads[bucket].loadedAds.push(data);
            this.logger("ad available", id);
            this.checkBucketStatus(bucket);
        },

        adNoBid: function(id, bucket){
            this.ads[bucket].adsLoaded += 1;
            this.ads[bucket].noBid += 1;
            this.logger("received no bid", id);
            this.checkBucketStatus(bucket);

        },

        handleAdError : function(id, bucket, adObj, adError){
            this.logger("Ad Error received");
            this.logglyLog({
                type : "error",
                message : "ad Error received.",
                ad : adObj,
                error : adError
            });
            // treat as if there where no bid for this ad
            this.adNoBid(id,bucket);

        },

        checkBucketStatus: function(bucket){
            if (this.ads[bucket].adsLoaded === this.ads[bucket].numads) {
                this.logger(bucket, "ready");
                //when all requested ads are available then this bucket is complete
                if( this.ads[bucket].noBid === 0){
                    this.ads[bucket].complete = true;
                }
                //when all ads are ready compare their cpm
                if (this.checkIfAllBucketsAreReady()) {
                    this.compareCPMs();
                }
            }
        },

        checkIfAllBucketsAreReady: function () {
            for (var i in this.ads) {
                if (this.ads[i].adsLoaded !== this.ads[i].numads) {
                    return false;
                }
            }
            return true;
        },

        compareCPMs: function () {
            this.logger("compare CPMs", this.ads);

            var adCPM = 0;
            var highestCPM = -1;
            var bestAd;
            var tAd;
            this.challengeWon = false;

            for (var i in this.ads) {
                tAd = this.ads[i];
                // only start comparision when all ads in this bucket are sucessfully requested
                if (tAd.complete) {
                    for (var j = 0; j < this.ads[i].loadedAds.length; j++) {
                        adCPM += parseFloat(this.ads[i].loadedAds[j].cpm);
                    }
                    this.logger("CPM for " + this.ads[i].identifier + " " + adCPM);

                    if (adCPM > highestCPM) {
                        highestCPM = adCPM;
                        bestAd = this.ads[i];
                    }

                } else {
                    this.logger("can not compare "+ this.ads[i].identifier, "no ads: "+ this.ads[i].noBid, "or delayed");
                }
            }

            if(bestAd){
                if(bestAd.identifier !== this.options.identifier){
                    this.challengeWon = true;
                }
                bestAd.totalCpm = highestCPM;
                this.logger("highest cpm "+ bestAd.identifier + " CPM: " + highestCPM);
                this.checkBeforeRender(bestAd);

            }else{
                this.logger("no best ad available", this.ads);
                this.collapseParentFrame();
                return;
            }


        },

        // check if the ad we want to render is the main ad. Otherwise we have to load css and config.json first
        checkBeforeRender: function (ad) {
            var _this = this;

            ad = this.sortByCPM(ad);

            if (this.challengeWon) {
                this.logger("load css and json for "+ ad.identifier);
                //overwrite the identifier to force the script to load css and json for the new identifier
                this.options.identifier = ad.identifier;
                this.config = undefined;
                // wait until new style is loaded and than render
                this.validateOptions(function () {
                    _this.loadStyle(function(){
                        _this.logger("new style loaded for " + this.options.identifier);
                        _this.render(ad);
                    });
                });
            }
            // in this case we can render directly because style is available because in production it is rendered into the content, we just have to add it
            // here we are ignoring the case (only in preview) that the main css is loaded via http and slower than the appnexus response
            else {
                if(this.preReneredStyle){
                    document.head.appendChild(this.preReneredStyle);
                }
                this.render(ad);
            }
        },

        render: function (ad) {
            if(this.isRendered){
                this.logger("rendering invoked multiple time. Ingoring multiple rendring.");
                return;
            }
            this.logger("render "+ ad.identifier);

            var data = {
                content: '',
                identifier: ad.identifier,
                admarker: this.options.adMarker[this.options.lang]
            };

            for (var i = 0; i < ad.loadedAds.length; i++) {
                data.content += this.renderNativeAd(ad.loadedAds[i]);
            }
            this.appendToBody(this.tmpl(this.options.wrapper, data));

            // just to be safe ;) Necessary for IE in challenge mode load event is fired twice..
            this.isRendered  = true;

            this.initClickTracking(ad);

            this.logger("Ad Render complete");
            this.logglyLog({
                type : "info",
                message : "elem rendered",
                renderTime : new Date().getTime() - this.startTime,
                challenge : this.options.challenge !== undefined,
                challengeWon : this.challengeWon,
                cpm : Math.floor(ad.totalCpm * 100) /100
            });
        },

        renderNativeAd: function (data) {

            var moreBtn = this.renderMoreBtn(data.native.clickUrl);

            var obj = {
                title: data.native.title,
                img: data.native.mainMedia[0].url,
                description: data.native.description,
                href: data.native.clickUrl,
                impression: '',
                id: data.id,
                moreInTxt: this.options.moreInTxt ? moreBtn : '',
                moreOutTxt: !this.options.moreInTxt ? moreBtn : '',
                sponsored: data.native.sponsoredBy || ''
            };

            obj = this.addCustomFields(obj, data);

            // omg we do not have an impression and click pixel
            if(this.options.template.indexOf("{{impression}}") === -1){
                this.logger("no impression pixel available. try creating one");
                this.logglyLog({
                    type: "warning",
                    message : "template does not contain tracking pixel."
                });
                // render the pixel before the last div
                this.options.template = this.options.template.replace(/<\/div>$/,"{{impression}}</div>");
            }


            //add impression pixels to the native ad
            if (data.native && data.native.impressionTrackers && data.native.impressionTrackers.length > 0) {
                var impressionTracker = data.native.impressionTrackers;
                for (var i = 0; i < impressionTracker.length; i++) {
                    this.logger("adding impression",data.id);
                    obj.impression += this.tmpl(this.options.trackingPixel, {
                        imgSrc: impressionTracker[i],
                        trackingPixelClass: this.options.trackingPixelClass
                    });
                }
            }

            return this.tmpl(this.options.template, obj);
        },


        // this function adds data custom data defined in the options/hash/config to the render obj
        addCustomFields: function (renderObj, dataObj) {
            if (this.options.customFields) {
                for (var i in this.options.customFields) {
                    renderObj[i] = this.options.customFields[i].split(".").reduce(this.stringToObjectPath, dataObj) || '';
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

        // function sorts all ads by hightest cpm first to ensure that the best ad is at the top
        sortByCPM : function(ad){

            this.logger("sort ads by cpm");

            try{
                ad.loadedAds =  ad.loadedAds.sort(function(a,b){
                    return b.cpm - a.cpm;
                });
            }catch(e){
                this.logglyLog({
                    type : "error",
                    message : "can not sort by cpm",
                    ad : ad
                })
            }
            return ad;

        },

        initClickTracking: function (ad) {
            for (var i = 0; i < ad.loadedAds.length; i++) {
                if (ad.loadedAds[i].native && ad.loadedAds[i].native.clickTrackers && ad.loadedAds[i].native.clickTrackers.length > 0) {
                    for (var j = 0; j < ad.loadedAds[i].native.clickTrackers.length; j++) {
                        this.addClickTracking(ad.loadedAds[i].id, ad.loadedAds[i].native.clickTrackers[0]);
                    }
                }
            }
        },

        addClickTracking: function (id, trackingUrl) {
            // find all a-tag in the specified ad and add event listener to them
            var elem = document.getElementById(id);
            if (elem) {
                this.logger("add click tracking", elem);
                this.addEvent(elem, 'click', this.handleElemClick.bind(this, elem, trackingUrl))
            }else{
                this.logger("can not add click tracking!");
                this.logglyLog({
                    type : "error",
                    message : "can not ad click tracking. Maybe Id is missing"
                })
            }
        },

        handleElemClick: function (elem, trackingUrl, e) {
            this.setTrackingPixel(elem, trackingUrl);
            this.openUrl(elem, e);
        },


        openUrl: function (elem, e) {
            var href = elem.getAttribute("data-href");

            if(!href){
                var links = elem.getElementsByTagName("a");
                if(links && links[0]){
                    href = links[0];
                }
            }

            //just prevent default if we have a href. otherwise stick to browser default behavior
            if (href) {
                e.preventDefault();
                window.open(href);
            }

            this.logglyLog({
                type: "info",
                message : "elem clicked",
                href : href
            });
        },

        setTrackingPixel: function (elem, trackingUrl) {
            var pixel = elem.getElementsByClassName(this.settings.trackingPixelClass);
            if (pixel && pixel.length > 0) {
                this.logger("tracking click", elem);
                pixel[0].src = trackingUrl + 'timestamp=' +  Math.floor(Math.random()*1000000000);
            }else{
                this.logger("no tracking pixel defined");
                this.logglyLog({
                    type: "error",
                    message: "Click not tracked. Can not find tracking pixel."
                });
            }
        },

        guessLangFromIdentifier: function (identifier) {
            return identifier.indexOf('_DE_') !== -1 ? 'de' : identifier.indexOf('_FR_') !== -1 ? 'fr' : identifier.indexOf('_IT_') !== -1 ? 'it' : 'de';
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
            var ctagId = ctagId.match(/\[*[\d,]+\]*/g);
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

        collapseParentFrame : function(){
            var type = "warning";
            var message;
            this.logger("try to hide ad");

            if(this.useMRAID){
                if (mraid && mraid.getState() === 'loading') {
                    mraid.addEventListener('ready', this.collapseParentFrame.bind(this));
                    return;
                }else if(mraid){
                    mraid.close();
                    message = "closing wrapper with mraid";
                }else{
                    type = "error";
                    message = "MRAID not available";
                }
            }else if(this.inIframe()){
                try{
                    message = "collapsing iframe";
                    window.parent.document.getElementById(window.frameElement.id).style.height="0px";
                }catch(e){
                    message = "can not hide iframe because not same origin";
                }
            }else{
                message = "no iframe and no mraid available";
            }

            this.logglyLog({
                type: type,
                message : message,
                renderTime : new Date().getTime() - this.startTime,
                adsRequested : this.options.numads,
                adsAvailable : this.ads["main"].adsLoaded,
                adsNotAvaible : this.options.numads - this.ads["main"].adsLoaded
            });
        },

        // checks if script should include MRAID
        checkForMRAID : function(){
            if(this.options.supplyType === "mobile_app" ||  (window.anConfigAd && window.anConfigAd.supplyType === "mobile_app")){
                this.addMRAID();
                this.useMRAID = true;
            }else{
                this.useMRAID = false;
            }
            this.logger("use MRAID",this.useMRAID);
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
            document.body.appendChild(this.createDomNodeFromHTML(content)[0]);

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
            this.logger("appending to head", this.baseUrl + this.options.identifier + "/style.css");

            if(this.preReneredStyle){
                this.removeElement(this.preReneredStyle);
            }


            var head = window.document.getElementsByTagName('head')[0];
            var style = document.createElement('link');

            head.appendChild(style);
            style.setAttribute('rel', 'stylesheet');
            style.setAttribute('type', 'text/css');
            style.setAttribute('href', this.baseUrl + this.options.identifier + '/style.css');

            style.onload = function () {
                _this.styleLoaded = true;
                if(typeof cb === "function"){
                    cb.call(_this);
                }
            }
        },

        loadJSON: function (url, callback) {

            var _this = this;
            this.logger("loading json: ", url);

            var xobj = new XMLHttpRequest();
            //xobj.overrideMimeType("application/json");
            xobj.open('GET', this.baseUrl + this.options.identifier + '/' + url, true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    callback(xobj.responseText);
                } else if (xobj.readyState == 4 && xobj.status == "404") {
                    callback("{}");
                    _this.logglyLog({
                        type : "error",
                        message : "config.json could not loaded",
                        jsonUrl : _this.baseUrl + _this.options.identifier + '/' + url
                    })
                }
            };
            xobj.send(null);
        },

        addLoggly: function(){

            if(!this.options.logging === "false" && !this.options.debug){
                return;
            }
            // sampling 5% if not in sampling group disable loggly logging
            if(Math.random() > this.options.sampling.main && !this.options.debug){
                this.options.logging === "false";
                return;
            }

            this.logger("Loggly enabled");

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://cloudfront.loggly.com/js/loggly.tracker-2.1.min.js';
            document.getElementsByTagName('head')[0].appendChild(script);

            window._LTracker.push(
                {'logglyKey': 'b0e65e43-6b7e-42e8-b0e5-a7323592ec04',
                'sendConsoleErrors' : false,
                'tag' : 'loggly-jslogger'
                });
        },

        logglyLog: function(data){
            if(data.error){
                console.error(data.message);
            }
            if(!this.options.logging === "false"){
                return;
            }

            //extra sampling for log types when not in debug mode
            if(!this.options.debug){
                switch(data.type){
                    case "info" : if(Math.random() > this.options.sampling.info){return} break;
                    case "warning" : if(Math.random() > this.options.sampling.warning){return} break;
                    case "error" : if(Math.random() > this.options.sampling.error){return} break;
                    default : this.logger("loggly no type defined"); return;
                }
            }

            // adding default values to each log
            data.identifier = this.options.identifier;
            data.userAgent = navigator.userAgent;
            data.appType = window.anConfigAd ? window.anConfigAd.supplyType : "none";
            //just pass the url when warning or error
            data.url = data.type !== "info"? window.location.href : undefined;
            data.inIframe = this.inIframe();
            data.target = this.scriptUrl.join("#");
            data.mraid = this.useMRAID;
            data.mraidAvailable = typeof window.mraid !== undefined;
            window._LTracker.push(data);
        },

        addAppNexusLib: function () {
            window.apntag = window.apntag || {};
            //create a queue on the apntag object
            apntag.anq = apntag.anq || [];
            var _this = this;

                //load ast.js - async
                (function () {
                    var d = document, scr = d.createElement('script'), pro = d.location.protocol,
                        tar = d.getElementsByTagName("head")[0];
                    scr.type = 'text/javascript';
                    scr.async = true;
                    if(_this.options.useMyAst){
                        scr.src = "https://s3-eu-west-1.amazonaws.com/media.das.tamedia.ch/anprebid/src/myAst.js";
                    }else{
                        scr.src = ((pro === 'https:') ? 'https' : 'http') + '://acdn.adnxs.com/ast/ast.js';
                    }
                    if (!apntag.l) {
                        apntag.l = true;
                        tar.insertBefore(scr, tar.firstChild);
                    }
                })();
        },

        addMRAID: function(){
            this.logger("appending mraid.js to head");
            var head = document.getElementsByTagName('head').item(0),
                js = document.createElement('script'),
                s = 'mraid.js';
            js.setAttribute('type', 'text/javascript');
            js.setAttribute('src', s);
            head.appendChild(js);
        },

        // This function is called with the build css in production mode
        prepareStyle : function (type, css) {
            var head = document.head || document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            this.preReneredStyle = style;
        },

        removeElement: function (element) {
            element && element.parentNode && element.parentNode.removeChild(element);
        },

        logger: function () {
            if (this.options && this.options.debug) {
                var t = this.lastTs ?  new Date().getTime() - this.lastTs : undefined;
                this.totalTime = this.totalTime !== undefined ? this.totalTime+t : 0;
                console.log(Array.prototype.slice.call(arguments), t !== undefined ? t + "/" + this.totalTime + "ms" : 0 + "/" + this.totalTime + "ms");
            }
            this.lastTs =  new Date().getTime();
        },

        //merge two objects
        merge: function (obj1, obj2) {
            var obj3 = {};
            for (var attrname in obj1) {
                obj3[attrname] = obj1[attrname];
            }
            for (var attrname in obj2) {
                obj3[attrname] = obj2[attrname];
            }
            return obj3;
        },

        inIframe : function(){
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },


        generateIdfa : function(){
            return this.getRandomString(8) + "-" + this.getRandomString(4)+ "-" + this.getRandomString(4)+ "-" + this.getRandomString(4) + "-" + this.getRandomString(12);
        },

        generateAaid : function(){
            return this.getRandomString(8) + "-" + this.getRandomString(4)+ "-" + this.getRandomString(4)+ "-" + this.getRandomString(4) + "-" + this.getRandomString(12);
        },

        getRandomString: function(length){
                var text = "";
                var possible = "abcdef0123456789";
                for( var i=0; i < length; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
        },


        parseHash: function () {
            try {
                this.hashOptions = {};
                var temp = this.scriptTag.src.split('#');

                this.scriptUrl = temp;

                this.baseUrl = temp[0].replace(/src\/renderer.js\S*/g, 'pages/').replace(/build\/\S*/g, "pages/").replace(/stage\/\S*/g, "pages/"); //only for preview

                if (temp.length > 1) {
                    this.hash = temp[1];
                    return JSON.parse('{"' + this.hash.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                }
            }
            catch (e) {
                this.logglyLog({
                    tag : "error",
                    message: "hash parsing failed"
                })
            }
            return {};
        }
    };
    return Renderer;
})();
//var adRenderer = new ch.tam.addnexusRender(window.renderingConfig);

