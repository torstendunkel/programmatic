module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('prepare_uglify_renderer', 'Copies and uglifies the renderer.js to all subfolders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages = {};
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 3){
                var dir = folderJSON[i].location;
                pages[dir+'renderer.js'] = ['src/renderer.js'];
            }
        }
        //set variable pages so that the copy task can use it
        grunt.config.set("renderer_uglified", pages);
    });
};