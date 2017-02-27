module.exports = function(grunt) {
    var fs = require("fs");
    grunt.registerTask('insert_version', 'inserts the timestamp of this build to src', function () {

        var mainFile = "temp/renderer.js";

        var done = this.async();

        var date = new Date();
        var mm = date.getMonth() + 1;
        var dd = date.getDate();
        var min = date.getMinutes();
        var hr = date.getHours();

        mm = mm > 9 ? mm : '0'+ mm;
        dd = dd > 9 ? dd : '0' + dd;
        min = min > 9 ? min : '0' + min;
        hr = hr > 9 ? hr : '0' + hr;

        var ts = dd + "."+ mm + "." + date.getFullYear() + " " + hr + ":" + min;

        var script = grunt.file.read(mainFile);

        script = script.replace(/%%VERSION%%/g, ts);
        script = script.replace(/%%ENVIRONMENT%%/g, grunt.config.get("env") || "");
        script = script.replace(/%%SCRIPTBASE%%/g, grunt.config.get("enviroment") || "");

        console.log(ts)
        console.log(grunt.config.get("env"));
        console.log(grunt.config.get("enviroment"));

        fs.writeFile(mainFile, script, function(err) {
            if(err) {
                return console.log(err);
            }
            done();
        });

    });
};