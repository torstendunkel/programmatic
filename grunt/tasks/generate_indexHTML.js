module.exports = function (grunt) {
    var fs = require("fs");

    grunt.registerTask('generate_indexHTML', 'Copies the index.html to all build folders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');


        var dest;
        var indexHTML = fs.readFileSync('src/html/index.html', 'utf8');

        var script;



        for (var i = 0; i < folderJSON.length; i++) {
            if (folderJSON[i].depth === 3) {
                var dir = folderJSON[i].location;

                dest = dir.replace('temp/','build/');
                script = grunt.config.get(["enviroment"]) + dir.replace('temp/','/') + 'index.js';



                fs.writeFile(dest+"index.html", indexHTML.replace('%%SCRIPTSRC%%',script), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                });
            }
        }
    });
};

