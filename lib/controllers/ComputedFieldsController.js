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
 * @class ComputedFieldsController
 * @extends BaseController
 */
class ComputedFieldsController extends BaseController {

  constructor (context, config) {
    super(context, config);

    // Name of the controller
    // used to generate HTTP routes and Kuzzle API request
    this.name = 'computedfields';

    /*
     * Corresponding action in Kuzzle API
     *  {
     *    controller: 'andrews-plugins/computedfields',
     *    action: 'info'
     *  }
     */
    this.actions = [
           'createComputedField',
             'deleteComputedField',
          'listComputedFields',
            'recomputeComputedFields',
        
        
            // 'reset': 'resetComputedFields'
        
        
    ];

    // Generated route: GET _plugin/andrews-plugins/computedfields/info
    this.routes = [
      {verb: 'get', url: '/:index/:collection', controller: 'computedFields', action: 'listComputedFields'},
      {verb: 'post', url: '/:index/:collection', controller: 'computedFields', action: 'createComputedField'},
      {verb: 'delete', url: '/:index/:collection/:name', controller: 'computedFields', action: 'deleteComputedField'},
      {verb: 'patch', url: '/:index/:collection', controller: 'computedFields', action: 'recomputeComputedFields'}
    ];
  }

  /**
   * 
   * @param {Request} request The request sent to the controller/action route
   *
   * @return {Promise} A promise resolving the response of the route.
   */
  createComputedField (request) {
    if (request.input.body 
      && request.input.body.name
      && request.input.resource.index
      && request.input.resource.collection
      && request.input.body.value
    ) {
      return this.addComputedField(request.input.resource.index, request.input.resource.collection, request.input.body)
        .then(res => {
          return this.loadComputedFields().then(() => res);
        });
    }
    return Promise.reject(new this.context.errors.BadRequestError(
      'Body must contain the following fields: \'name\' and \'value\''
      )
    );
  }

  deleteComputedField (request) {
    const {index, collection} = request.input.resource;
    const name = request.input.body && request.input.body.name || request.input.args.name;
    if (name && index && collection) {
      return this.removeComputedField(index, collection, name)
        .then(r => {
          return this.loadComputedFields();
        });
    }
    return Promise.reject(
      new this.context.errors.BadRequestError(
        'Delete request must specify an <index>, a <collection> and the <name> of the computed field to delete'
      )
    );
  }

  listComputedFields (request) {
    const {index, collection} = request.input.resource;
    let result = this.computedFields.filter(
      e=> e.index === index && e.collection === collection
    );
    result = result.map(e => {
      const elem = JSON.parse(JSON.stringify(e));
      delete elem.index;
      delete elem.collection;
      return elem;
    });
    return Promise.resolve(result);
  }

  /**
   * 
   * @param {Array} documents: An arry of documents to updates 
   * @param {String} index 
   * @param {String} collection 
   * @param {Object} cfs: computed fields to be applied, if empty, 
   *                      then all existing computed fields will
   *                      removed from documents
   * 
   * @returns {Promise}
   */
  recomputeFieldsForDocs(documents, index, collection, cfs) {
    const docUpdates = [];
    documents.forEach(document => {
      const _id = document._id;
      const body = document.body;

      body._computedFields = {};

      cfs.forEach(cf => {       
        body._computedFields[cf.name] = this.computeField(body, this.sourceFields[cf._id], cf.value);
      });

        // TODO: push a bunch of docs with m* API

      const replaceDoc = new this.context.constructors.Request({
        index, 
        collection,
        controller: 'document',
        action: 'replace',
        _id,
        body
      });

      replaceDoc.context.user = { user: 'workaround'};
      docUpdates.push(this.context.accessors.execute(replaceDoc));
    });
    return Promise.all(docUpdates);
  }

}

module.exports = ComputedFieldsController;
