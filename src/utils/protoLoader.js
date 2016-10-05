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
    var ProtoBuf = require('protobuf');

    return function ProtoLoader($q, CONFIG, Logger) {
        return augment(Object, function () {
            this.protoPath = CONFIG.protobufSchemaPath;
            this.builder = ProtoBuf.newBuilder({convertFieldsToCamelCase: true});

            ProtoBuf.loadProtoFile(this.protoPath + 'MessageDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'SubscribeCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'UnsubscribeCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'SubscribeReportCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'SubscribeDimensionCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'UpdateSubscriptionCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'ReportContextDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'AuthenticateCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'TableEditCommandDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'ProjectionConfigDto.proto', this.builder);
            ProtoBuf.loadProtoFile(this.protoPath + 'ExecuteSqlCommandDto.proto', this.builder);

            var _self = this;
            var build = function() {
                _self.Dto = _self.builder.build();
            };

            this.registerProtoFile = function (path) {
                var registerProtoFilePromise = $q.defer();

                ProtoBuf.loadProtoFile(path, function(err, builder) {
                    if (err) {
                        Logger.error(err);
                        registerProtoFilePromise.reject(err);
                    } else {
                        build();
                        registerProtoFilePromise.resolve();
                    }
                }, this.builder);

                return registerProtoFilePromise.promise;
            };

            build();
        });
    };
});

