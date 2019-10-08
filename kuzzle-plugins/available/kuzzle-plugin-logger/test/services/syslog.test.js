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
  should = require('should');

describe('services/syslog', () => {
  let
    winstonMock,
    Syslog,
    syslog;

  beforeEach(() => {
    winstonMock = {
      config: {
        syslog: {
          levels: 'levels'
        }
      },
      Logger: sinon.spy(),
      setLevels: sinon.spy(),
      transports: {
        Syslog: sinon.spy()
      }
    };
    mock('winston', winstonMock);
    Syslog = mock.reRequire('../../lib/services/syslog');
  });

  after(() => {
    mock.stopAll();
  });

  it('should use syslog levels', () => {
    syslog = new Syslog({});

    should(winstonMock.setLevels).be.calledOnce();
    should(winstonMock.setLevels).be.calledWithExactly(winstonMock.config.syslog.levels);
  });

  it('should set the default values if none are provided', () => {
    syslog = new Syslog({});

    should(syslog.addDate).be.true();
    should(syslog.dateFormat).be.undefined();
    should(winstonMock.Logger).be.calledOnce();
    should(winstonMock.transports.Syslog).be.calledOnce();
    should(winstonMock.transports.Syslog).be.calledWith({
      level: 'error'
    });
  });

  it('should set the given parameters', () => {
    syslog = new Syslog({
      level: 'debug',
      addDate: 'addDate',
      dateFormat: 'dateFormat',
      host: 'host',
      port: 'port',
      protocol: 'protocol',
      path: 'path',
      pid: 'pid',
      facility: 'facility',
      localhost: 'localhost',
      type: 'type',
      app_name: 'app_name',
      eol: 'eol'
    });

    should(syslog.addDate).be.exactly('addDate');
    should(syslog.dateFormat).be.exactly('dateFormat');
    should(winstonMock.Logger).be.calledOnce();
    should(winstonMock.transports.Syslog).be.calledOnce();
    should(winstonMock.transports.Syslog).be.calledWith({
      level: 'debug',
      host: 'host',
      port: 'port',
      protocol: 'protocol',
      path: 'path',
      pid: 'pid',
      facility: 'facility',
      localhost: 'localhost',
      type: 'type',
      app_name: 'app_name',
      eol: 'eol'
    });

  });


});
