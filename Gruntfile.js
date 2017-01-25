module.exports = function(grunt) {

    grunt.loadTasks("grunt/tasks/");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/renderer.js',
                dest: 'build/renderer.js'
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
            jsToPages: {
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-folder-list');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-variablize');


    // Default task(s).
    grunt.registerTask('default', ['clean:temp','copy:pages','folder_list','copy_Main','copy:jsToPages','prepareCSS_to_JS','css_to_js:pages','jsonConfigCopy', 'prepareConcat','concat:build','prepare_copy_images','copy:images','generateTestPage','clean:temp']);


};