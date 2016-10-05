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

    return function RowEventMapper(ProtoLoader, RowEvent) {
        return augment(Object, function () {
            var mapRowEventType = function (rowEventType) {
                switch (rowEventType) {
                    case RowEvent.EventType.ADD: {
                        return ProtoLoader.Dto.RowEventDto.RowEventType.ADD;
                    }
                    case RowEvent.EventType.UPDATE: {
                        return ProtoLoader.Dto.RowEventDto.RowEventType.UPDATE;
                    }
                    case RowEvent.EventType.REMOVE: {
                        return ProtoLoader.Dto.RowEventDto.RowEventType.REMOVE;
                    }
                }
            };

            this.toDto = function (rowEvent, dataSink) {
                var rowEventDto = new ProtoLoader.Dto.RowEventDto(mapRowEventType(rowEvent.type));
                if (rowEvent.rowId >= 0) {
                    rowEventDto.setRowId(rowEvent.rowId);
                }
                var columnValueDtos = [];
                $.each(rowEvent.columnValues, function (key, value) {
                    var columnId;
                    if (typeof key === 'string') {
                        columnId = parseInt(key);
                        if (isNaN(columnId)) {
                            columnId = dataSink.getColumnId(key);
                        }
                    } else {
                        columnId = key;
                    }
                    var columnValue = new ProtoLoader.Dto.RowEventDto.ColumnValue(columnId);
                    if (value === null) {
                        columnValue.set('nullValue', -1); // -1 is arbitrary
                    } else {
                        var column = dataSink.getColumn(columnId);
                        switch (column.type) {
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.BOOLEAN:
                            {
                                columnValue.set('booleanValue', value);
                                break;
                            }
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.BYTE:
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.SHORT:
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.INTEGER:
                            {
                                columnValue.set('intValue', value);
                                break;
                            }
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.LONG:
                            {
                                columnValue.set('longValue', value);
                                break;
                            }
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.FLOAT:
                            {
                                columnValue.set('floatValue', value);
                                break;
                            }
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.DOUBLE:
                            {
                                columnValue.set('doubleValue', value);
                                break;
                            }
                            case ProtoLoader.Dto.SchemaChangeDto.AddColumn.ColumnType.STRING:
                            {
                                columnValue.set('stringValue', value);
                                break;
                            }
                        }
                    }
                    columnValueDtos.push(columnValue);
                });
                rowEventDto.setValues(columnValueDtos);
                return rowEventDto;
            };
        });
    };
});