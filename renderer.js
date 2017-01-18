
var ch = ch || {};
ch.tam = ch.tam || {};

ch.tam.addnexusRender = (function(){

  var settings = {
      member : 3646,
      numads : 3,
      tagid : 9461257,
      template : '<div class="singlebox bottom left right"><a target="_blank" href="http://ppn.ch/"><img class="adimage" alt="Werbung" src="{{img}}"/></a><div class="title"> <a target="_blank" href="http://ppn.ch/">{{title}}</a></div><div class="text"><a target="_blank" href="http://ppn.ch/">{{description}}</a></div><div class="url"><a target="_blank" href="http://ppn.ch/"></a></div> </div>'
  };

  var Renderer = function(options){

    this.options = options;
    this.settings = settings;

    if(this.validateOptions()){
      this.init();
    }

  };

  Renderer.prototype = {

    init: function(){
      var _this = this;
      apntag.anq.push(function() {
        _this.pushTags();
      });
    },

    // validates the options object to check if ads can be requested and rendered
    validateOptions: function(){

        this.options.numads = this.options.numads|| this.settings.numads;
        this.options.tagid = this.options.tagid|| this.settings.tagid;
        console.log(this.options);
        return true;
    },

    pushTags: function(){
      //set global page options
      apntag.setPageOpts({
        member: parseInt(this.options.member) || this.settings.member
      });

      for(var i=0; i< this.options.numads; i++){
        apntag.defineTag({
          tagId: parseInt(this.options.tagid),
          allowedFormats: ['native'],
          allowSmallerSizes : true,
          sizes: [[1,1]],
          targetId: 'native'+i,
          prebid : true
        });
        apntag.onEvent('adAvailable', 'native'+i, this.adAvailable.bind(this));
      }
      apntag.loadTags();
    },

    adAvailable: function(data){
      console.log(data);
      if(data && data.native && !data.nobid){
        this.renderNativeAd(data.native);
      }
    },

    renderNativeAd: function(data){
        var obj = {
          title : data.title,
            img : data.mainMedia[0].url,
            description : data.description
        };
        var ad = this.createDomNodeFromHTML(this.tmpl(this.settings.template, obj))[0];

        this.prependNode(ad,document.getElementById("ppninnerbox"));

    },

    tmpl:function(template, data) {
        var prop, regProp, html = template;
        for (prop in data) regProp = new RegExp("{{" + prop + "}}", "gim"), html = html.replace(regProp, data[prop]);
        return html;
    },

    prependNode : function (newNode, referenceNode) {
        referenceNode.insertBefore(newNode, referenceNode.firstChild);

    },

    createDomNodeFromHTML: function(html){
        var div = document.createElement('div');
        div.innerHTML = html;
        var elements = div.childNodes;
        return elements;
    }

  };

  return Renderer;
})();
