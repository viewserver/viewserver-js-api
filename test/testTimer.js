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

define(['bower_components/augment/augment', 'utils/logger'], function (augment, Logger) {
    'use strict';
    var TestTimer = augment(Object, function () {
        this.seconds = 1000

        this.formatTime = function(dateTime){
            return dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds() + ":" + dateTime.getMilliseconds();
        };

        this.findDifference = function(start, end){
            return ( end.getTime() - start.getTime() ) / 1000;
        };

        this.start = function(){
            this.startTime = new Date();
            Logger.info("Start Time: " + this.formatTime(this.startTime));
        };

        this.stop = function(){
            this.endTime = new Date();
            Logger.info("End Time: " + this.formatTime(this.endTime));
            Logger.info("Time Taken: " + this.findDifference(this.startTime, this.endTime));
        };
    });

    return TestTimer;
});

