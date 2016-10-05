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

    return function (Logger) {

        function DataSink() {
            this.data = [];
            this.schema = [];
            this.status = {
                totalRowCount: 0,
                snapshotComplete: false
            };

            this.init = function () {
                this.status.snapshotComplete = false;

                this.rowIdToRowMap = [];
            };

            this.getRowForRowId = function (rowId) {
                var row = this.rowIdToRowMap[rowId];
                if (row === undefined) {
                    throw 'Unable to get row for rowId ' + rowId;
                }
                return row;
            };


            this.getIndexForRowId = function (rowId) {
                var row = this.getRowForRowId(rowId);
                var index = this.data.indexOf(row);
                if (index === -1) {
                    throw 'Unable to get index for rowId ' + rowId;
                }
                return index;
            };

            this.init();
        }

        DataSink.prototype.reset = function () {
            this.onSchemaReset();
        };

        DataSink.prototype.onSchemaReset = function() {
            while (this.schema.length > 0) {
                this.schema.pop();
            }

            this.onDataReset();
        };

        DataSink.prototype.onDataReset = function() {
            this.init();

            while (this.data.length > 0) {
                this.data.pop();
            }
        };

        DataSink.prototype.getRowCount = function () {
            return this.data.length;
        };

        DataSink.prototype.onSnapshotComplete = function () {
            this.status.snapshotComplete = true;
        };

        DataSink.prototype.onRowAdded = function (rowId, row) {
            //console.log('rowAdded: ' + JSON.stringify(row.buckets));
            this.rowIdToRowMap[rowId] = row;
            this.data.push(row);
        };

        DataSink.prototype.onRowUpdated = function (rowId, row) {
            var index = this.getIndexForRowId(rowId);

            $.extend(true, this.rowIdToRowMap[rowId], row);
            this.data[index] = this.rowIdToRowMap[rowId];
        };

        DataSink.prototype.onRowRemoved = function (rowId) {
            var index = this.getIndexForRowId(rowId);
            this.data.splice(index, 1);
            delete this.rowIdToRowMap[rowId];
        };

        DataSink.prototype.onColumnAdded = function (colId, col) {
            this.schema[colId] = col;
        };

        DataSink.prototype.onTotalRowCount = function (totalRowCount) {
            this.status.totalRowCount = totalRowCount;
        };

        DataSink.prototype.getColumnId = function (name) {
            for (var i = 0; i < this.schema.length; i++) {
                if (this.schema[i].name === name) {
                    return i;
                }
            }
            return -1;
        };

        DataSink.prototype.getColumn = function (colId) {
            return this.schema[colId];
        };

        return DataSink;
    };
});
