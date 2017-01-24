module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('prepareCSS_to_JS', 'Copies the main JS to all subfolders', function () {

        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages_css = {};
        for (var i = 0; i < folderJSON.length; i++) {
            var dir = folderJSON[i].location;
            pages_css[dir +'/' + 'style.js'] = [dir+'/style.css'];
        }

        console.log(pages_css);
        //set variable pages so that the copy task can use it
        grunt.config.set("pages_css", pages_css);
    });
};