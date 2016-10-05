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

    return function (Logger, Command, RowMapper, TableMetaDataMapper, ProtoLoader) {

        function Network() {
            this.commandId = 0;
            this.openCommands = [];

            //Private functions
            this.send = function (buffer) {
                if (this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(buffer);
                } else {
                    Logger.error('Web socket is not open! (state=' + this.socket.readyState + ')');
                }
            };

            this.sendMessage = function (message) {
                var messageWrapper = new ProtoLoader.Dto.MessageDto();
                if (message instanceof ProtoLoader.Dto.HeartbeatDto) {
                    messageWrapper.heartbeat = message;
                } else if (message instanceof ProtoLoader.Dto.CommandDto) {
                    messageWrapper.command = message;
                }
                this.send(messageWrapper.toArrayBuffer());
            };


            this.sendHeartbeat = function () {
                var heartbeat = new ProtoLoader.Dto.HeartbeatDto(ProtoLoader.Dto.HeartbeatDto.Type.PING);
                this.sendMessage(heartbeat);
            };

            this.receiveHeartBeat = function (heartBeat) {
                if (heartBeat.type === ProtoLoader.Dto.HeartbeatDto.Type.PING) {
                    this.sendHeartbeat();
                } else {
                    // Logger.debug('PONG!');
                }
            };

            this.receiveCommandResult = function (commandResult) {
                Logger.debug('Received command result', commandResult);

                var command = this.openCommands[commandResult.getId()];

                if (!command) {
                    Logger.warning('Received command result from command that no longer exists. Was this command cancelled ??' + commandResult.getId());
                    return;
                }

                if (!commandResult.getSuccess() || !command.continuous) {
                    delete this.openCommands[this.openCommands.indexOf(command)];
                }

                if (command.handler) {
                    if (commandResult.getSuccess()) {
                        command.handler.onSuccess(commandResult.getId());
                    } else {
                        command.handler.onError(commandResult.getMessage());
                    }
                }
            };

            this.receiveTableEvent = function (tableEvent) {
                Logger.fine('Received table event', tableEvent);

                var command = this.openCommands[tableEvent.getId()];

                if (!command) {
                    Logger.warning('Could not find command: ' + tableEvent.getId() + ' subscription has most likely been cancelled while data on the wire');
                    return;
                }

                var tableMetaData = TableMetaDataMapper.fromDto(tableEvent.metaData);

                if (command.handler) {
                    command.handler.onTotalRowCount(tableMetaData.totalSize);

                    this.handleStatuses(tableEvent.statuses, command.handler);
                    this.handleSchemaChange(tableEvent.schemaChange, command.handler);
                    this.handleRowEvents(tableEvent.rowEvents, command.handler);
                    this.handleFlags(tableEvent, command.handler);
                }
            };

            this.handleStatuses = function (statuses, handler) {
                if (statuses) {
                    $.each(statuses, function (index, statusDto) {
                        switch (statusDto.status) {
                            case ProtoLoader.Dto.StatusDto.StatusId.SCHEMARESET:
                            {
                                Logger.fine('Received schema reset');
                                handler.onSchemaReset();
                                break;
                            }
                            case ProtoLoader.Dto.StatusDto.StatusId.DATARESET:
                            {
                                Logger.fine('Received data reset');
                                handler.onDataReset();
                                break;
                            }
                            default:
                            {
                                Logger.warning('Received unknown status ' + statusDto.status);
                                break;
                            }
                        }
                    });
                }
            };

            this.handleFlags = function (tableEvent, handler) {
                if (tableEvent.flags && tableEvent.flags === 1) {
                    handler.onSnapshotComplete();
                }
            };

            this.handleSchemaChange = function (schemaChange, handler) {
                if (schemaChange) {
                    $.each(schemaChange.addedColumns, function (index, addedColumn) {
                        Logger.fine('Column added', addedColumn);

                        handler.onColumnAdded(addedColumn.columnId, {name: addedColumn.name, type: addedColumn.type});
                    });

                    $.each(schemaChange.removedColumns, function (index, removedColumnId) {
                        Logger.fine('Column removed', removedColumnId);
                        handler.onColumnRemoved(removedColumnId);
                    });
                }
            };

            this.handleRowEvents = function (rowEvents, handler) {
                if (rowEvents) {
                    var row;

                    $.each(rowEvents, function (index, rowEvent) {
                        switch (rowEvent.eventType) {
                            case 0: //add
                                row = RowMapper.fromDto(handler.schema, rowEvent.values);
                                Logger.fine('Row added', row);
                                handler.onRowAdded(rowEvent.rowId, row);
                                break;
                            case 1: //update
                                row = RowMapper.fromDto(handler.schema, rowEvent.values);
                                Logger.fine('Row updated', row);
                                handler.onRowUpdated(rowEvent.rowId, row);
                                break;
                            case 2: //remove
                                handler.onRowRemoved(rowEvent.rowId);
                                break;
                            default:
                                Logger.error('Unknown row event type received: ' + rowEvent.eventType);
                        }
                    });
                }
            };
        }

        Network.prototype.connect = function (uri, eventHandlers) {
            var _self = this;

            this.socket = new WebSocket(uri);
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = function () {
                Logger.debug('Network Connected');
                eventHandlers.onSuccess();
            };

            this.socket.onclose = function (e) {
                Logger.debug('Network Disconnected');
                var reason;

                switch(e.code){
                    case 1000:
                        reason = 'Normal closure, meaning that the purpose for which the connection was established has been fulfilled.';
                        break;
                    case 1001:
                        reason = 'An endpoint is \'going away\', such as a server going down or a browser having navigated away from a page.';
                        break;
                    case 1002:
                        reason = 'An endpoint is terminating the connection due to a protocol error';
                        break;
                    case 1003:
                        reason = 'An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).';
                        break;
                    case 1004:
                        reason = 'Reserved. The specific meaning might be defined in the future.';
                        break;
                    case 1005:
                        reason = 'No status code was actually present.';
                        break;
                    case 1006:
                        reason = 'The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
                        break;
                    case 1007:
                        reason = 'An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).';
                        break;
                    case 1008:
                        reason = 'An endpoint is terminating the connection because it has received a message that \'violates its policy\'. This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
                        break;
                    case 1009:
                        reason = 'An endpoint is terminating the connection because it has received a message that is too big for it to process.';
                        break;
                    case 1010:
                        reason = 'An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn\'t return them in the response message of the WebSocket handshake. Specifically, the extensions that are needed are: ' + e.reason;
                        break;
                    case 1011:
                        reason = 'A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
                        break;
                    case 1015:
                        reason = 'The connection was closed due to a failure to perform a TLS handshake';
                        break;
                    default:
                        reason = 'Unknown reason';
                }

                if(e.code > 1000 && e.wasClean === false){
                    eventHandlers.onError(reason);
                }
            };

            this.socket.onmessage = function (evt) {
                Logger.fine('Network Received msg');

                if (evt.data.byteLength === 0) {
                    return;
                }

                Logger.fine('about to decode');
                var msg = ProtoLoader.Dto.MessageDto.decode(evt.data);
                Logger.fine('decoded');

                switch (msg.message) {
                    case 'heartbeat':
                    {
                        _self.receiveHeartBeat(msg.heartbeat);
                        break;
                    }
                    case 'commandResult':
                    {
                        _self.receiveCommandResult(msg.commandResult);
                        break;
                    }
                    case 'tableEvent':
                    {
                        _self.receiveTableEvent(msg.tableEvent);
                        break;
                    }
                    default:
                    {
                        Logger.error('Unknown message type "' + msg.message + '"');
                        break;
                    }
                }

            };
        };

        Network.prototype.disconnect = function (eventHandlers) {
            this.socket.onclose = eventHandlers.onSuccess;

            this.socket.close();
        };

        Network.prototype.sendCommand = function (command) {
            command.id = this.commandId++;
            this.openCommands[command.id] = command;

            Logger.info('Sending command ' + command.id + ' - ' + command.command);
            Logger.fine(JSON.stringify(command.data));


            var commandDto = new ProtoLoader.Dto.CommandDto(command.id, command.command);
//            commandDto.data = command.data.encode();
            commandDto.set('.' + command.command + 'Command', command.data);
            this.sendMessage(commandDto);
            return command;
        };

        Network.prototype.removeOpenCommand = function (commandId) {
            delete this.openCommands[commandId];
            Logger.fine('Removing command ' + commandId);
        };

        return Network;
    };
});
