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
    var reportContext, options;

    describe('Dimension Subscription Tests', function () {
        var connectionOptions = {
            url: 'ws://localhost:8080'
        }

        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();

            reportContext = {
                reportId: 'default',
                parameters: {
                    aggregators: ['client'],
                    measures: ['totalTraded'],
                    bucketSize: '1',
                    buckets: '10',
                    basis: 'tickets',
                    currency: ['USD']
                },
                dimensions: {}
            };

            options = {
                columnsToSort: [
                    {
                        name: 'client',
                        direction: 'ASC'
                    }
                ],
                offset: 0
            };
        });

        it('Should Subscribe to Dimension', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                var dimension = 'client';

                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToDimension(dimension, reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                });
            });
        });

        it('Should Subscribe to Paged Dimension', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                var dimension = 'client';
                options.limit = 5;

                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(this.getRowCount()).toEqual(5);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToDimension(dimension, reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                });
            });
        });

        it('Should Subscribe to Sorted Dimension', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                var dimension = 'client';
                options.columnsToSort[0].direction = 'DESC';

                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    TestBase.assertColumnSortOrder(dataSink, 'client', options.columnsToSort[0].direction);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToDimension(dimension, reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                });
            });
        });

        it('Should Subscribe to One Dimension and Then Another', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                var dimension = 'client';
                var dimension2 = 'clientTier';

                countdownLatch.setLatch(4, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();

                    inject(function (DataSink) {
                        var dataSink2 = new DataSink();
                        options.columnsToSort[0].name = dimension2;

                        dataSink2.onSnapshotComplete = function () {
                            tablePrinter.print(dataSink2);
                            expect(this.getRowCount()).toBeGreaterThan(0);
                            countdownLatch.countdown();
                        };

                        virtualTableService.subscribeToDimension(dimension2, reportContext, options, dataSink2).then(function (virtualTableResp) {
                            virtualTable = virtualTableResp;
                            countdownLatch.countdown();

                        });
                    });
                };

                virtualTableService.subscribeToDimension(dimension, reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        afterEach(function (done) {
            virtualTable.unsubscribe()
                .then(function () {
                    console.log('Unusbscribed');
                })
                .catch(function () {
                    console.error('Failed to Unsubscribe');
                })
                .finally(function () {
                    console.log('Disconnecting');
                    virtualTableService.disconnect().then(function () {
                        console.log('Disconnected');
                        TestBase.endDigest();
                        done();
                    });
                });
        });

    });
});




