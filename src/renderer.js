
var ch = ch || {};
ch.tam = ch.tam || {};

ch.tam.addnexusRender = (function(){

    "use strict";

  var settings = {
      identifier : 'ppn_sb_billboard3_DE_20min', //fallback
      member : 3646, // fallback variables
      numads : 4, // fallback variables
      tagid : 9518829, // fallback variables
      jsonUrl : 'config.json',
      idPrefix : 'main',
      adMarker : {
        de : 'Anzeige',
        fr : 'Publicité',
        it : 'Pubblicità'
      },
      more : {
          de : 'Mehr ..',
          fr : 'plus',
          it : 'più'
      },
      challengeTimeout : 400,
      trackingPixelClass: 'pixel',
      moreNode : 'div',
      showMore : false,
      moreInTxt : false,
      moreBtn : '<{{moreNode}} class="url"><a target="_blank" href="{{href}}">{{more}}</a></{{moreNode}}>',
      trackingPixel : '<img class="{{trackingPixelClass}}" src="{{imgSrc}}" width="0" height="0" style="display:none"/>',
      wrapper : '<div class="{{identifier}}"><div class="ppncaption">Werbung</div><div id="ppninnerbox" class="ppninnerbox">{{content}}</div><div class="tnlogo"><a href="https://goo.gl/gJLreW" target="_blank">{{admarker}}</a></div>',
      template : '<div class="singlebox bottom left right" id="{{id}}" data-href="{{href}}"><a target="_blank" href="{{href}}"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="{{href}}">{{title}}</a></div><div class="text"><a target="_blank" href="{{href}}">{{description}} </a>{{moreInTxt}}</div>{{moreOutTxt}}{{impression}}</div>'
      //template : '<div class="singlebox bottom left right" id="{{id}}"><a target="_blank" href="{{href}}"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="{{href}}">{{title}}</a></div><div class="text"><a target="_blank" href="{{href}}">{{description}}</a></div><div class="url"><a target="_blank" href="{{href}}"></a></div>{{impression}}</div>'
  };

  var Renderer = function(config){
        this.config = config;
        this.init();
  };

  Renderer.prototype = {

    init: function(){
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


        this.validateOptions(function(){
            _this.addAppNexusLib();
            if(!_this.config){
                _this.addStyle();
            }
            apntag.anq.push(function() {
                _this.prepareTags();
            });
        });
    },

    // validates the options object to check if ads can be requested and rendered
    // options priority:
    // 1. settings by hash
    // 2. settings by json or inline rendered
    // 3. default settings
    validateOptions: function(callback){
        var _this = this;
        //parsing the hash
        try{
            var temp = this.scriptTag.src.split('#');
            this.baseUrl = temp[0].replace('src/renderer.js','pages/'); //only for preview
            if(temp.length > 1){
                this.hash = temp[1];
                this.options = this.merge(this.options, JSON.parse('{"' + this.hash.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'));
            }
        }
        catch(e){
            console.error("No or malformed options passed");
        }

        if(!this.options.identifier){
            if(this.config && this.config.identifier){
                this.options.identifier = this.config.identifier;
            }else{
                this.options.identifier = this.settings.identifier;
            }
        }


        // if the json is rendered into the file we do not need to load it
        if(this.config){
            _this.setOptions(this.config,callback);
        }else{
            //loading the config json to override settings
            this.loadJSON(this.settings.jsonUrl,function(json){
                try{
                    json = JSON.parse(json);
                }catch(e){
                    console.error("malformed settings json!", json);
                    json = {};
                }
                _this.setOptions(json,callback);
            });
        }
    },

    setOptions : function(json, callback){

        var _this = this;
        //checking the "more btn" rendering
        _this.options.moreInTxt = _this.options.moreInTxt ? _this.options.moreInTxt === "true" : json.moreInTxt || _this.settings.moreInTxt;
        _this.options.moreNode = _this.options.moreNode ? _this.options.moreNode : json.moreNode || _this.settings.moreNode || _this.settings.moreNode;
        _this.options.showMore = _this.options.showMore ? _this.options.showMore === "true" : json.showMore || _this.settings.showMore;
        _this.options.more = _this.options.more ? _this.options.more : json.more || null;

        _this.options.numads = _this.options.numads ? parseInt(_this.options.numads) : json.numads || this.parseNumadsFromIdentifier(this.options.identifier) || this.settings.numads;
        _this.options.tagid = _this.options.tagid ? parseInt(_this.options.tagid) : json.tagid || _this.settings.tagid;
        _this.options.member = _this.options.member ? parseInt(this.options.member) : json.member || _this.settings.member;
        //language is guessed by the identifier when not in hash-options or in json
        _this.options.lang = _this.options.lang ? _this.options.lang : json.lang ? json.lang.toLowerCase() : _this.guessLangFromIdentifier(this.options.identifier);

        if(typeof callback === "function"){
            this.logger(_this.options);
            callback.call();
        }
    },

    prepareTags: function(){
        var cNums;
        //generate main tags
        var tags = this.generateTagArray(this.options.tagid, this.options.numads, this.settings.idPrefix);
        //store the numads for each bucket so that the adavailable function knows when one bucket is fully loaded/available
        this.ads["main"] = {
            identifier : this.options.identifier,
            numads:  this.options.numads,
            adsLoaded : 0,
            loadedAds : [],
            complete : false
        };

        //if challenges available get challengers ads array
        if(this.options.challenge && this.options.ctagid){
            this.parseChallengeData();
            for(var i=0; i < this.options.challenge.length; i++){
                cNums = this.parseNumadsFromIdentifier(this.options.challenge[i]);
                tags = tags.concat(this.generateTagArray(this.options.ctagid[i],cNums,"challenge"+i));
                this.ads["challenge"+i] = {
                    identifier : this.options.challenge[i],
                    numads:  cNums,
                    adsLoaded : 0,
                    loadedAds : [],
                    complete : false
                };
            }
            this.options.challengeNumAds = this.parseNumadsFromIdentifier(this.options.challenge);
            tags = tags.concat(this.generateTagArray(this.options.ctagid, this.options.challengeNumAds, "challenge"));
        }
        this.pushTags(tags);

    },

    generateTagArray:function(tagId,numads,prefix){
        var arr = [];
        for(var i=0; i< numads; i++) {
            arr.push({
                tagId: parseInt(tagId),
                allowedFormats: ['native'],
                allowSmallerSizes: true,
                sizes: [[1, 1]],
                targetId: prefix + i,
                prebid: true
            });
            apntag.onEvent('adAvailable', prefix + i, this.adAvailable.bind(this, prefix + "-" + i, prefix));
        }
        return arr;
    },

    pushTags: function(tags){
      //set global page options
      apntag.setPageOpts({
        member: parseInt(this.options.member) || this.settings.member,
        user : {
            language : this.options.lang.toUpperCase()
        }
      });
      for(var i=0; i<tags.length; i++){
          apntag.defineTag(tags[i]);
      }
      apntag.loadTags();

      this.registerTimeout();

    },

    registerTimeout: function(){
        var _this = this;
        this.loadTimeout = setTimeout(function(){
            _this.logger("load tag timeout exceeded");
            if(_this.checkIfOneTagIsLoaded()){
                _this.compareCPMs();
            }else{
                _this.timeoutExceeded = true;
                _this.logger("no tag was loaded after timeout exceeded.");
            }
        },this.settings.challengeTimeout);
    },


    adAvailable: function(id, bucket, data){
      this.ads[bucket].adsLoaded +=1;
      data.id = id;
      this.ads[bucket].loadedAds.push(data);
      //wait for all ads and then render
      if(this.ads[bucket].adsLoaded === this.ads[bucket].numads){
          this.logger(bucket, "ready");
          this.ads[bucket].complete = true;
          //when all ads are ready or timeout is allready exceeded take the first finished ad
          if(this.checkIfAllTagsAreLoaded() || this.timeoutExceeded){
              this.compareCPMs();
          }
      }
    },

    checkIfOneTagIsLoaded:function(){
        for(var i in this.ads){
            if(this.ads[i].complete){
                return true;
            }
        }
        return false;
    },

    checkIfAllTagsAreLoaded: function(){
        for(var i in this.ads){
             if(!this.ads[i].complete){
                 return false;
             }
        }
        return true;
    },

    compareCPMs: function(){
        this.logger("compare CPMs");
        if(this.loadTimeout){
            clearTimeout(this.loadTimeout);
        }
        var adCPM = 0;
        var highestCPM = -1;
        var bestAd;
        var tAd;
        for(var i in this.ads){
            tAd = this.ads[i];
            if(tAd.complete){
                for(var j=0; j<this.ads[i].loadedAds.length; j++){
                    adCPM += parseInt(this.ads[i].loadedAds[j].cpm);
                }
                this.logger("CPM for", this.ads[i].identifier, adCPM);

                if(adCPM > highestCPM){
                    highestCPM = adCPM;
                    bestAd = this.ads[i];
                }

            }else{
                this.logger("can not compare",  this.ads[i].identifier, "because no or delayed response");
            }
        }
        this.logger("highest cpm",bestAd.identifier ,"CPM: "+highestCPM);
        this.checkBeforeRender(bestAd);
    },

    // check if the ad we want to render is the main ad. Otherwise we have to load css and config.json first
    checkBeforeRender: function(ad){
        var _this = this;
        if(ad.identifier !== this.options.identifier){
         this.logger("load css and json for", ad.identifier);
         this.options.identifier = ad.identifier;
         this.validateOptions(function(){
             _this.addStyle();
             _this.render(ad);
         });

        }else{
            this.render(ad);
        }
    },

    render: function(ad){
        this.logger("render", ad.identifier);
        var data = {
            content : '',
            identifier : ad.identifier,
            admarker : this.settings.adMarker[this.options.lang]
        };

        for(var i=0; i<ad.loadedAds.length; i++){
            data.content += this.renderNativeAd(ad.loadedAds[i]);
        }
        this.appendToBody(this.tmpl(this.settings.wrapper, data));

        this.initClickTracking();
    },

    renderNativeAd: function(data){

        var moreBtn = this.renderMoreBtn(data.native.clickUrl);

        var obj = {
            title : data.native.title,
            img : data.native.mainMedia[0].url,
            description : data.native.description,
            href : data.native.clickUrl,
            impression : '',
            id: data.id,
            moreInTxt : this.options.moreInTxt ? moreBtn : '',
            moreOutTxt : !this.options.moreInTxt ? moreBtn : ''
        };

        //add impression pixels to the native ad
        if(data.native && data.native.impressionTrackers && data.native.impressionTrackers.length >0){
           var impressionTracker = data.native.impressionTrackers;
            for(var i=0; i<impressionTracker.length; i++){
                obj.impression +=  this.tmpl(this.settings.trackingPixel, {imgSrc: impressionTracker[i], trackingPixelClass:this.settings.trackingPixelClass});
            }
        }
        return this.tmpl(this.settings.template, obj);
    },

    renderMoreBtn: function(clickUrl){
        var data = {
            more : this.options.more ? this.options.more : this.options.showMore ? this.settings.more[this.options.lang] : '',
            moreNode : this.options.moreNode,
            href : clickUrl
        };

        return this.tmpl(this.settings.moreBtn,data);
    },

    initClickTracking: function(){
        for(var i=0; i<this.loadedAds.length; i++){
            if(this.loadedAds[i].native && this.loadedAds[i].native.clickTrackers && this.loadedAds[i].native.clickTrackers.length >0){
                for(var j=0; j<this.loadedAds[i].native.clickTrackers.length; j++){
                    this.addClickTracking(this.settings.idPrefix + i, this.loadedAds[i].native.clickTrackers[0]);
                }
            }
        }
    },

    addClickTracking: function(id, trackingUrl){
        // find all a-tag in the specified ad and add event listener to them
        var elem = document.getElementById(id);
        if(elem){
            this.addEvent(elem,'click',this.handleElemClick.bind(this,elem,trackingUrl))
        }
    },

    handleElemClick: function(elem,trackingUrl,e){
        this.trackClick(elem,trackingUrl,e);
        this.openUrl(elem,e);
    },

    trackClick: function(elem,trackingUrl){
        this.setTrackingPixel(elem,trackingUrl);

    },

    openUrl: function(elem,e){
        var href = elem.getAttribute("data-href");
        //just prevent default if we have a href. otherwise stick to browser default behavior
        if(href){
            e.preventDefault();
            window.open(href);
        }
    },

    setTrackingPixel: function(elem,trackingUrl){
        var pixel = elem.getElementsByClassName(this.settings.trackingPixelClass);
        if(pixel && pixel.length > 0){
            pixel[0].src = trackingUrl;
        }
    },

    guessLangFromIdentifier: function(identifier){
          return identifier.indexOf('_DE_') !== -1 ? 'de' : identifier.indexOf('_FR_') !== -1 ? 'fr' : 'it';
      },

    parseNumadsFromIdentifier: function(identifier){
      try{
          return parseInt(identifier.match(/\d+/)[0]);
      }catch(e){
          return  null;
      }
    },

    parseChallengeData: function(){
        var challenge = this.options.challenge;
        var ctagId = this.options.ctagid;
        if(!challenge || !ctagId){
            return null;
        }
        var match = challenge.match(/\[*[\S,]+\]*/g);
        var ctagId = ctagId.match(/\[*[\d,]+\]*/g);
        if(match && ctagId){
            try{
                this.options.challenge = JSON.parse("[\"" + match[0].match(/\[*\S+\]*/g)[0].replace(/\[|\]/gi,'').split(',').join('","') + "\"]");
                this.options.ctagid = JSON.parse("[\"" + ctagId[0].match(/\[*\S+\]*/g)[0].replace(/\[|\]/gi,'').split(',').join('","') + "\"]");

            }catch(e){
                console.warn("can not parse challenge data challenge or ctagid", this.options.challenge,this.options.ctagid);
                this.options.challenge =  this.options.ctagid = [];
            }
        }

    },

    // ###########################  HELPER  ###########################

    addEvent: function(elem, evnt, func){
      if (elem.addEventListener) // W3C DOM
          elem.addEventListener(evnt, func, false);
      else if (elem.attachEvent) { // IE DOM
          elem.attachEvent("on" + evnt, func);
      } else { // No much to do
          elem[evnt] = func;
      }
    },

    appendToBody: function(content){
      document.body.appendChild(this.createDomNodeFromHTML(content)[0]);
    },
    tmpl:function(template, data) {
        var prop, regProp, html = template;
        for (prop in data) {
            if(data.hasOwnProperty(prop)){
                regProp = new RegExp("{{" + prop + "}}", "gim");
                html = html.replace(regProp, data[prop]);
            }
        }
        return html;
    },

    createDomNodeFromHTML: function(html){
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.childNodes;
    },

    addStyle: function(){
        var head = window.document.getElementsByTagName('head')[0];
        var style = document.createElement('link');
        head.appendChild(style);
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        style.setAttribute('href', this.baseUrl  + this.options.identifier + '/style.css');
    },

    loadJSON: function(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', this.baseUrl  + this.options.identifier + '/' + url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }else if(xobj.readyState == 4 && xobj.status == "404"){
            callback("{}");
        }
    };
    xobj.send(null);
    },

    addAppNexusLib: function(){
        window.apntag = window.apntag || {};
        //create a queue on the apntag object
        apntag.anq = apntag.anq || [];

        if(this.options && !(this.options.debug === "true")){
            //load ast.js - async
            (function() {
                var d = document, scr = d.createElement('script'), pro = d.location.protocol,
                    tar = d.getElementsByTagName("head")[0];
                scr.type = 'text/javascript';  scr.async = true;
                scr.src = ((pro === 'https:') ? 'https' : 'http') + '://acdn.adnxs.com/ast/ast.js';
                if(!apntag.l){apntag.l=true; tar.insertBefore(scr, tar.firstChild);}
            })();
        }else{
            //for debugging
            apntag.anq.push = function(cb){cb.call()};
            apntag.setPageOpts = apntag.defineTag = apntag.onEvent = apntag.loadTags = function(){};
        }
    },

      // This function is called with the build css in production mode
     css : function(type, css){
         var head = document.head || document.getElementsByTagName('head')[0];
         var style = document.createElement('style');

         style.type = 'text/css';
         if (style.styleSheet){
             style.styleSheet.cssText = css;
         } else {
             style.appendChild(document.createTextNode(css));
         }
         head.appendChild(style);
     },

      logger: function(){
         if(this.options.debug){
             console.log(arguments);
         }
      },
      //merge two objects
      merge : function(obj1,obj2){
          var obj3 = {};
          for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
          for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
          return obj3;
      }

  };
  return Renderer;
})();

var adRenderer = new ch.tam.addnexusRender(window.renderingConfig);
