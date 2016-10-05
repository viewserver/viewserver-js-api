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

    describe('Proto Loader Tests', function() {
        beforeEach(function (done) {
            TestBase.setup(done);
            TestBase.digest();
        });

        it('Should Load Custom Proto Files', function(done) {
            countdownLatch.setLatch(1, done);

            protoLoader.registerProtoFile('base/test/test.proto').then(function() {
                // make sure we can instantiate our new message...
                var message = new protoLoader.Dto.TestMessage();

                // ...as well as our own core messages
                var reportContext = new protoLoader.Dto.ReportContextDto();

                countdownLatch.countdown();
            });
        });
    });
});