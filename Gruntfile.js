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
                    'temp/renderer.js' : ['src/renderer.js'],
                    'temp/starter.js' : ['src/starter.js']
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
                regFn: 'adRenderer.prepareStyle',
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
        },

        aws: grunt.file.readJSON('s3key.json'), // Read the file

        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'build/',
                src: ['**/*'],
                dest: 'temp/compressed/'
            }
        },


        aws_s3: {
            options: {
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
                region: 'eu-west-1',
                uploadConcurrency: 20, // 5 simultaneous uploads
                downloadConcurrency: 20 // 5 simultaneous downloads
            },
            deploy: {
                options: {
                    bucket: 'media.das.tamedia.ch',
                    differential: true, // Only uploads the files that have changed
                    displayChangesOnly : true
                },
                files: [
                    //{expand: true, cwd: 'build/', src: ['**'], dest: 'anprebid/build/'},
                    {expand: true, cwd: 'pages/', src: ['**'], dest: 'anprebid/pages/'}
                ]
            },
            deploy_compressed: {
                options: {
                    bucket: 'media.das.tamedia.ch',
                    differential: true, // Only uploads the files that have changed
                    displayChangesOnly : true,
                    params: {
                        ContentEncoding: 'gzip' // applies to all the files!
                    }
                },
                files: [
                    {expand: true, cwd: 'temp/compressed/', src: ['**'], dest: 'anprebid/build/'}
                ]
            },
            stage: {
                options: {
                    bucket: 'media.das.tamedia.ch',
                    differential: true, // Only uploads the files that have changed
                    displayChangesOnly : true,
                    params: {
                        ContentEncoding: 'gzip' // applies to all the files!
                    }
                },
                files: [
                    {expand: true, cwd: 'temp/compressed/', src: ['**'], dest: 'anprebid/stage/'}
                ]
            }
        },
        'ftp-deploy': {
            pages: {
                auth: {
                    host: '30630.webhosting15.1blu.de',
                    port: 21,
                    authKey: 'key1'
                },
                src: 'pages',
                dest: '/pages',
                exclusions: ['pages/preview']
            },
            src: {
                auth: {
                    host: '30630.webhosting15.1blu.de',
                    port: 21,
                    authKey: 'key1'
                },
                src: 'src',
                dest: '/src'
            },
            upload_testpages:{
                auth: {
                    host: '30630.webhosting15.1blu.de',
                    port: 21,
                    authKey: 'key1'
                },
                src: 'build/preview/',
                dest: '/'
            }
        },

        watch: {
            scripts: {
                files: ['src/*.js'],
                tasks: ['ftp-deploy:src'],
                options: {
                    interrupt: true,
                    spawn: true,
                    debounceDelay: 250
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-folder-list');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-ftp-deploy');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('build',[
        'copy:pages',   // copies all folders below /pages to /temp
        'folder_list',   //generates a json for the folders in /temp
        'uglify:renderer', //uglifies the renderer.js
        'prepare_CSS_to_JS', //creates the files' array for css_to_js task
        'css_to_js:pages',
        'copy_json_config', // translates the config.json to config.js and copies it to all temp folders
        'prepare_concat', // concats the config.js, renderer.js, and style.js to one file
        'concat:build',
        'prepare_copy_images', // copy the images folder to all builds that have an images folder
        'copy:images'
    ]);

    // Default building without deploying
    grunt.registerTask('default', [
        'clean:temp',
        'clean:build',
        'build',
        'generate_test_page', // render the preview.html
        'clean:temp'

    ]);

    //building + deploy to prod
    grunt.registerTask('deploy', [
        'clean:temp',
        'clean:build',
        'build',
        'compress:main',
        'aws_s3:deploy_compressed',
        'generate_test_page:build',
        'ftp-deploy:upload_testpages',
        'ftp-deploy:src',
        'clean:temp'
    ]);
    //building + deploy to stage
    grunt.registerTask('stage', [
        'clean:temp',
        'clean:build',
        'build',
        'compress:main',
        'aws_s3:stage',
        'generate_test_page:stage',
        'ftp-deploy:upload_testpages',
        'ftp-deploy:src',
        'clean:temp'
    ]);

    //upload pages to ftp (for preview)
    grunt.registerTask('uploadPages', [
        'ftp-deploy:pages'
    ]);
};