module.exports = function(grunt) {
    require('time-grunt')(grunt);
    grunt.loadTasks("grunt/tasks/");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            renderer: {
                files : {
                    'temp/renderer.js' : ['src/renderer.js']
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'pages/',
                    src: ['**/*.css'],
                    dest: 'build/pages',
                    ext: '.css'
                }]
            }
        },

        copy: {
            renderer_to_pages: {
                files: '<%= pages %>'
            },
            pages : {
                expand: true,
                cwd: 'pages',
                src: '**',
                dest: 'temp/'
            },
            images : {
                files : '<%= pages_images %>'
            }
        },
        folder_list: {
            options: {
                // Default options, you dont need these they are just to highlight the options available.
                files: false,
                folders: true,
                type : "dir",
                depth :4
            },
            files: {
                src : ['temp/**/'],
                dest: 'temp/folderlist.json'
            }
        },
        clean: {
            temp: {
                src: ['temp']
            },
            build: {
                src: ['build']
            }
        },

        css_to_js: {
            options: {
                regFn: 'adRenderer.css',
                baseUrl : 'build',
                tempUrl : 'temp'
            },
            pages: {
                files: '<%= pages_css %>'
            }
        },

        concat:{
            options: {
                separator: ';'
            },
            build: {
                files :'<%= pages_concat %>'
            }
        }
    });




    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-folder-list');
    grunt.loadNpmTasks('grunt-contrib-clean');


    // Default task(s).
    grunt.registerTask('default', [
        'clean:temp',
        'clean:build',

        'copy:pages',   // copies all folders below /pages to /temp

        'folder_list',   //generates a json for the folders in /temp

        'uglify:renderer', //uglifies the renderer.js

        'prepare_CSS_to_JS', //creates the files' array for css_to_js task
        'css_to_js:pages',

        'copy_json_config', // translates the config.json to config.js and copies it to all temp folders

        'prepare_concat', // concats the config.js, renderer.js, and style.js to one file
        'concat:build',

        'prepare_copy_images', // copy the images folder to all builds that have an images folder
        'copy:images',

        'generate_test_page', // render the preview.html

        'clean:temp']);
};