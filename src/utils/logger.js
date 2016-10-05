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

    var augment = require('augment');

    return function Logger() {
        return augment(Object, function () {


            //Private functions
            this._log = function (logLevel, message, json) {
                if (logLevel.level <= this.LOGLEVEL) {
                    var dateTime = new Date();
                    message = '[' + logLevel.label + ' ' +
                    dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds() + ':' + dateTime.getMilliseconds() +
                    '] ' + message;

                    this._output(logLevel, message);

                    if (json) {
                        this._output(logLevel, json);
                    }
                }
            };

            this.setLogLevel = function(logLevel){
                this.LOGLEVEL = logLevel;
                console.log('Logger logLevel set to: ' + this.LOGLEVEL);
            };

            this._output = function (logLevel, message) {
                if (logLevel === this.logLevels.Error) {
                    console.error(message);
                } else {
                    console.log(message);
                }
            };

            this.logLevels = {
                Error: {
                    level: 0,
                    label: 'Error'
                },
                Warning: {
                    level: 1,
                    label: 'Warning'
                },
                Info: {
                    level: 2,
                    label: 'Info'
                },
                Debug: {
                    level: 3,
                    label: 'Debug'
                },
                Fine: {
                    level: 4,
                    label: 'Fine'
                }
            };

            this.error = function (message, json) {
                this._log(this.logLevels.Error, message, json);
            };

            this.warning = function (message, json) {
                this._log(this.logLevels.Warning, message, json);
            };

            this.info = function (message, json) {
                this._log(this.logLevels.Info, message, json);
            };

            this.debug = function (message, json) {
                this._log(this.logLevels.Debug, message, json);
            };

            this.fine = function (message, json) {
                this._log(this.logLevels.Fine, message, json);
            };

            //by default log level set to 3
            this.setLogLevel(3);
        });
    };
});
