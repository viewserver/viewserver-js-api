/*
 * Copyright 2016 Claymore Minds Limited and Niche Solutions (UK) Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt) {
    'use strict';

    // Loads all grunt tasks
    require('matchdep').filterDev(['grunt-*', '!grunt-cli', '!grunt-ng-constant']).forEach(grunt.loadNpmTasks);

    //removing this task from the filter above doesn't seem to work for some reason
    grunt.loadNpmTasks('grunt-ng-constant');
    grunt.loadNpmTasks('grunt-build-control');

    // App configuration
    var config = grunt.file.readJSON('config.json');

    // Tasks configuration
    grunt.initConfig({
        config: config,

        pkg: grunt.file.readJSON('package.json'),

        clean: {
            destination: {
                src: ['<%= config.buildDir %>']
            }
        },

        copy: {
            build: {
                options: {
                    mode: true
                },
                files: [
                    {
                        expand: true, cwd: '<%= config.sourceDir %>/',
                        src: ['bower.json'], dest: '<%= config.buildDir %>', filter: 'isFile'
                    },
                    {
                        expand: true, cwd: '<%= config.sourceDir %>/bower_components/',
                        src: ['viewserver-protobuf-all/**/*.proto'], dest: '<%= config.buildDir %>', filter: 'isFile'
                    }
                ]
            }
        },

        bowercopy: {
            options: {
                report: false,
                runBower: false
            },
            main: {
                files: {
                    '<%= config.sourceDir %>/bower_components/viewserver-protobuf-all/core': 'viewserver-protobuf-core/*.proto',
                    '<%= config.sourceDir %>/bower_components/viewserver-protobuf-all': '**/*.proto'
                }
            }
        },


        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            source: {
                src: [
                    'Gruntfile.js',
                    '<%= config.sourceDir %>/**/*.js',
                    '!<%= config.sourceDir %>/bower_components/**/*.js'
                ]
            }
        },

        karma: {
            options: {
                // Karma serves files under /base, which is the basePath from your config file
                configFile: '<%= config.testDir %>/karma.conf.js',
                singleRun: false,
                captureConsole: false,
                client: {
                    captureConsole: false
                }
            },
            unit: {
                port: 8085 // needs to be different than background one
            },
            minifiedunit: {
                port: 8086,
                options: {
                    files: [
                        '<%= config.sourceDir %>/bower_components/jquery/dist/jquery.js',
                        '<%= config.sourceDir %>/bower_components/angular/angular.js',
                        '<%= config.sourceDir %>/bower_components/angular-mocks/angular-mocks.js',
                        {pattern: '<%= config.testDir %>/specs/*.js', included: false},
                        {pattern: '<%= config.testDir %>/specs/**/*.js', included: false},
                        {pattern: '<%= config.buildDir %>/**/*.proto', included: false, served: true},
                        '<%= config.buildDir %>/api.min.js',
                        '<%= config.testDir %>/test-minified.js'
                    ]
                },
                singleRun: true
            },
            watchunit: {
                port: 8089,
                singleRun: false
            }
        },

        requirejs: {
            build: {
                options: {
                    name: 'api',
                    baseUrl: '<%= config.sourceDir %>',

                    normalizeDirDefines: 'all',
                    out: '<%= config.buildDir %>/api.js',
                    mainConfigFile: '<%= config.sourceDir %>/requirejs-config.js',
                    paths: {
                        angular: 'empty:',
                        angularMocks: 'empty:',
                        jquery: 'empty:'
                    },
                    optimize: 'none',
                    removeCombined: true
                }
            }
        },

        uglify: {
            options: {
                mangle: {
                    except: ['$', '$q', '$http', 'DATA_SOURCE_NAME', 'angular',
                        'VirtualTableService', 'ClientService', 'Client', 'VirtualTable', 'DataSink',
                        'Network', 'Command', 'ReportContextMapper', 'TableMetaDataMapper', 'OptionsMapper',
                        'ProtoLoader', 'Logger', 'RowMapper', 'ProtoLoader', 'CONFIG', 'RowEventMapper',
                        'RowEvent', 'ProjectionMapper', 'Projection']
                },
                banner: '/*! <%= pkg.title %> <%= pkg.version %> (built on <%= grunt.template.today() %>) \n Author : <%= pkg.author.name %> <%= pkg.author.email %> \n*/'
            },
            build: {
                src: ['<%= requirejs.build.options.out %>'],
                dest: '<%= config.buildDir %>/api.min.js'
            }
        },

        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'Release %VERSION%',
                commitFiles: ['-a'],
                createTag: false,
                push: true,
                pushTo: 'origin'
            }
        },

        bowerConfig: grunt.file.readJSON('./bower.json'),
        bowerCreateConfig: {
            dist: {
                options: {
                    dest: '<%= config.buildDir %>',
                    space: 2,
                    config: {
                        name: '<%= bowerConfig.name %>',
                        version: '<%= bowerConfig.version %>',
                        main: '<%= config.buildDir %>/api.min.js',
                        ignore: [],
                        private: '<%= bowerConfig.private %>',
                        dependencies: '<%= bowerConfig.dependencies %>'
                    }
                }
            }
        }

    });

    grunt.registerTask('lint', 'Lints all JS', ['jshint:source']);

    // "test" task
    grunt.registerTask('test', 'Tests the app fully: lints all JS & runs unit tests\n --nolint: skips the linting step', function () {
        var skipLint = grunt.option('nolint');

        var tasks = [
            'bowercopy:main',
            'lint',
            'karma:unit'
        ];

        if (skipLint) {
            _removeValueFromArray('lint', tasks);
        }

        return grunt.task.run(tasks);
    });

    grunt.registerTask('testminified', 'Tests the app fully against the minified build of the app: lints all JS & runs unit tests\n --nolint: skips the linting step', function () {
        var skipLint = grunt.option('nolint');

        var tasks = [
            'bowercopy:main',
            'lint',
            'karma:minifiedunit'
        ];

        if (skipLint) {
            _removeValueFromArray('lint', tasks);
        }

        return grunt.task.run(tasks);
    });

    grunt.registerTask('pushtogit', 'Bumps file version and pushes to git, requires tests have been run first \n --bump major|minor|patch| bumps the version number, default is patch', function () {
        // grunt.task.requires('testminified');

        var version = grunt.option('bump');

        var tasks = ['bump:patch'];

        if (version === 'minor') {
            tasks = ['bump:minor'];
        } else if (version === 'major') {
            tasks = ['bump:major'];
        }

        return grunt.task.run(tasks);
    });

    // "build" task
    grunt.registerTask('build', 'Builds from /src to /dest while concatenating, minifying & uglifying sources. \n  --notest: skips all testing', function () {
        var noTest = grunt.option('notest');

        var tasks = [
            'bowercopy:main',
            'lint',
            'clean:destination',
            'copy:build',
            'requirejs:build',
            'uglify:build',
            'bowerCreateConfig',
            'testminified'
        ];

        if (noTest) {
            _removeValueFromArray('testminified', tasks);
        }

        return grunt.task.run(tasks);
    });

    // "default" task, to use for development purposes
    grunt.registerTask('default', 'This is the default dev task it runs all tests and watches for changes', function () {
        return grunt.task.run(['karma:watchunit']);
    });

    function _removeValueFromArray(value, array) {
        var index = array.indexOf(value);

        if (index > -1) {
            array.splice(index, 1);
        }

        return array;
    }
};
