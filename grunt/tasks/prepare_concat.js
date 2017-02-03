module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('prepare_concat', 'Copies the main JS to all subfolders', function () {

        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages_concat = {};
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 3){
                var dir = folderJSON[i].location;
                var dest = dir.replace('temp/','');
                pages_concat['build/'+ dest + '/' + 'index.js'] = [dir+'/config.js', 'temp/renderer.js', 'temp/starter.js',dir+'/style.js'];
            }
        }
        grunt.config.set("pages_concat", pages_concat);
    });
};