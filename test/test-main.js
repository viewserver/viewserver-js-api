/* Main test runner file. Used to kick off tests via karma-jasmine*/

var allTestFiles = [];
var TEST_REGEXP = /test\/specs\/.+.js$/;

var pathToModule = function (path) {
    return path.replace(/^\/base\//, '../').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function (file) {
    //Uncomment line below to view which files are loaded by the test environment
    //console.log(file);

    if (TEST_REGEXP.test(file)) {
        //Uncomment line below to view which files are being matched as test files
        //console.log('match ' + pathToModule(file));

        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/src',

    // dynamically load all test files
    deps: allTestFiles,

    paths: {
        jquery: '../src/bower_components/jquery/dist/jquery',
        augment: '../src/bower_components/augment/augment',
        angular: '../src/bower_components/angular/angular',
        angularMocks: '../src/bower_components/angular-mocks/angular-mocks',
        long: '../src/bower_components/long/dist/long.min',
        bytebuffer: '../src/bower_components/bytebuffer/dist/bytebuffer.min',
        protobuf: '../src/bower_components/protobuf/dist/protobuf.min'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularMocks: {
            exports: 'angularMocks',
            deps: ['angular']
        },
        Config: {
            exports: 'Config'
        }
    },

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});



