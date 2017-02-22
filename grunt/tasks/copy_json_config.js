module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('copy_json_config', 'Copies the main JS to all subfolders', function () {

        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 3){
                var dir = folderJSON[i].location;
                var input = grunt.file.readJSON(dir + '/config.json');
                //also set the identifier
                input.identifier = dir.replace('temp/','').replace(/\//g,'');

                var str = JSON.stringify(input);

                var output = "window.renderingConfig = " + str + ";";
                grunt.file.write(dir + 'config.js', output);


                var outputJSONP = "adRenderer.setOptions(" + str + ",null, true);";
                grunt.file.write(dir + 'config_jsonp.js', outputJSONP);



                //grunt.log.writeln("File " + dir + 'config.js' + " created.");
            }
        }
    });
};