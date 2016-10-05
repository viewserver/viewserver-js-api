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

    describe('Connection Tests', function () {
        var connectionOptions = {
            url: 'ws://localhost:8080'
        }

        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();
        });

        it("Should Connect to ViewServer", function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                logger.debug('Subscription success');
                done();
            }, function(e){

            });
        });

        it("Should Not Connect to Unavailable ViewServer", function (done) {
            var invalidConnectionOptions = {
                url: 'ws://localhost:1000'
            }

            virtualTableService.connect(invalidConnectionOptions).then(function () {
            }, function(e){
                logger.debug('Could not connect to viewserver - as expected')
                done();
            });
        });

        it("Should Authenticate", function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                virtualTableService.authenticate("open", "admin@viewserver.com").then(function () {
                    logger.debug('Authenticated successfully');
                    done();
                });
            })
        });

        it("Should Connect to ViewServer, Disconnect and Reconnect", function (done) {
            virtualTableService.connect(connectionOptions).then(function () {
                virtualTableService.disconnect().then(function () {
                    virtualTableService.connect(connectionOptions).then(function () {
                        logger.debug('Subscription success');
                        done();
                    });
                });

            });
        });

        afterEach(function () {
            virtualTableService.disconnect();
            console.log('After Each');
            TestBase.endDigest();
        });

    });
});




