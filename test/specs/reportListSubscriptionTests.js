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
    var options;

    describe('Report List Subscription Tests', function () {
        var connectionOptions = {
            url: 'ws://localhost:8080'
        }

        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();

            options = {
                columnsToSort: [
                    {
                        name: 'id',
                        direction: 'ASC'
                    }
                ],
                offset: 0
            };
        });

        it('Should Subscribe to Report List', function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                countdownLatch.setLatch(2, done);

                dataSink.onSnapshotComplete = function () {
                    tablePrinter.print(dataSink);
                    expect(dataSink.getRowCount()).toBeGreaterThan(0);
                    countdownLatch.countdown();

                };

                virtualTableService.subscribeToReportList(options, dataSink).then(function (virtualTableResp) {
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




