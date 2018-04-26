module.exports = function (grunt) {
    var fs = require("fs");

    grunt.registerTask('generate_IframeCreator', 'Copies the iframeCreator.js file to all folders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');


        var dest;
        var indexHTML = fs.readFileSync('src/js/iframeCreator.js', 'utf8');

        var script;



        for (var i = 0; i < folderJSON.length; i++) {
            if (folderJSON[i].depth === 3) {
                var dir = folderJSON[i].location;

                dest = dir.replace('temp/','build/');
                script = grunt.config.get(["enviroment"]) + dir.replace('temp/','/') + 'index.html';

                fs.writeFile(dest+"starter.js", indexHTML.replace('%%IFRAMESRC%%',script), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                });
            }
        }
    });
};

