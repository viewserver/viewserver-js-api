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

    return function (Network, Command, ReportContextMapper, OptionsMapper, ProtoLoader, RowEventMapper, ProjectionMapper) {

        function Client(url, protocol) {
            this.url = url;
            this.network = new Network();
        }

        Client.prototype.connect = function (eventHandlers) {
            this.network.connect(this.url, eventHandlers);
        };

        Client.prototype.authenticate = function (type, tokens, eventhandlers) {
            if (Object.prototype.toString.call(tokens) !== '[object Array]') {
                tokens = [tokens];
            }

            var authenticateCommand = new ProtoLoader.Dto.AuthenticateCommandDto();
            authenticateCommand.setType(type);
            authenticateCommand.setToken(tokens);
            this.sendCommand('authenticate', authenticateCommand, false, eventhandlers);
        };

        Client.prototype.disconnect = function (eventHandlers) {
            this.network.disconnect(eventHandlers);
        };

        Client.prototype.unsubscribe = function (commandId, eventHandlers) {
            var unsubscribeCommand = new ProtoLoader.Dto.UnsubscribeCommandDto(commandId);
            this.network.removeOpenCommand(commandId);
            return this.sendCommand('unsubscribe', unsubscribeCommand, false, eventHandlers);
        };

        Client.prototype.executeSql = function (query, permanent, dataSink) {
            var sqlCommand = new ProtoLoader.Dto.ExecuteSqlCommandDto(query, permanent);
            return this.sendCommand('executeSql', sqlCommand, true, dataSink);
        };

        Client.prototype.subscribe = function (operatorName, options, dataSink, output, projection) {
            var optionsDto = OptionsMapper.toDto(options);

            var subscribeCommand = new ProtoLoader.Dto.SubscribeCommandDto(operatorName, output || 'out', optionsDto);
            if (projection !== undefined) {
                subscribeCommand.setProjection(ProjectionMapper.toDto(projection));
            }
            return this.sendCommand('subscribe', subscribeCommand, true, dataSink);
        };

        Client.prototype.subscribeToReport = function (reportContext, options, dataSink) {
            var reportContextDto = ReportContextMapper.toDto(reportContext);
            var optionsDto = OptionsMapper.toDto(options);

            var subscribeReportCommand = new ProtoLoader.Dto.SubscribeReportCommandDto();
            subscribeReportCommand.setContext(reportContextDto);
            subscribeReportCommand.setOptions(optionsDto);

            return this.sendCommand('subscribeReport', subscribeReportCommand, true, dataSink);
        };

        Client.prototype.subscribeToDimension = function (dimension, reportContext, options, dataSink) {
            var reportContextDto = ReportContextMapper.toDto(reportContext);
            var optionsDto = OptionsMapper.toDto(options);

            var subscribeReportCommand = new ProtoLoader.Dto.SubscribeDimensionCommandDto();
            subscribeReportCommand.setDimension(dimension);
            subscribeReportCommand.setContext(reportContextDto);
            subscribeReportCommand.setOptions(optionsDto);

            return this.sendCommand('subscribeDimension', subscribeReportCommand, true, dataSink);

        };

        Client.prototype.updateSubscription = function (commandId, options, eventHandlers) {
            var optionsDto = OptionsMapper.toDto(options);
            var updateSubscriptionCommand = new ProtoLoader.Dto.UpdateSubscriptionCommandDto(commandId, optionsDto);
            return this.sendCommand('updateSubscription', updateSubscriptionCommand, false, eventHandlers);
        };

        Client.prototype.editTable = function (operatorName, dataSink, rowEvents, eventHandlers) {
            var tableEvent = new ProtoLoader.Dto.TableEventDto();
            var rowEventDtos = [];
            $.each(rowEvents, function (index, rowEvent) {
                rowEventDtos.push(RowEventMapper.toDto(rowEvent, dataSink));
            });
            tableEvent.setRowEvents(rowEventDtos);

            var tableEditCommand = new ProtoLoader.Dto.TableEditCommandDto(operatorName, tableEvent);
            return this.sendCommand('tableEdit', tableEditCommand, false, eventHandlers);
        };

        Client.prototype.sendCommand = function (commandName, commandDto, continuous, eventHandlers) {
            var command = new Command(commandName, commandDto);
            command.handler = eventHandlers;
            command.continuous = continuous;
            return this.network.sendCommand(command);
        };

        return Client;
    };
});
