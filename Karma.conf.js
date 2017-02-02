module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'pages/**/*',
            'src/**/*.js',
            'spec/**/*.js'
        ],
        exclude: [
        ],
        preprocessors: {},
        reporters: ['dots'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true
    });
};