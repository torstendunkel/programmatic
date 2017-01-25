module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('copy_Main', 'Copies the main JS to all subfolders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 3){
                var dir = folderJSON[i].location;
                pages.push({
                    expand: true, flatten: true, filter: 'isFile',
                    src: 'src/renderer.js',
                    dest: dir
                });
            }
        }
        //set variable pages so that the copy task can use it
        grunt.config.set("pages", pages);
    });


};