module.exports = function (grunt) {
    var fs = require("fs");
    grunt.registerTask('prepare_copy_indexHTML', 'Copies the index.html to all build folders', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if (folderJSON[i].depth === 3) {
                var dir = folderJSON[i].location;
                pages.push({
                    expand: true, flatten: true,
                    src: ['src/html/index.html'],
                    dest: dir.replace('temp/','build/')
                });
            }
        }

        //set variable pages so that the copy task can use it
        grunt.config.set("pages_indexHTML", pages);
    });
};

