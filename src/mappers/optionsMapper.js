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

    return function OptionsMapper(ProtoLoader) {
        return augment(Object, function () {

            this.toDto = function (options) {
                var _self = this;
                var optionsCopy = $.extend(true, {}, options);

                if(optionsCopy.columnsToSort !== undefined){
                    $.each(optionsCopy.columnsToSort, function(index, columnToSort){
                        columnToSort.name =  _self._parseSortColumn(columnToSort.name);
                        columnToSort.direction = _self._parseDirection(columnToSort.direction);
                    });
                }

                return new ProtoLoader.Dto.OptionsDto(optionsCopy);
            };

            this._parseSortColumn = function(sortColumn){
                return sortColumn.replace('buckets', 'bucket').replace(/[\[\]]/g, '').replace(/\./g, '_');
            };

            this._parseDirection = function (direction) {
                switch (direction.toLowerCase()) {
                    case 'asc': {
                        return ProtoLoader.Dto.SortDirection.ASCENDING;
                    }
                    case 'desc': {
                        return ProtoLoader.Dto.SortDirection.DESCENDING;
                    }
                    default: {
                        throw 'Invalid sort direction ' + direction;
                    }
                }
            };
        });
    };
});
