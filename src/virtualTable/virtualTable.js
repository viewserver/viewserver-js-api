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

    return function(ClientService) {
        var defaultContext = {
            parameters: {},
            dimensions: {},
            reportId: 'default',
            excludedFilters: {}
        };

        var defaultOptions = {
            offset: 0,
            limit: 100,
            columnsToSort: []
        };

        function VirtualTable(context, options, dataSink, virtualTablePromise) {
            this.context =  $.extend(true, {}, defaultContext, context);
            this.options = $.extend(true, {}, defaultOptions, options);

            this.totalRowCount = 0;
            this.commandId = -1;
            this.dataSink = dataSink;
            this.operatorName = (typeof context === 'string') ? context : undefined;

            this.updateSubscription = function () {
                return ClientService.updateSubscription(this.commandId, this.options);
            };

            this.initDataSink = function (virtualTablePromise) {
                var _self = this;

                var defaultDataSink = {
                    onRowAdded: function (id, row) {
                    },
                    onRowUpdated: function (id, row) {
                    },
                    onRowRemoved: function (id) {
                    },
                    onColumnAdded: function (colId, col) {
                    },
                    onSnapshotComplete: function () {
                    },
                    onTotalRowCount: function(totalRowCount){},
                    onSuccess: function (subscriptionId) {
                        _self.setCommandId(subscriptionId);
                        virtualTablePromise.resolve(_self);
                    },
                    onError: function (response) {
                        virtualTablePromise.reject(response);
                    }
                };

                this.dataSink = $.extend({}, defaultDataSink, this.dataSink);
            };

            this.initDataSink(virtualTablePromise);
        }

        VirtualTable.prototype.sort = function (sortColumns) {
            if(sortColumns !== this.options.columnsToSort) {
                this.options.columnsToSort = sortColumns;
                return this.updateSubscription();
            }
        };

        VirtualTable.prototype.page = function (offset, limit) {
            if(offset !== this.options.offset || limit !== this.options.limit) {
                this.options.offset = offset;
                this.options.limit = limit;
                return this.updateSubscription();
            }
        };

        VirtualTable.prototype.filter = function (mode, expression) {
            if (mode !== this.options.filterMode || expression !== this.options.filterExpression) {
                this.options.filterMode = mode;
                this.options.filterExpression = expression;
                return this.updateSubscription();
            }
        };

        VirtualTable.prototype.unsubscribe = function () {
            this.dataSink.reset();
            return ClientService.unsubscribe(this.getCommandId());
        };

        VirtualTable.prototype.getTotalRowCount = function () {
            return this.dataSink.totalRowCount;
        };

        VirtualTable.prototype.getLoadedRowCount = function () {
            return this.dataSink.data.length;
        };

        VirtualTable.prototype.getCommandId = function () {
            return this.commandId;
        };

        VirtualTable.prototype.setCommandId = function (commandId) {
            this.commandId = commandId;
        };

        VirtualTable.prototype.editTable = function (rowEvents) {
            return ClientService.editTable(this.operatorName, this.dataSink, rowEvents);
        };

        return VirtualTable;
    };
});
