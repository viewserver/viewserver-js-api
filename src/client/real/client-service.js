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

        return function ClientService($q, $http, Client, Logger) {
            var _self = this;
            this.clientPromise = $q.defer();
            this.connectionStatusPromise = $q.defer();
            this.connected = false;

            this.getConnection = function () {
                return this.clientPromise.promise;
            };

            this.getStatus = function(){
              return this.connectionStatusPromise.promise;
            };

            this.connect = function(options){
                if(!this.client) {
                    this.client = new Client(options.url);

                    this.client.connect({
                        onSuccess: function () {
                            _self.connected = true;
                            _self.clientPromise.resolve();
                            _self.connectionStatusPromise.notify({isConnected: true});
                        },
                        onError: function (e) {
                            _self.connected = false;
                            _self.clientPromise.reject(e);
                            _self.connectionStatusPromise.notify({isConnected: false, msg: e});
                            Logger.error(e);
                        }
                    });
                }

                return this.clientPromise.promise;
            };

            this.authenticate = function(type, tokens){
                var authenticatePromise = $q.defer();

                this.client.authenticate(type, tokens, {
                    onSuccess: function() {
                        authenticatePromise.resolve();
                    },
                    onError: function(e) {
                        authenticatePromise.reject(e);
                        Logger.error(e);
                    }
                });

                return authenticatePromise.promise;
            };

            this.disconnect = function(){
                var disconnectPromise = $q.defer();
                var _self = this;

                if (this.client) {
                    this.client.disconnect({
                        onSuccess: function () {
                            _self.connected = false;
                            _self.client = undefined;
                            _self.clientPromise = $q.defer();
                            disconnectPromise.resolve();
                        },
                        onError: function (e) {
                            disconnectPromise.reject(e);
                            Logger.error(e);
                        }
                    });
                } else {
                    disconnectPromise.resolve();
                }

                return disconnectPromise.promise;
            };

            this.executeSql = function (query, permanent, dataSink) {
                Logger.debug('Subscribing to sql ' + query);
                return this.client.executeSql(query, permanent, dataSink);
            };

            this.subscribe = function (operatorName, options, dataSink, output, projection) {
                return this.client.subscribe(operatorName, options, dataSink, output, projection);
            };

            this.subscribeToReport = function (context, options, dataSink) {
                Logger.debug('Subscribing to report ' + context.reportId + ' with context : ' + JSON.stringify(context) + ' options: ' + JSON.stringify(options));
                return this.client.subscribeToReport(context, options, dataSink);
            };

            this.subscribeToDimension = function(dimension, context, options, dataSink){
                Logger.debug('Subscribing to dimension ' + dimension + ' with context : ' + JSON.stringify(context) + ' options: ' + JSON.stringify(options));
                return this.client.subscribeToDimension(dimension, context, options, dataSink);
            };

            this.updateSubscription = function(commandId, options){
                var updateSubscriptionPromise = $q.defer();

                Logger.debug('Updating subscription ' + commandId + ' with options: ' + JSON.stringify(options));
                this.client.updateSubscription(commandId, options,
                    {
                        onSuccess: function(){
                            updateSubscriptionPromise.resolve();
                        },
                        onError: function(e){
                            updateSubscriptionPromise.reject(e);
                        }
                    });

                return updateSubscriptionPromise.promise;
            };

            this.unsubscribe = function (commandId) {
                var unsubscribePromise = $q.defer();
                this.client.unsubscribe(commandId,
                    {
                        onSuccess: function(){
                            Logger.debug('Unsubscribed: ' + commandId);
                            unsubscribePromise.resolve(commandId);
                        },
                        onError: function(e){
                            Logger.error(e);
                            unsubscribePromise.reject(e);
                        }
                    });

                return unsubscribePromise.promise;
            };

            this.editTable = function (operatorName, dataSink, rowEvents) {
                var editTablePromise = $q.defer();

                this.client.editTable(operatorName, dataSink, rowEvents, {
                    onSuccess: function() {
                        Logger.debug('Edited table');
                        editTablePromise.resolve();
                    },
                    onError: function(e) {
                        Logger.error(e);
                        editTablePromise.reject(e);
                    }
                });

                return editTablePromise.promise;
            };

            this.sendCommand = function (commandName, commandDto, continuous) {
                var sendCommandPromise = $q.defer();

                this.client.sendCommand(commandName, commandDto, continuous, {
                    onSuccess: function() {
                        sendCommandPromise.resolve();
                    },
                    onError: function(e) {
                        Logger.error(e);
                        sendCommandPromise.reject(e);
                    }
                });

                return sendCommandPromise.promise;
            };

            this.isConnected = function () {
                return this.connected;
            };
        };
    }
)
;
