
const fs = require('fs');

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    grunt.loadTasks("grunt/tasks/");
    var env;


    const awsConfig = JSON.parse(fs.readFileSync('awsConf.json', 'utf8'));

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */\n'
            },
            renderer: {
                files : {
                    'temp/renderer.js' : ['src/renderer.js'],
                    'temp/starter.js' : ['src/starter.js'],
                    'temp/myAst.js' : ['src/myAst.js']
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
            renderer : {
                files : [
                    {expand: true, cwd:"src", src: ['*.js'], dest: 'temp/'}

                ]


            },

            renderer_to_pages: {
                files: '<%= pages %>'
            },
            jsonp: {
                files: '<%= pages_jsonp %>'
            },

            src : {

            },

            pages : {

                files : [
                    {expand: true, cwd:"pages", src: ['**'], dest: 'temp/'}

                ]
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
                baseUrl :"<%= enviroment %>",
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


        aws_s3: {
            options: {
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
                region: 'eu-west-1',
                uploadConcurrency: 20,
                downloadConcurrency: 20
            },
            deploy: {
                options: {
                    bucket: 'media.das.tamedia.ch',
                    differential: true, // Only uploads the files that have changed
                    displayChangesOnly : true,
                },
                files: [
                    {expand: true, cwd: 'build/', src: ['**'], dest: 'anprebid/build/'}
                ]
            },
            stage: {
                options: {
                    bucket: 'media.das.tamedia.ch',
                    differential: true, // Only uploads the files that have changed
                    displayChangesOnly : true,
                    params: {
                        //ContentEncoding: 'gzip' // applies to all the files!
                    }
                },
                files: [

                    {expand: true, cwd: 'build/', src: ['**'], dest: 'anprebid/stage/'}
                ]
            }
        },

        // cache invalidation
        cloudfront: {
            options: {
                region:awsConfig.region, // your AWS region
                distributionId:awsConfig.cloudFront.distributionId, // DistributionID where files are stored
                listInvalidations:false, // if you want to see the status of invalidations
                listDistributions:false, // if you want to see your distributions list in the console
            },

            prod: {
                options: {
                    credentials : {
                        accessKeyId : '<%= aws.AWSAccessKeyId %>',
                        secretAccessKey : '<%= aws.AWSSecretKey %>'
                    },
                    distributionId: awsConfig.cloudFront.distributionId
                },
                CallerReference: Date.now().toString(),
                Paths: {
                    Quantity: 1,
                    Items: [ '/' + awsConfig.livePath + "*" ]
                }
            },
            stage: {
                options: {
                    credentials : {
                        accessKeyId : '<%= aws.AWSAccessKeyId %>',
                        secretAccessKey : '<%= aws.AWSSecretKey %>'
                    },
                    distributionId: awsConfig.cloudFront.distributionId
                },
                CallerReference: Date.now().toString(),
                Paths: {
                    Quantity: 1,
                    Items: [ '/' + awsConfig.stagePath + "*" ]
                }
            }
        },


        watch: {
            dev: {
                files: ['src/*.js','pages/**'],
                tasks: ['dev'],
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
    grunt.loadNpmTasks('grunt-cloudfront');

    grunt.registerTask('set_env', 'Set a config property.', function(env) {
        var domain;
        if (env === 'build') {
            domain = 'https://d1rkf0bq85yx06.cloudfront.net/anprebid/build';
        } else if(env === 'stage'){
            domain = 'https://d1rkf0bq85yx06.cloudfront.net/anprebid/stage';
        }
        else if (env === 'dev'){
            domain = 'pages';
        }


        grunt.config.set("enviroment", domain);
        grunt.config.set("env", env);

        console.log("setting enviroment to ", domain);
    });


    grunt.registerTask('build',[
        'copy:pages',   // copies all folders below /pages to /temp
        'folder_list',   //generates a json for the folders in /temp
        'uglify:renderer', //uglifies the renderer.js
        'prepare_CSS_to_JS', //creates the files' array for css_to_js task
        'css_to_js:pages',
        'copy_json_config', // translates the config.json to config.js and copies it to all temp folders
        'prepare_copy_jsonp', // prepares the jsonp config copy
        'copy:jsonp',
        'insert_version',
        'prepare_concat', // concats the config.js, renderer.js, and style.js to one file
        'concat:build',
        'copy:src',  // copies the src (myAst to build folder)
        'prepare_copy_images', // copy the images folder to all builds that have an images folder
        'copy:images',
        'generate_indexHTML'
    ]);

    grunt.registerTask('build_stage',[
        'copy:pages',   // copies all folders below /pages to /temp
        'folder_list',   //generates a json for the folders in /temp
        'copy:renderer',
        'prepare_CSS_to_JS', //creates the files' array for css_to_js task
        'css_to_js:pages',
        'copy_json_config', // translates the config.json to config.js and copies it to all temp folders
        'prepare_copy_jsonp', // prepares the jsonp config copy
        'copy:jsonp',
        'insert_version',
        'prepare_concat', // concats the config.js, renderer.js, and style.js to one file
        'concat:build',
        'copy:src',  // copies the src (myAst to build folder)
        'prepare_copy_images', // copy the images folder to all builds that have an images folder
        'copy:images',
        'generate_indexHTML'
    ]);

    // Default building without deploying
    grunt.registerTask('default', [
        'set_env:stage',
        'clean:temp',
        'clean:build',
        'build',
        'generate_test_page', // render the preview.html
        'clean:temp'

    ]);

    //building + deploy to prod
    grunt.registerTask('deploy', [
        'set_env:build',
        'clean:temp',
        'clean:build',
        'build',
        'generate_test_page:build',
        'aws_s3:deploy',
        'cloudfront:prod',
        'clean:temp'
    ]);
    //building + deploy to stage
    grunt.registerTask('stage', [
        'set_env:stage',
        'clean:temp',
        'clean:build',
        'build_stage',
        'generate_test_page:stage',
        'aws_s3:stage',
        'cloudfront:stage',
        'clean:temp'
    ]);




    //upload pages to ftp (for preview)
    grunt.registerTask('dev', [
        'set_env:dev',
        'clean:temp',
        'clean:build',
        'build',
        'clean:temp'
    ]);



};