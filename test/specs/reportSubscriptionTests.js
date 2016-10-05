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

    ddescribe('Report Subscription Tests', function () {
        var connectionOptions = {
            url: 'ws://localhost:8080'
        };

        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();

            reportContext = {
                reportId: 'default',
                parameters: {
                    aggregators: ['client'],
                    measures: ['hitRate'],
                    startBucket: 0,
                    bucketSize: 1,
                    buckets: 10,
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


        iit('Should Subscribe to Inquiries Report', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                });
            });
        });

        it('Should Subscribe to Inquiries Report and then Unsubscribe', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;

                    virtualTable.unsubscribe().then(function () {
                        countdownLatch.countdown();
                    });
                });
            });
        });

        it('Should Subscribe to Hit Rate Report', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.parameters.measures = ['hitRate'];

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);

                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Profitability Report', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.reportId = 'price';
                reportContext.parameters.basis = 'tickets';
                reportContext.parameters.measures = ['profitability'];
                reportContext.parameters.aggregators = [];
                reportContext.parameters.currency = ['USD'];

                options = {
                    offset: 0
                };


                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Blotter Report', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.parameters = {
                    currency: ['USD']
                };
                reportContext.reportId = 'blotter';

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);

                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

//        it('Should Subscribe to Comparison Report', function (done) {
//            virtualTableService.connect(connectionOptions).then(function () {
//                countdownLatch.setLatch(2, done);
//                var masterContext = {
//                    parameters: {},
//                    dimensions: {},
//                    multiContextMode: 'uniongroup'
//                };
//
//                var childContext1 = {
//                    reportId: 'default',
//                    parameters: {
//                        aggregators: ['client'],
//                        measures: ['totalTraded'],
//                        startBucket: 0,
//                        bucketSize: 1,
//                        buckets: 10,
//                        basis: 'tickets',
//                        currency: ['USD']
//                    },
//                    dimensions: {
//                        client: ['Bygrave Capital', 'BlueCrest']
//                    }
//                };
//
//                var childContext2 = {
//                    reportId: 'default',
//                    parameters: {
//                        aggregators: ['client'],
//                        measures: ['totalTraded'],
//                        startBucket: 0,
//                        bucketSize: 1,
//                        buckets: 10,
//                        basis: 'tickets',
//                        currency: ['USD']
//                    },
//                    dimensions: {
//                        client: ['BNP Asst Mgmt', 'GoldmanSachs Asset Mgmt']
//                    }
//                };
//
//                masterContext.childContexts = [childContext1, childContext2];
//
//                dataSink.onSnapshotComplete = function () {
//                    tablePrinter.print(this);
//                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
//                    countdownLatch.countdown();
//                };
//
//                virtualTableService.subscribeToReport(masterContext, options, dataSink).then(function (virtualTableResp) {
//                    virtualTable = virtualTableResp;
//                    countdownLatch.countdown();
//                });
//            });
//        });

        it('Should Subscribe to Report with Multiple Measures', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.parameters.measures = ['totalTraded', 'hitRate'];

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report with Multiple Aggregators', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                reportContext.parameters.aggregators = ['client', 'tenor'];

                reportContext.dimensions = {
                    client: ['BlueCrest']
                };

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report with Multiple Aggregators and Multiple Sorting', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                reportContext.parameters.aggregators = ['client', 'clientTier'];

                options.columnsToSort = [
                    {name:'client', direction: 'ASC'},
                    {name:'clientTier', direction: 'ASC'}
                ];

               /* reportContext.dimensions = {
                    client: ['BlueCrest']
                };*/

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

//        it('Should Subscribe to Comparison Report with Multiple Aggregators', function (done) {
//            virtualTableService.connect(connectionOptions).then(function () {
//                countdownLatch.setLatch(2, done);
//                var masterContext = {
//                    parameters: {},
//                    dimensions: {},
//                    multiContextMode: 'uniongroup'
//
//                };
//
//                var childContext1 = {
//                    reportId: 'default',
//                    parameters: {
//                        aggregators: ['client', 'tenor'],
//                        measures: ['totalTraded'],
//                        startBucket: 0,
//                        bucketSize: 1,
//                        buckets: 10,
//                        basis: 'tickets',
//                        currency: ['USD']
//                    },
//                    dimensions: {
//                        client: ['Bygrave Capital', 'BlueCrest']
//                    }
//                };
//
//                var childContext2 = {
//                    reportId: 'default',
//                    parameters: {
//                        aggregators: ['client', 'tenor'],
//                        measures: ['totalTraded'],
//                        startBucket: 0,
//                        bucketSize: 1,
//                        buckets: 10,
//                        basis: 'tickets',
//                        currency: ['USD']
//                    },
//                    dimensions: {
//                        client: ['BNP Asst Mgmt', 'GoldmanSachs Asset Mgmt']
//                    }
//                };
//
//                masterContext.childContexts = [childContext1, childContext2];
//
//                dataSink.onSnapshotComplete = function () {
//                    tablePrinter.print(this);
//                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
//                    countdownLatch.countdown();
//                };
//
//                virtualTableService.subscribeToReport(masterContext, options, dataSink).then(function (virtualTableResp) {
//                    virtualTable = virtualTableResp;
//                    countdownLatch.countdown();
//                });
//            });
//        });

        it('Should Subscribe to Paged Report', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                options.limit = 5;

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toEqual(5);
                    expect(dataSink.status.totalRowCount).toEqual(11);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report Sorted Descending', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                options.limit = 5;
                options.columnsToSort[0].direction = 'DESC';

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(dataSink.getRowCount()).toEqual(5);
                    TestBase.assertColumnSortOrder(dataSink, 'client', options.columnsToSort[0].direction);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report Sorted Ascending', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                options.limit = 5;
                options.columnsToSort[0].direction = 'ASC';

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toEqual(5);
                    TestBase.assertColumnSortOrder(dataSink, 'client', options.columnsToSort[0].direction);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Fail To Subscribe to Report Sorted By Non Existent Column', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(1, done);
                options.columnsToSort[0].name = 'NOTREAL';

                virtualTableService.subscribeToReport(reportContext, options, dataSink)
                    .then(function (virtualTableResp) {
                    }).catch(function (error) {
                        console.log(error);
                        countdownLatch.countdown();
                    });
            });
        });

        it('Should Subscribe to Report with One Dimension Value Set', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.dimensions = {
                    client: ['BlueCrest']
                };

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toEqual(1);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report with Two Dimension Values Set', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                /*  reportContext.dimensions = {
                 client: ['BlueCrest', 'UBP']
                 };*/

                reportContext.dimensions = {
                    client: ['BlueCrest', 'UBP']
                };


                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(dataSink.getRowCount()).toEqual(2);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report with An Exclude Filter Set', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                /*  reportContext.dimensions = {
                 client: ['BlueCrest', 'UBP']
                 };*/

                reportContext.excludedFilters = {
                    client: ['BlueCrest']
                };


                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(this.getRowCount()).toBeGreaterThan(1);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        it('Should Subscribe to Report then Increase Page Size', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                options.limit = 5;
                var snapshotCount = 0;

                dataSink.onSnapshotComplete = function () {
                    snapshotCount++;
                    tablePrinter.print(this);

                    if (snapshotCount === 1) {
                        expect(this.getRowCount()).toEqual(5);

                        if (virtualTable) {
                            virtualTable.page(0, 10);
                        }
                    }
                    else if (snapshotCount === 2) {
                        expect(this.getRowCount()).toEqual(10);
                        countdownLatch.countdown();
                    }
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    if (snapshotCount === 1) {//have to do this as not sure if onSuccess or snapshot will complete first
                        virtualTable.page(0, 10);
                    }
                });
            });
        });

        it('Should Subscribe to Report then Decrease Page Size', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                var snapshotCount = 0;

                dataSink.onSnapshotComplete = function () {
                    snapshotCount++;
                    tablePrinter.print(this);

                    if (snapshotCount === 1) {
                        expect(this.getRowCount()).toEqual(11);

                        if (virtualTable) {
                            virtualTable.page(0, 5);
                        }
                    }
                    else if (snapshotCount === 2) {
                        expect(this.getRowCount()).toEqual(5);
                        countdownLatch.countdown();
                    }
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    if (snapshotCount === 1) {//have to do this as not sure if onSuccess or snapshot will complete first
                        virtualTable.page(0, 5);
                    }
                });
            });
        });

        it('Should Subscribe to Report then Change Sort Direction', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                var snapshotCount = 0;

                dataSink.onSnapshotComplete = function () {
                    snapshotCount++;
                    tablePrinter.print(this);

                    if (snapshotCount === 1) {
                        expect(this.getRowCount()).toEqual(11);

                        if (virtualTable) {
                            virtualTable.sort([{name: 'client', direction: 'DESC'}]);
                        }
                    }
                    else if (snapshotCount === 2) {
                        expect(this.getRowCount()).toEqual(11);
                        TestBase.assertColumnSortOrder(this, 'client', 'DESC');
                        countdownLatch.countdown();
                    }
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    if (snapshotCount === 1) {//have to do this as not sure if onSuccess or snapshot will complete first
                        virtualTable.sort([{name: 'client', direction: 'DESC'}]);
                    }
                });
            });
        });

        it('Should Subscribe to Report then Change Sort Direction Twice', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                var snapshotCount = 0;

                dataSink.onSnapshotComplete = function () {
                    snapshotCount++;
                    tablePrinter.print(dataSink);

                    if (snapshotCount === 1) {
                        expect(this.getRowCount()).toEqual(11);

                        if (virtualTable) {
                            virtualTable.sort([{name: 'client', direction: 'DESC'}]);
                        }
                    }
                    else if (snapshotCount === 2) {
                        expect(this.getRowCount()).toEqual(11);
                        TestBase.assertColumnSortOrder(this, 'client', 'DESC');
                        virtualTable.sort([{name: 'client', direction: 'ASC'}]);
                    } else if (snapshotCount === 3) {
                        expect(this.getRowCount()).toEqual(11);
                        TestBase.assertColumnSortOrder(this, 'client', 'ASC');
                        countdownLatch.countdown();
                    }
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    if (snapshotCount === 1) {//have to do this as not sure if onSuccess or snapshot will complete first
                        virtualTable.sort([{name: 'client', direction: 'DESC'}]);
                    }
                });
            });
        });

        it('Should Subscribe to Report and Then Subscribe to a Report with Different Basis', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(4, done);
                options.limit = 1;

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    // now do the second subscription
                    inject(function (DataSink) {
                        reportContext.parameters.basis = 'notional';
                        var dataSink2 = new DataSink();

                        dataSink2.onSnapshotComplete = function () {
                            tablePrinter.print(this);
                            expect(this.getRowCount()).toBeGreaterThan(0);
                            countdownLatch.countdown();
                        };

                        virtualTableService.subscribeToReport(reportContext, options, dataSink2).then(function () {
                            countdownLatch.countdown();
                        });
                    });
                });
            });
        });

        it('Should Subscribe to Report and Then Subscribe to a Report with Different Measure', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(4, done);
                options.limit = 1;

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                    // now do the second subscription
                    inject(function (DataSink) {
                        reportContext.parameters.measures = ['hitRate'];
                        var dataSink2 = new DataSink();

                        dataSink2.onSnapshotComplete = function () {
                            tablePrinter.print(this);
                            expect(this.getRowCount()).toBeGreaterThan(0);
                            expect(angular.equals(dataSink.data, dataSink2.data)).toBeFalsy();
                            countdownLatch.countdown();
                        };

                        virtualTableService.subscribeToReport(reportContext, options, dataSink2).then(function () {
                            countdownLatch.countdown();
                        });
                    });
                });
            });
        });

        it('Should Subscribe to Inquiries Report with 30 buckets', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);
                reportContext.parameters.buckets = 30;

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(Object.keys(this.data[0].buckets).length).toEqual(30);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();

                });
            });
        });

        it('Should Subscribe to Report Average Output', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                reportContext.output = 'averageProjection';
                reportContext.parameters.basis = 'notional';

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(this);
                    expect(this.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();
                };

                virtualTableService.subscribeToReport(reportContext, options, dataSink).then(function (virtualTableResp) {
                    virtualTable = virtualTableResp;
                    countdownLatch.countdown();
                });
            });
        });

        afterEach(function (done) {
            if (virtualTable !== undefined) {
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
            } else {
                TestBase.endDigest();
                done();
            }
        });

    });
});




