    //use this to signal inApp
    var hash = '';
    if(document.currentScript){
        hash = document.currentScript.src.split('#');
        hash = hash.length>1 ? '#' + hash[1]+'&useOldAst=1' : '#useOldAst=1';
    }

    var iframeSrc = "%%IFRAMESRC%%" + hash;
    var iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = iframeSrc;
    iframe.style.border = '0px';
    iframe.scrolling = 'no';
    window.onload = function(){
        document.body.style.margin = 0;
        document.body.appendChild(iframe);
    };


