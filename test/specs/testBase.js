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

var virtualTableService, dataSink, tablePrinter, virtualTable, rowEvent;
var rootScope;
var logger;
var countdownLatch;
var protoLoader;

define(function (require) {
    'use strict';

    var angular = require('angular');
    require('angularMocks');
    require('api');
    require('../../test/specs/test');


    var TestBase = {
        setup: function (done) {
            console.log('test-setup before each');
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
            module('constants', function ($provide) {
                $provide.constant('CONFIG',
                    {
                        basePath: require.toUrl(''),
                        logLevel: 3,
                        protobufSchemaPath: require.toUrl('') + 'bower_components/viewserver-protobuf-all/'
                    });

            });

            module('io.viewserver.api');
            module('io.viewserver.api.test');

            inject(function ($rootScope, VirtualTableService, DataSink, Logger, TablePrinter, CountdownLatch, RowEvent, ProtoLoader) {
                rootScope = $rootScope;
                virtualTableService = VirtualTableService;
                dataSink = new DataSink();
                logger = Logger;
                tablePrinter = TablePrinter;
                countdownLatch = new CountdownLatch();
                rowEvent = RowEvent;
                protoLoader = ProtoLoader;

                done();
            });
        },

        //Force a digest every 200ms, required to get angular promises to resolve
        digest: function () {
            rootScope.$digest();

            this.digestInterval = setInterval(function () {
                rootScope.$digest();
            }, 200);
        },

        endDigest: function () {
            setTimeout(function () {
                window.clearInterval(this.digestInterval);
            }, 200);
        },

        assertColumnSortOrder: function (dataSink, columnName, sortDirection) {
            var columnValues = [];
            var rankValues = [];

            $.each(dataSink.data, function (rowId, row) {
                columnValues.push(row[columnName]);
                rankValues[row.rank] = row[columnName];
            });

            var sortedValues = angular.copy(columnValues).sort();

            if (sortDirection === 'DESC') {
                sortedValues.reverse();
            }

            expect(rankValues).toEqual(sortedValues);
        },

        generateUUID: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }
    };
    return TestBase;
});
