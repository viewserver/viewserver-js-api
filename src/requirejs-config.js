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

require.config({
    paths: {
        jquery: '../src/bower_components/jquery/dist/jquery',
        augment: '../src/bower_components/augment/augment',
        angular: '../src/bower_components/angular/angular',
        long: '../src/bower_components/long/dist/long.min',
        bytebuffer: '../src/bower_components/bytebuffer/dist/bytebuffer.min',
        protobuf: '../src/bower_components/protobuf/dist/protobuf.min'
    },

    shim: {
        angular: {
            exports: 'angular'
        }
    }
});
