/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2017 Kuzzle
 * mailto: support AT kuzzle.io
 * website: http://kuzzle.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

let
  Service = require('./service'),
  winston = require('winston');

class File extends Service {

  constructor (config) {
    const conf = Object.assign({
      level: 'error',
      filename: 'kuzzle.log'
    }, config);
    super(conf);

    // default file transport sets timestamp to true
    if (conf.addDate) {
      this.addDate = true;
    }
    delete conf.addDate;
    delete conf.dateFormat;

    this.winston = new (winston.Logger)({
      transports: [
        new winston.transports.File(conf)
      ]
    });
  }
}

module.exports = File;

