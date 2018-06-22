module.exports = function(grunt) {
    var fs = require("fs");
    var mkdirp = require('mkdirp');


    var height = {
        "minirectangle" : "120px",
        "mobilehalfpage" : "600px",
        "rectangle" : "250px",
        "billboard3" : "350px",
        "billboard4" : "348px",
        "contentboard" : "120px",
        "gallery" : "550px",
        "halfpage" : "600px",
        "largerect" : "180px",
        "leaderboard" : "190px",
        "mobilebanner" : "75px",
        "mobilerectangle3" : "500px",
        "mobilerectangle2" : "250px",
        "mobilerectangle1" : "250px",
        "mobilehalfpage2" : "300px",
        "mobilerect1" : "250px",
        "mobilesmallrectangle1" : "160px",
        "mobilewideboard1" : "318px",
        "monsterboard1" : "396px",
        "monsterboard2" : "396px",
        "monsterboard3" : "270px",
        "monsterboard4" : "468px",
        "monsterboard" : "300px",
        "rectangel3" : "468px",
        "rectangle1" : "468px",
        "rectangle2" : "468px",
        "rectangle3" : "468px",
        "skyscraper3" : "600px",
        "smallmobilebanner1" : "50px",
        "smallrect1" : "100px",
        "specialstory2" : "200px",
        "spezialcomments3" : "150px",
        "storyplacement3" : "598px",
        "wideboard2" : "180px",
        "wideboard3" : "250px",
        "spezialfooter6" :"200px",
        "sbt_20min" : "250px",
        "juicead1" : "120px",
        "fullwidth1" : "140px"
    };

    var width = {
        "juicead1" : "300px",
        "fullwidth1" : "430px"
    }

    function getHeight(identifier){
        for(var i in height){
            if(identifier.indexOf(i) !== -1){
                return (parseInt(height[i].replace("px","")) + 20) + "px";
            }
        }
        return "200px";
    }

    function getWidth(identifier){
        for(var i in width){
            if(identifier.indexOf(i) !== -1){
                return (parseInt(width[i].replace("px","")) + 20) + "px";
            }
        }
        return "100%";
    }

    grunt.registerTask('generate_test_page', 'generates one Testpage where all pages are loaded', function (env) {


        var enviroment = env ? env : "build";

        var done = this.async();
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var html = "";
        var wrapper = fs.readFileSync('grunt/previewWrapper.html', 'utf8');
        var template = fs.readFileSync('grunt/adPreviewTmpl.html', 'utf8');
        var pageWrapper = fs.readFileSync('grunt/pageWrapper.html', 'utf8');
        var identifier;
        var script;
        var htmlTmp;

        folderJSON.sort(function(a,b){
            if(b.depth === 4){
                return -1;
            }
            if(a.depth === 4){
                return 1;
            }
            var locA = a.location.split('_');
            var locB = b.location.split('_');
            locA = locA[locA.length - 1].length < 3 ? locA[locA.length - 2].replace('/','') : locA[locA.length - 1].replace('/','');
            locB = locB[locB.length - 1].length < 3 ? locB[locB.length - 2].replace('/','') : locB[locB.length - 1].replace('/','');



            if(locA > locB){
                return 1;
            }else if(locB > locA){
                return -1;
            }
            return 0;
        });

        var pageName;

        var pagesHTML  = "";
        var pId = 0;
        for (var i = 0; i < folderJSON.length; i++) {
            identifier = folderJSON[i].location;
            identifier = identifier.split('/');
            //var scriptSrc = 'build/'+identifier[1]+'/';
            var scriptSrc = ' https://d1rkf0bq85yx06.cloudfront.net/anprebid/'+enviroment+'/'+identifier[1]+'/index.js';
            var templateUrl = '&lt;script src="https://d1rkf0bq85yx06.cloudfront.net/anprebid/build/'+identifier[1]+'/index.js#tagid={ADD_ID}"&gt;&lt;/script&gt;';
            var htmlView = 'https://d1rkf0bq85yx06.cloudfront.net/anprebid/' + enviroment + "/" +identifier[1] +"/index.html";
            //var preview = "index.html#debug=1&identifier="+identifier[1];
          
            if(identifier.length === 3){
                var pName = identifier[1].split('_');
                pName = pName[pName.length - 1].length < 3 ? pName[pName.length - 2] : pName[pName.length - 1];

                if(!pageName){
                    pageName = pName;
                }

                if(pName && pageName !== pName && html.length > 0 && html !== ""){
                    pagesHTML += pageWrapper.replace('%%CONTENT%%',html).replace('%%PAGENAME%%',pageName).replace(/%%ID%%/gi,pId);
                    pageName = pName;
                    pId +=1;

                    htmlTmp = template
                        .replace(/%%HEADER%%/g,identifier[1])
                        .replace('%%ID%%',pId)
                        .replace(/%%ifrmID%%/g,identifier[1])
                        .replace(/%%SCRIPTSRC%%/g,scriptSrc)
                        .replace(/%%TEMPLATE_URL%%/g,templateUrl)
                        .replace(/%%HEIGHT%%/g,getHeight(identifier[1]))
                        .replace(/%%WIDTH%%/g,getWidth(identifier[1]))
                        .replace(/%%HTMLVIEW%%/g,htmlView)
                        .replace(/%%HTMLVIEW2%%/g,htmlView+"#tagid={ADD_ID}");
                    html += htmlTmp;

                    html ="";
                }else{

                  htmlTmp = template
                        .replace(/%%HEADER%%/g,identifier[1])
                        .replace('%%ID%%',pId)
                        .replace(/%%ifrmID%%/g,identifier[1])
                        .replace(/%%SCRIPTSRC%%/g,scriptSrc)
                        .replace(/%%TEMPLATE_URL%%/g,templateUrl)
                        .replace(/%%HEIGHT%%/g,getHeight(identifier[1]))
                        .replace(/%%WIDTH%%/g,getWidth(identifier[1]))
                        .replace(/%%HTMLVIEW%%/g,htmlView)
                        .replace(/%%HTMLVIEW2%%/g,htmlView+"#tagid={ADD_ID}");
                    html += htmlTmp;
                }
            }
        }

        //render the last page
        pagesHTML += pageWrapper.replace('%%CONTENT%%',html).replace('%%PAGENAME%%',pageName).replace(/%%ID%%/gi,pId);

        fs.writeFile("build/preview.html", wrapper.replace('%%CONTENT%%',pagesHTML), function(err) {
            if(err) {
                return console.log(err);
            }
            done();
        });
    });
};