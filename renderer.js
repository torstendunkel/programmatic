
var ch = ch || {};
ch.tam = ch.tam || {};

ch.tam.addnexusRender = (function(){

    "use strict";

  var settings = {
      identifier : 'ppn_sb_billboard3_DE_20min', //fallback
      member : 3646, // fallback variables
      numads : 4, // fallback variables
      tagid : 9461257, // fallback variables
      idPrefix : 'ad-',
      adMarker : {
        de : 'Anzeige',
        fr : 'Publicité',
        it : 'Pubblicità'
      },
      trackingPixel : '<img class="pixel" src="{{imgSrc}}" width="0" height="0" style="display:none"/>',
      wrapper : '<div class="{{identifier}}"><div class="ppncaption">Werbung</div><div id="ppninnerbox" class="ppninnerbox">{{content}}</div><div class="tnlogo"><a href="https://goo.gl/gJLreW" target="_blank">{{admarker}}</a></div>',
      template : '<div class="singlebox bottom left right" id="{{id}}"><a target="_blank" href="{{href}}"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="{{href}}">{{title}}</a></div><div class="text"><a target="_blank" href="{{href}}">{{description}}</a></div><div class="url"><a target="_blank" href="{{href}}"></a></div>{{impression}}</div>'
  };

  var Renderer = function(){
    this.settings = settings;
    if(this.validateOptions()){
      this.init();
    }
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
    validateOptions: function(){
        try{
            this.options = JSON.parse('{"' + decodeURI(location.hash.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        }
        catch(e){
            this.options = {};
        }
        console.log(this.options);

        this.options.numads = parseInt(this.options.numads) || this.settings.numads;
        this.options.member = parseInt(this.options.member) || this.settings.member;
        this.options.identifier = this.options.identifier || this.settings.identifier;
        this.options.tagid = parseInt(this.options.tagid)    || this.settings.tagid;

        //guessing the language
        if(!this.options.lang){
            this.options.lang = this.options.identifier.indexOf('_DE_') !== -1 ? 'de' : this.options.identifier.indexOf('_FR_') !== -1 ? 'fr' : 'it';
        }

        return true;
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
        var obj = {
          title : data.native.title,
            img : data.native.mainMedia[0].url,
            description : data.native.description,
            href : data.native.clickUrl,
            impression : '',
            id: data.id
        };

        //add impression pixels to the native ad
        if(data.native && data.native.impressionTrackers && data.native.impressionTrackers.length >0){
           var impressionTracker = data.native.impressionTrackers;
            for(var i=0; i<impressionTracker.length; i++){
                obj.impression +=  this.tmpl(this.settings.trackingPixel, {imgSrc: impressionTracker[i]});
            }
        }
        return this.tmpl(this.settings.template, obj);
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
            this.addEvent(elem,'click',this.trackClick.bind(this,elem,trackingUrl))
        }
    },

    trackClick: function(elem,trackingUrl){
        elem.appendChild(this.createDomNodeFromHTML(this.tmpl(this.settings.trackingPixel,{imgSrc:trackingUrl}))[0]);
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
    }

  };
  return Renderer;
})();
