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

    return function ProjectionMapper(ProtoLoader, Projection) {
        return augment(Object, function () {
            var mapMode = function(mode) {
                switch (mode) {
                    case Projection.Mode.PROJECTION: {
                        return ProtoLoader.Dto.ProjectionConfigDto.Mode.Projection;
                    }
                    case Projection.Mode.INCLUSIONARY: {
                        return ProtoLoader.Dto.ProjectionConfigDto.Mode.Inclusionary;
                    }
                    case Projection.Mode.EXCLUSIONARY: {
                        return ProtoLoader.Dto.ProjectionConfigDto.Mode.Exclusionary;
                    }
                }
            };

            this.toDto = function (projection) {
                return new ProtoLoader.Dto.ProjectionConfigDto(mapMode(projection.mode), projection.projectionColumns);
            };
        });
    };
});