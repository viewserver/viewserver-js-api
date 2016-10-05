/* Minified test runner file, run tests against the minified vas api. Used to kick off tests via karma-jasmine*/

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
        //console.log("match " + pathToModule(file));

        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

require.config({
    baseUrl: '/base/dist',

    // dynamically load all test files
    deps: allTestFiles,

    paths: {
        jquery: '../src/bower_components/jquery/dist/jquery',
        angular: '../src/bower_components/angular/angular',
        angularMocks: '../src/bower_components/angular-mocks/angular-mocks'
    },

    shim: {
        angular: {
            exports: 'angular'
        },
        angularMocks: {
            exports: 'angularMocks',
            deps: ['angular']
        }
    },

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});

