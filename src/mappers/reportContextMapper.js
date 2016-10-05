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

    return function ReportContextMapper(ProtoLoader) {
        return augment(Object, function () {
            this.toDto = function (reportContext) {

                var reportContextCopy = $.extend(true, {}, reportContext);
                this._enrichParameters(reportContextCopy.parameters);

                var reportContextDto = new ProtoLoader.Dto.ReportContextDto();
                reportContextDto.setParameters(this._mapParameters(reportContextCopy.parameters, this._buildParameter));
                reportContextDto.setDimensions(this._mapParameters(reportContextCopy.dimensions, this._buildDimension));
                reportContextDto.setExcludedFilters(this._mapParameters(reportContextCopy.excludedFilters, this._buildDimension));
                reportContextDto.setChildContexts(this._mapChildContexts(reportContextCopy.childContexts));

                if(reportContextCopy.reportId !== undefined) {
                    reportContextDto.setReportId(reportContextCopy.reportId);
                }

                if(reportContextCopy.multiContextMode !== undefined) {
                    reportContextDto.setMultiContextMode(reportContextCopy.multiContextMode);
                }

                if(reportContextCopy.output !== undefined) {
                    reportContextDto.setOutput(reportContextCopy.output);
                }

                return reportContextDto;
            };

            this._mapChildContexts = function(childContexts){
                var _self = this;
                var childContextDtos = [];

                if(childContexts !== undefined) {
                    $.each(childContexts, function (index, childContext) {
                        childContextDtos.push(_self.toDto(childContext));
                    });
                }

                return childContextDtos;
            };

            this._enrichParameters = function(parameters){
                if(parameters.aggregators && parameters.aggregators.length > 1){
                    this._addSubTotalParameters(parameters);
                }
            };

            this._addSubTotalParameters = function(parameters){
                var subTotalString = '';
                parameters.subtotals = [];

                $.each(parameters.aggregators, function(i, aggregator){
                    subTotalString += aggregator + '|';
                    parameters.subtotals.push(subTotalString + 'bucket');
                });
            };

            this._buildParameter = function (name, value) {
                return new ProtoLoader.Dto.ReportContextDto.ParameterValue({
                    name: name,
                    value: value
                });
            };

            this._buildDimension = function (name, value) {
                return new ProtoLoader.Dto.ReportContextDto.Dimension({
                    name: name,
                    value: value
                });
            };

            this._mapParameters = function (parameters, builder) {
                var parametersDto = [];

                if(parameters !== undefined) {
                    $.each(parameters, function (key, value) {



                        if (Object.prototype.toString.call(value) !== '[object Array]') {
                            value = [value];
                        }

                        var newValue = [];
                        $.each(value,function(index,val){
                           if(val !== undefined && val !== null){
                               newValue.push(val);
                           }
                        });
                        value = newValue;
                        var valueDto = new ProtoLoader.Dto.ReportContextDto.Value();
                        var valuesListDto;
                        var field;

                        $.each(value, function (index, currentValue) {

                            //get the type for the values list based on the first type in the values list
                            //TODO - maybe do this better, based on reportDefinition?
                            if (index === 0) {
                                if (typeof currentValue === 'string') {
                                    field = 'string';
                                    valuesListDto = new ProtoLoader.Dto.ReportContextDto.StringList();
                                } else if (typeof currentValue === 'number') {
                                    field = currentValue % 1 === 0 ? 'int' : 'double';
                                    valuesListDto = currentValue % 1 === 0 ? new ProtoLoader.Dto.ReportContextDto.IntList() : new ProtoLoader.Dto.ReportContextDto.DoubleList();
                                } else if (typeof currentValue === 'boolean') {
                                    field = 'boolean';
                                    valuesListDto = new ProtoLoader.Dto.ReportContextDto.BooleanList();
                                } else if (typeof  currentValue === 'undefined') {
                                    field = 'null';
                                    valuesListDto = new ProtoLoader.Dto.ReportContextDto.NullList();
                                } else {
                                    field = 'string';
                                    valuesListDto = new ProtoLoader.Dto.ReportContextDto.StringList();
                                }
                            }

                            valuesListDto[field + 'Value'].push(currentValue);

                        });
                        if (field) {
                            valueDto.set(field + 'List', valuesListDto);
                        }

                        var parameterValueDto = builder(key, valueDto);

                        parametersDto.push(parameterValueDto);
                    });
                }

                return parametersDto;
            };
        });
    };
});
