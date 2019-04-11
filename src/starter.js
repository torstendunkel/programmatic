var adRenderer;

// fallback if the ad is running locally create an iframe for it
if(document.location.href.indexOf('file://') !== -1){
    var iframeSrc = document.currentScript.src.replace('.js','.html').replace('fromHTML=1','');

    if(iframeSrc.indexOf('#')!== -1){
        iframeSrc+='&useOldAst=1'
    }else{
        iframeSrc+='#useOldAst=1'
    }

    var iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.src = iframeSrc;
    iframe.style.border = "0px";
    iframe.scrolling = "no";
    window.onload = function(){
        document.body.style.margin = 0;
        document.body.appendChild(iframe);
    };
    adRenderer = {};
    adRenderer.prepareStyle = function(){};
}else{
    adRenderer = new ch.tam.addnexusRender(window.renderingConfig);
}

