module.exports = function(grunt) {
    var fs = require("fs");

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
        "mobilehalfpage" : "600px",
        "mobilerect" : "250px",
        "mobilerectangle2" : "250px",
        "mobilerectangle1" : "250px",
        "mobilerectangle3" : "500px",
        "mobilesmallrectangle1" : "160px",
        "mobilewideboard1" : "318px",
        "monsterboard2" : "396px",
        "monsterboard3" : "396px",
        "monsterboard4" : "468px",
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
        "wideboard3" : "250px"
    };


    function getHeight(identifier){
        for(var i in height){
            if(identifier.indexOf(i) !== -1){
                return (parseInt(height[i].replace("px","")) + 20) + "px";
            }
        }
        return "600px";
    }

    grunt.registerTask('generate_test_page', 'generates one Testpage where all pages are loaded', function () {
        var done = this.async();
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var html = "<!DOCTYPE html><html><head> <meta charset=\"UTF-8\"></head><body>";
        var identifier;
        var script;
        var template = fs.readFileSync('grunt/adPreviewTmpl.html', 'utf8');
        var htmlTmp;
        for (var i = 0; i < folderJSON.length; i++) {
            identifier = folderJSON[i].location;
            identifier = identifier.split('/');
            //var scriptSrc = 'build/'+identifier[1]+'/';
            var scriptSrc = 'https://s3-eu-west-1.amazonaws.com/media.das.tamedia.ch/anprebid/build/'+identifier[1]+'/index.js';
            var templateUrl = '&lt;script src="https://s3-eu-west-1.amazonaws.com/media.das.tamedia.ch/anprebid/build/'+identifier[1]+'/index.js#tagid={ADD_ID}"&gt;&lt;/script&gt;';

            if(identifier.length === 3){
                htmlTmp = template
                    .replace(/%%HEADER%%/g,identifier[1])
                    .replace(/%%ifrmID%%/g,'iframe'+i)
                    .replace(/%%SCRIPTSRC%%/g,scriptSrc)
                    .replace(/%%TEMPLATE_URL%%/g,templateUrl)
                    .replace(/%%HEIGHT%%/g,getHeight(identifier[1]));
                html += htmlTmp;
            }
        }
        html+="</body></html>";
        fs.writeFile("preview.html", html, function(err) {
            if(err) {
                return console.log(err);
            }
            done();
        });
    });

};