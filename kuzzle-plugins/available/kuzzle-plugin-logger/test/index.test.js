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

class InternalErrorMock extends Error {
  constructor (msg) {
    super(msg);

    this.status = 500;
    this.message = msg;
  }
}

const
  mock = require('mock-require'),
  should = require('should'),
  sinon = require('sinon');

describe('index', () => {
  let
    Plugin,
    plugin,
    context;

  beforeEach(() => {
    context = {
      errors: {
        InternalError: InternalErrorMock
      }
    };
    Plugin = require('../lib');
    plugin = new Plugin();
  });

  describe('#methods', () => {
    beforeEach(() => {
      sinon.spy(plugin, '_prepareMessage');

      plugin.loggers = [
        { log: sinon.spy() },
        { log: sinon.spy() }
      ];
    });

    it('should implement all methods listed in hooks', () => {
      Object.keys(plugin.hooks).forEach(k => {
        should(plugin[plugin.hooks[k]]).be.a.Function();
      });
    });

    it('hook methods to their appropriate loggers', () => {
      Object.keys(plugin.hooks).forEach(k => {
        plugin[plugin.hooks[k]]('message', 'event');
        should(plugin._prepareMessage).calledOnce().calledWith('message');

        plugin.loggers.forEach(logger => {
          should(logger.log).be.calledOnce();
          should(logger.log).be.calledWith(
            k.replace(/^log:/, ''),
            'event',
            'message');

          logger.log.resetHistory();
        });

        plugin._prepareMessage.resetHistory();
      });
    });

    it('should properly pretty print non-error objects', () => {
      plugin.error({foo: 'bar'}, 'event');
      should(plugin._prepareMessage).calledOnce().calledWithMatch({foo: 'bar'});
      for (const logger of plugin.loggers) {
        should(logger.log)
          .calledOnce()
          .calledWith('error', 'event', plugin._prepareMessage.returnValues[0]);
      }
    });

    it('should pretty print plain Error objects', () => {
      const error = new Error('foobar');

      plugin.error(error, 'event');

      should(plugin._prepareMessage.notCalled).be.True();

      for (const logger of plugin.loggers) {
        should(logger.log)
          .calledOnce()
          .calledWith('error', 'event', error.stack);
      }
    });

    it('should pretty print serialized plain Error objects with no stack', () => {
      const error = {message: 'foobar'};

      plugin.error(error, 'event');

      should(plugin._prepareMessage.notCalled).be.True();

      for (const logger of plugin.loggers) {
        should(logger.log)
          .calledOnce()
          .calledWith('error', 'event', error.message);
      }
    });

    it('should pretty print Kuzzle errors with stack', () => {
      const error = new InternalErrorMock('foobar');

      plugin.error(error, 'event');

      should(plugin._prepareMessage.notCalled).be.True();

      for (const logger of plugin.loggers) {
        should(logger.log)
          .calledOnce()
          .calledWith('error', 'event', `(${error.status}) ${error.stack}`);
      }
    });

    it('should pretty print serialized Kuzzle errors', () => {
      const error = {message: 'foobar', status: 500};

      plugin.error(error, 'event');

      should(plugin._prepareMessage.notCalled).be.True();

      for (const logger of plugin.loggers) {
        should(logger.log)
          .calledOnce()
          .calledWith('error', 'event', `(${error.status}) ${error.message}`);
      }
    });
  });

  describe('#init', () => {

    it('should throw if the config references a non-existing transport', () => {
      should(() => plugin.init({
        services: {
          nonexisting: {
            foo: 'bar'
          }
        }
      }, context))
        .throw(InternalErrorMock);
    });

    it('should return the plugin if no error occurred', () => {
      const response = plugin.init();

      should(response).be.an.instanceOf(Plugin);
      should(plugin.loggers)
        .be.an.Array()
        .not.be.empty();
    });

    it('should init the services', () => {
      const
        spy = sinon.spy();

      mock('../lib/services', {
        test: spy
      });
      Plugin = mock.reRequire('../lib');
      plugin = new Plugin();

      plugin.init({
        services: {
          test: {
            foo: 'bar'
          }
        }
      });

      should(spy).be.calledOnce();
      should(spy).be.calledWith({foo: 'bar'});
    });

  });

});
