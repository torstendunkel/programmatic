module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('jsonConfigCopy', 'Copies the main JS to all subfolders', function () {

        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages_css = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 3){
                var dir = folderJSON[i].location;
                var input = grunt.file.readJSON(dir + '/config.json');
                //also set the identifier
                input.identifier = dir.replace('temp/','').replace(/\//g,'');
                var output = "window.renderingConfig = " + JSON.stringify(input) + ";";
                grunt.file.write(dir + 'config.js', output);
                //grunt.log.writeln("File " + dir + 'config.js' + " created.");
            }
        }
        grunt.config.set("pages_css", pages_css);
    });
};