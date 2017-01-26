module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('prepare_copy_images', 'Copies images to build files', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var pages_images = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if(folderJSON[i].depth === 4 && folderJSON[i].type==="dir"){
                var dir = folderJSON[i].location;
                var dest = dir.replace('temp/','');
                pages_images.push({
                    expand: true, flatten: true, filter: 'isFile',
                    src: dir +"*",
                    dest: 'build/' + dest
                });
            }
        }
        //set variable pages so that the copy task can use it
        grunt.config.set("pages_images", pages_images);
    });


};