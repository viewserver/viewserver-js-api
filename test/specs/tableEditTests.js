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

define(function (require) {
    'use strict';
    var TestBase = require('../../test/specs/testBase');
    var userId;

    describe('Table Edit Tests', function () {
        var connectionOptions = {
            url: 'ws://localhost:8080'
        };

        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();

            userId = TestBase.generateUUID() + "@viewserver.com";
        });

        it('Should Add Rows', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                virtualTableService.authenticate("open", userId).then(function () {
                    countdownLatch.setLatch(3, done);

                    logger.debug('authenticated');
                    virtualTableService.subscribe('userdata', {}, $.extend(dataSink, {
                            onRowAdded: function (rowId, row) {
                                console.log(row);
                                countdownLatch.countdown();
                            }
                        })
                    ).then(function (virtualTable) {
                            var rowEvents = [];
                            rowEvents.push(new rowEvent(rowEvent.EventType.ADD, { key: 'data1', value: 'here it is' }));
                            rowEvents.push(new rowEvent(rowEvent.EventType.ADD, { 0: 'data2', 1: 'here what is?' }));
                            rowEvents.push(new rowEvent(rowEvent.EventType.ADD, [ 'data3', 'over there' ]));
                            virtualTable.editTable(rowEvents);
                        });
                });
            });
        });

        it('Should Update Rows', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                virtualTableService.authenticate("open", userId).then(function () {
                    countdownLatch.setLatch(1, done);

                    logger.debug('authenticated');
                    virtualTableService.subscribe('userdata', {}, $.extend(dataSink, {
                            onRowUpdated: function (rowId, row) {
                                console.log(row);
                                countdownLatch.countdown();
                            }
                        })
                    ).then(function (virtualTable) {
                            var rowEvents = [];
                            rowEvents.push(new rowEvent(rowEvent.EventType.ADD, { key: 'data1', value: 'here it is' }));
                            virtualTable.editTable(rowEvents).then(function() {
                                var rowEvents = [];
                                rowEvents.push(new rowEvent(rowEvent.EventType.UPDATE, { key: 'data1', value: 'where is it?' }, 0));
                                virtualTable.editTable(rowEvents);
                            });
                        });
                });
            });
        });

        it('Should Remove Rows', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                virtualTableService.authenticate("open", userId).then(function () {
                    countdownLatch.setLatch(1, done);

                    logger.debug('authenticated');
                    virtualTableService.subscribe('userdata', {}, $.extend(dataSink, {
                            onRowRemoved: function (rowId) {
                                countdownLatch.countdown();
                            }
                        })
                    ).then(function (virtualTable) {
                            var rowEvents = [];
                            rowEvents.push(new rowEvent(rowEvent.EventType.ADD, { key: 'data1', value: 'here it is' }));
                            virtualTable.editTable(rowEvents).then(function() {
                                var rowEvents = [];
                                rowEvents.push(new rowEvent(rowEvent.EventType.REMOVE, {}, 0));
                                virtualTable.editTable(rowEvents);
                            });
                        });
                });
            });
        });
    });
});