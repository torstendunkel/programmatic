module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('generateTestPage', 'generates one Testpage where all pages are loaded', function () {
        var done = this.async();
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var html = "<html><head></head><body>";
        var identifier;
        var script;
        var template = fs.readFileSync('grunt/adPreviewTmpl.html', 'utf8');
        var htmlTmp;
        for (var i = 0; i < folderJSON.length; i++) {
            identifier = folderJSON[i].location;
            identifier = identifier.split('/');
            if(identifier.length === 3){
                htmlTmp = template
                    .replace(/%%HEADER%%/g,identifier[1])
                    .replace(/%%ifrmID%%/g,'iframe'+i)
                    .replace(/%%SCRIPTSRC%%/g,'build/'+identifier[1]+'/index.js');
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