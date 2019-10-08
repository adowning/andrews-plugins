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

const
  mock = require('mock-require'),
  sinon = require('sinon'),
  should = require('should'),
  Service = require('../../lib/services/service');

describe('services/stdout', function () {
  let
    winstonMock,
    ServiceStdout,
    serviceStdout;

  beforeEach(() => {
    winstonMock = {
      Logger: sinon.spy(),
      transports: {
        Console: sinon.spy()
      }
    };
    mock('winston', winstonMock);
    ServiceStdout = mock.reRequire('../../lib/services/stdout');
  });

  after(() => {
    mock.stopAll();
  });

  it('should be an instance of Service', () => {
    serviceStdout = new ServiceStdout({});

    should(serviceStdout)
      .be.an.instanceOf(Service);
  });

  it('should set the default values if none are provided', () => {
    serviceStdout = new ServiceStdout({});

    should(serviceStdout.addDate).be.true();
    should(serviceStdout.dateFormat).be.undefined();
    should(winstonMock.Logger).be.calledOnce();
    should(winstonMock.transports.Console).be.calledOnce();
    should(winstonMock.transports.Console).be.calledWith({
      level: 'error'
    });
  });

  it('should use the given parameters', () => {
    serviceStdout = new ServiceStdout({level: 'debug', addDate: 'addDate', dateFormat: 'dateFormat'});

    should(serviceStdout.addDate).be.exactly('addDate');
    should(serviceStdout.dateFormat).be.exactly('dateFormat');
    should(winstonMock.Logger).be.calledOnce();
    should(winstonMock.transports.Console).be.calledOnce();
    should(winstonMock.transports.Console).be.calledWith({
      level: 'debug'
    });

  });

});
