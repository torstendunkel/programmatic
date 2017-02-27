module.exports = function (grunt) {
    var fs = require("fs");
    grunt.registerTask('prepare_copy_jsonp', 'Copies the main jsonp config to all subfolders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if (folderJSON[i].depth === 3) {
                var dir = folderJSON[i].location;
                pages.push({
                    expand: true, flatten: true, filter: 'isFile',
                    src: [dir + 'config_jsonp.js', dir + 'style.css', dir + 'config.json'],
                    dest: dir.replace('temp/','build/')
                });
            }
        }

        //set variable pages so that the copy task can use it
        grunt.config.set("pages_jsonp", pages);
    });
};

