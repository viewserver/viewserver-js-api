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

    return function VirtualTableService($q, ClientService, VirtualTable) {
        var clientPromise;

        this.assertClientConnected = function () {
            // what exactly is this meant to do?? (cos it does nothing...)
            clientPromise = ClientService.getConnection();
        };

        this.isConnected = function () {
            return ClientService.isConnected();
        };

        this.connect = function(options){
            return ClientService.connect(options);
        };

        this.authenticate = function(type, tokens) {
            return ClientService.authenticate(type, tokens);
        };

        this.disconnect = function(){
            return ClientService.disconnect();
        };

        this.unsubscribe = function (subscriptionId) {
            ClientService.unsubscribe(subscriptionId);
        };

        this.executeSql = function(sql, permanent, dataSink){
            this.assertClientConnected();
            var virtualTablePromise = $q.defer();

            clientPromise.then(function () {
                var virtualTable = new VirtualTable(sql, null, dataSink, virtualTablePromise);
                var command = ClientService.executeSql(sql, permanent, virtualTable.dataSink);
                virtualTablePromise.promise.cancel = function(){
                    ClientService.unsubscribe(command.id);
                };
            }, function (error) {
                virtualTablePromise.reject(error);
            });

            return virtualTablePromise.promise;
        };

        this.subscribe = function(operatorName, options, dataSink, output, projection){
            this.assertClientConnected();
            var virtualTablePromise = $q.defer();

            clientPromise.then(function () {
                var virtualTable = new VirtualTable(operatorName, options, dataSink, virtualTablePromise);
                var command = ClientService.subscribe(operatorName, virtualTable.options, virtualTable.dataSink, output, projection);
                virtualTablePromise.promise.cancel = function(){
                    ClientService.unsubscribe(command.id);
                };
            }, function (error) {
                virtualTablePromise.reject(error);
            });

            return virtualTablePromise.promise;
        };

        this.subscribeToReport = function (context, options, dataSink) {
            this.assertClientConnected();
            var virtualTablePromise = $q.defer();

            clientPromise.then(function () {
                var virtualTable = new VirtualTable(context, options, dataSink, virtualTablePromise);
                var command = ClientService.subscribeToReport(virtualTable.context, virtualTable.options, virtualTable.dataSink);
                virtualTablePromise.promise.cancel = function(){
                    ClientService.unsubscribe(command.id);
                };
            }, function (error) {
                virtualTablePromise.reject(error);
            });

            return virtualTablePromise.promise;
        };

        this.subscribeToDimension = function (dimension, context, options, dataSink) {
            this.assertClientConnected();
            var virtualTablePromise = $q.defer();

            clientPromise.then(function () {
                var virtualTable = new VirtualTable(context, options, dataSink, virtualTablePromise);
                var command = ClientService.subscribeToDimension(dimension, virtualTable.context, virtualTable.options, virtualTable.dataSink);
                virtualTablePromise.promise.cancel = function(){
                    ClientService.unsubscribe(command.id);
                };
            }, function (error) {
                virtualTablePromise.reject(error);
            });

            return virtualTablePromise.promise;
        };

        this.subscribeToDimensionList = function(dataSource, options, dataSink){
            return this.subscribe('/datasources/' + dataSource + '/dimensions', options, dataSink);
        };

        this.subscribeToReportList = function(options, dataSink){
            var reportListDataSink = $.extend(true, {}, dataSink);

            //intercept the onRowAdded and update events so we can parse the report json and then forward
            reportListDataSink.onRowAdded = function(rowId, row){
                row.json = $.parseJSON(row.json);
                dataSink.onRowAdded(rowId, row);
            };

            reportListDataSink.onRowUpdate = function(rowId, row){
                row.json = $.parseJSON(row.json);
                dataSink.onRowUpdate(rowId, row);
            };

            return this.subscribe('report_registry', options, reportListDataSink);
        };

    };
});

