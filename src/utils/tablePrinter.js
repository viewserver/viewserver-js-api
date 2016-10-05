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

    return function TablePrinter(DataSink) {
        return augment(Object, function () {
            this.print = function (dataSink) {
                if (!dataSink instanceof DataSink) {
                    throw 'parameter dataSink should be of type DataSink';
                }

                console.log('-- Begin Table: ' + dataSink.getRowCount() + ' rows --');
            //    console.log(JSON.stringify(dataSink.data, true, 2));

//console.dir(dataSink.data);
                for (var row in dataSink.data) {
                    console.log(dataSink.data[row]);
                }

                console.log('-- End Table --');
            };
        });
    };
});

