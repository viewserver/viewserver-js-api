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

    //define dependencies
    var angular = require('angular');
    var $ = require('jquery');
    require('augment');
    require('constants/constants');
    require('long');
    require('bytebuffer');
    require('protobuf');

    //define the module
    var module = angular.module('io.viewserver.api', ['constants']);


    //module services
    var Network = require('network');
    var Command = require('command');
    var DataSink = require('dataSink');
    var AngularDataSink = require('angularDataSink');

    var VirtualTableService = require('virtualTable/virtualTable-service');
    var VirtualTable = require('virtualTable/virtualTable');
    var Client = require('client/real/client');
    var ClientService = require('client/real/client-service');

    var RowEvent = require('virtualTable/rowEvent');
    var Projection = require('virtualTable/projection');

    var RowMapper = require('mappers/rowMapper');
    var ReportContextMapper = require('mappers/reportContextMapper');
    var OptionsMapper = require('mappers/optionsMapper');
    var TableMetaDataMapper = require('mappers/tableMetaDataMapper');
    var RowEventMapper = require('mappers/rowEventMapper');
    var ProjectionMapper = require('mappers/projectionMapper');

    var Logger = require('utils/logger');
    var TablePrinter = require('utils/tablePrinter');
    var ProtoLoader = require('utils/protoLoader');


    module.factory('Network', Network);
    module.factory('Command', Command);
    module.factory('DataSink', DataSink);
    module.factory('AngularDataSink', AngularDataSink);

    module.factory('ReportContextMapper', ReportContextMapper);
    module.factory('OptionsMapper', OptionsMapper);
    module.factory('RowMapper', RowMapper);
    module.factory('TableMetaDataMapper', TableMetaDataMapper);
    module.factory('RowEventMapper', RowEventMapper);
    module.factory('ProjectionMapper', ProjectionMapper);

    module.service('VirtualTableService', VirtualTableService);
    module.service('ClientService', ClientService);
    module.factory('Client', Client);
    module.factory('VirtualTable', VirtualTable);
    module.factory('RowEvent', RowEvent);
    module.factory('Projection', Projection);

    module.factory('Logger', Logger);
    module.factory('ProtoLoader', ProtoLoader);
    module.factory('TablePrinter', TablePrinter);

    return module;
});
