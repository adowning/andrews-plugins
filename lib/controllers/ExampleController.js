/*
 * Kuzzle, a backend software, self-hostable and ready to use
 * to power modern apps
 *
 * Copyright 2015-2018 Kuzzle
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

const
  BaseController = require('./BaseController');

/**
 * @class ExampleController
 * @extends BaseController
 */
class ExampleController extends BaseController {

  constructor (context, config) {
    super(context, config);

    // Name of the controller
    // used to generate HTTP routes and Kuzzle API request
    this.name = 'example';

    /*
     * Corresponding action in Kuzzle API
     *  {
     *    controller: 'andrews-plugins/example',
     *    action: 'info'
     *  }
     */
    this.actions = [
      'info'
    ];

    // Generated route: GET _plugin/andrews-plugins/example/info
    this.routes = [
      { verb: 'get', url: '/info', action: 'info'}
    ];
  }

  async info (request) {
    const currentUser = request.context.user;

    return `Hello from example:info. Current user id: ${currentUser._id}`;
  }
}

module.exports = ExampleController;
