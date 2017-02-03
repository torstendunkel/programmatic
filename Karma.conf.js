module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            {pattern: 'pages/**/*', included:false, served: true},
            {pattern: 'src/renderer.js', included: true},
            {pattern: 'spec/**/*.js', included: true}
        ],
        exclude: [
        ],
        preprocessors: {
            'src/**/*.js': ['coverage']
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true
    });
};