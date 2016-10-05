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

    return function AngularDataSink($http, $timeout, DataSink) {
        return augment(DataSink, function (parent) {
            this.constructor = function ($scope) {
                parent.constructor.call(this);
                this.$scope = $scope;
            };

            var apply = function() {
                $timeout(function() {});
            };

            this.reset = function () {
                parent.reset.call(this);
                apply();
            };

            this.onSchemaReset = function() {
                parent.onSchemaReset.call(this);
                apply();
            };

            this.onDataReset = function() {
                parent.onDataReset.call(this);
                apply();
            };

            this.onSnapshotComplete = function(){
                parent.onSnapshotComplete.call(this);
                apply();
            };

            this.onRowAdded = function (rowId, row) {
                parent.onRowAdded.call(this, rowId, row);
                apply();
                return row;
            };

            this.onRowUpdated = function (rowId, row) {
                parent.onRowUpdated.call(this, rowId, row);
                apply();
                return row;
            };

            this.onRowRemoved = function (rowId) {
                parent.onRowRemoved.call(this, rowId);
                apply();
            };
        });
    };
});
