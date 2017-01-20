
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
      idPrefix : 'ad-',
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

  var Renderer = function(){
    var _this = this;
    this.settings = settings;

    this.scriptTag = document.getElementsByTagName('script');
    var index = this.scriptTag.length - 1;
    this.scriptTag = this.scriptTag[index];

    this.addAppNexusLib();
    this.validateOptions(function(){
       _this.init();
    });
  };

  Renderer.prototype = {

    init: function(){
      var _this = this;

      this.loadedAds = [];
      this.adsLoaded = 0;

      this.addStyle();

      apntag.anq.push(function() {
        _this.pushTags();
      });
    },

    // validates the options object to check if ads can be requested and rendered
    // options priority:
    // 1. settings by hash
    // 2. settings by json
    // 3. default settings
    validateOptions: function(callback){
        var _this = this;

        try{
            //this.options = JSON.parse('{"' + decodeURI(location.hash.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
            this.options = JSON.parse('{"' + this.scriptTag.src.split('#')[1].replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        }
        catch(e){
            console.error("No or malformed options passed");
            this.options = {};
        }

        this.options.identifier = this.options.identifier || this.settings.identifier;

        //loading the config json to override settings
        this.loadJSON('pages/' +this.options.identifier + '/' + this.settings.jsonUrl,function(json){
            try{
                json = JSON.parse(json);
            }catch(e){
                console.error("malformed settings json!", json);
                json = {};
            }
            //checking the "more btn" rendering
            _this.options.moreInTxt = _this.options.moreInTxt ? _this.options.moreInTxt === "true" : json.moreInTxt || _this.settings.moreInTxt;
            _this.options.moreNode = _this.options.moreNode ? _this.options.moreNode : json.moreNode || _this.settings.moreNode || _this.settings.moreNode;
            _this.options.showMore = _this.options.showMore ? _this.options.showMore === "true" : json.showMore || _this.settings.showMore;
            _this.options.more = _this.options.more ? _this.options.more : json.more || null;

            var guessedNumads;
            try{
                guessedNumads = parseInt(_this.options.identifier.match(/\d+/)[0]);
            }catch(e){
                guessedNumads = null;
            }

            _this.options.numads = _this.options.numads ? parseInt(_this.options.numads) : json.numads || guessedNumads || this.settings.numads;
            _this.options.tagid = _this.options.tagid ? parseInt(_this.options.tagid) : json.tagid || _this.settings.tagid;
            _this.options.member = _this.options.member ? parseInt(this.options.member) : json.member || _this.settings.member;
            //language is guessed by the identifier when not in hash-options or in json
            _this.options.lang = _this.options.lang ? _this.options.lang : json.lang ? json.lang.toLowerCase() : (_this.options.identifier.indexOf('_DE_') !== -1 ? 'de' : _this.options.identifier.indexOf('_FR_') !== -1 ? 'fr' : 'it');



            if(typeof callback === "function"){
                console.log(_this.options);
                callback.call();
            }
        });



    },

    pushTags: function(){
      //set global page options
      apntag.setPageOpts({
        member: parseInt(this.options.member) || this.settings.member,
        user : {
            language : this.options.lang.toUpperCase()
        }
      });



      for(var i=0; i< this.options.numads; i++){
        apntag.defineTag({
          tagId: parseInt(this.options.tagid),
          allowedFormats: ['native'],
          allowSmallerSizes : true,
          sizes: [[1,1]],
          targetId: this.settings.idPrefix+i,
          prebid : true
        });
        apntag.onEvent('adAvailable', this.settings.idPrefix+i, this.adAvailable.bind(this,this.settings.idPrefix+i));
      }
      apntag.loadTags();
    },

    adAvailable: function(id,data){
      this.adsLoaded += 1;
      data.id = id;
      this.loadedAds.push(data);
      //wait for all ads and then render
      if(this.adsLoaded === this.options.numads){
         this.render();
      }
    },

    render: function(){
        var data= {
            content : '',
            identifier : this.options.identifier,
            admarker : this.settings.adMarker[this.options.lang]
        };

        for(var i=0; i<this.loadedAds.length; i++){
            data.content += this.renderNativeAd(this.loadedAds[i]);
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

    trackClick: function(elem,trackingUrl,e){
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
        style.setAttribute('href', './pages/' + this.options.identifier + '/' + 'style.css');
    },

    loadJSON: function(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
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
        //load ast.js - async
        (function() {
            var d = document, scr = d.createElement('script'), pro = d.location.protocol,
                tar = d.getElementsByTagName("head")[0];
            scr.type = 'text/javascript';  scr.async = true;
            scr.src = ((pro === 'https:') ? 'https' : 'http') + '://acdn.adnxs.com/ast/ast.js';
            if(!apntag.l){apntag.l=true; tar.insertBefore(scr, tar.firstChild);}
        })();
    }



  };
  return Renderer;
})();

var adRenderer = new ch.tam.addnexusRender();