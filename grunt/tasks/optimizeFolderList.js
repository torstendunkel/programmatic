module.exports = function (grunt) {
    var fs = require("fs");
    grunt.registerTask('optimizeFolderList', 'removes unused templates', function () {
        var folderJSON = grunt.file.readJSON('temp/folderlist.json');
        var unused = grunt.file.read('temp/usedFormats.txt');
        var newFolderList = [];
        for (var i = 0; i < folderJSON.length; i++) {
            if (folderJSON[i].depth === 3 && unused.indexOf(folderJSON[i].location.replace(/temp/,"").replace(/\//g,"")) !== -1) {
                newFolderList.push(folderJSON[i]);
            }
        }
        //write new folderlist
        fs.writeFileSync("temp/folderlist.json", JSON.stringify(newFolderList));

    });
};

