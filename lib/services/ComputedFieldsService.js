
const
PluginContext = require('../PluginContext');
class ComputedFieldsService extends PluginContext {
  constructor (context, config) {
    super(context, config);
    this.config = { 
      page_size: 1000 // page_size when scrolling through document to update computed fields
    };
  }

  // init (customConfig, context) {
  //   // Here you can merge customConfig setted by kuzzle configuration with your default ones
  //   this.config = Object.assign(this.config, customConfig);

  //   // Here we store our context to be able to use it anywhere
  //   this.context = context;

  // }

  initStorage(storage) {
    return storage.bootstrap({
      computedFields: {
        properties: {
          name: { type: 'keyword' },
          index: { type: 'keyword' },
          collection: { type: 'keyword' },
          value: { type: 'keyword' },
        }
      }
    })
    .then(r => {
      this.computedFieldsRepository = new this.context.constructors.Repository('computedFields');
    });
  }

  /**
   * Load the computed fields configuration from the plugin storage
   * and store it in this.computedFields
   * @returns {Promise}
   */
  loadComputedFields() {
    return this.computedFieldsRepository.search({})
      .then(r => {
        r.hits.forEach(e => {
          this.sourceFields[e._id] = this.getSourceFields(e.value);
        });
        return r.hits;
      })
      .then(computedFields => {
        this.computedFields = computedFields;
      });
  }

  /**
   * Store a computed field in plugin storage
   * 
   * @param {String} index
   * @param {String} collection
   * @param {Object} computedField 
   * @returns {Promise}
   */
  addComputedField(index, collection, computedField) {
    return this.computedFieldsRepository.createOrReplace({
      _id: `${index}-${collection}-${computedField.name}`,
      index,
      collection,
      name: computedField.name,
      value: computedField.value,
    }, {refresh:  'wait_for'});
  }

  removeComputedField(index, collection, name) {
    return this.computedFieldsRepository
      .delete(`${index}-${collection}-${name}`,
       {refresh: 'wait_for'});
  }

  /**
   * Compute the value of a computed field from a document, the list needed fields
   * and the template string
   * 
   * @param {Object} document: the document for which  we need to evaluate the computed field
   * @param {Array} sourceFields: the list needed fields
   * @param {String} valueExpression: the template for the computed field value
   * 
   * @returns {String}
   */
  computeField(document, sourceFields, valueExpression) {
    let value = valueExpression;
    sourceFields.forEach(field => {
      const r = new RegExp(`\\\${${field}}`, 'g');
      value = value.replace(r, this.getDocumentValue(document, field));
    });
    return value;
  }
  
  /**
   * Get the field/nested field value from a document
   * 
   * @param {Object} document: the source document
   * @param {String} fieldname: the field name we want to retreive, 
   *                            accepts nested field name with the '.' 
   *                            syntax, e.g. 'a.nest.field
   * 
   * @returns {String}
   */
  getDocumentValue(document, fieldname) {
    const fields = fieldname.split('.');
    let cum = '';
    let value = document;
    for (const field of fields) {
      cum += cum ? '.' + field : field;
      if (value.hasOwnProperty(field)) {
        value = value[field];
      } else {
        throw new this.context.errors.BadRequestError(
          `Document ${JSON.stringify(document)} doesn't contain field '${fieldname}'`
        );
      }
    }
    return value;
  }
  

  /**
   * Check that all thes source fields needed to calculate 
   * given computed fields are present in the document
   * 
   * @param {Object} document: source document
   * @param {Object} sourceFields: computed fields configuration
   * 
   * @returns {Promise}: resolves to true if all the fields needed to 
   *                     evaluate computed field are present in the document
   */
  checkForSourcesFields(document, sourceFields) {
    for (const sourceField of sourceFields) {
      const fields = sourceField.split('.');
      let cum = '';
      let obj = document;
      for (const field of fields) {
        cum += cum ? '.' + field : field;
        if (obj.hasOwnProperty(field)) {
          obj = obj[field];
        }
        else {
          return Promise.reject(
            new this.context.errors.NotFoundError(`No such '${cum}' field`)
          );
        }
      }
    }
    return Promise.resolve(true);
  }

  /**
   * Get the list of needed field to compute the field
   * 
   * @param {String} template: The computed field template string: e.g. "${my_fields} is nicer than ${my.nested.field}!" 
   * 
   * @returns {Array}: Array of field names
   */
  getSourceFields(template) {
    const reg=/\$\{([\w_$][\w\d_$.]+)\}/g;
    let sf = [];
    let res;
    while ((res = reg.exec(template))!== null) {
      sf.push(res[1]);
    }
    return sf;
  }
  

  /**
   * 
   * 
   * @param {Request} request The request that triggered the event
   */
  calculateComputedFields (request, callback) {
    const {index, collection} = request.input.resource;
    const cfs = this.getCollectionConputedFields(index, collection);
    const promises = [];

    for(const cf of cfs) {
      request.input.body._computedFields = {};

      promises.push(
        this.checkForSourcesFields(request.input.body, this.sourceFields[cf._id])
        .then(()=>{
          request.input.body._computedFields[cf.name] = this.computeField(request.input.body, this.sourceFields[cf._id], cf.value);
        })
        .catch(error => {  
          // If resquest action is an 'update', and a field is missing to calculate the computed field, 
          // We get the orignal document to get missing fields 

          if(request.input.action === 'update') {
            const getReq = new this.context.constructors.Request(request, {
              controller: 'document',
              action: 'get',
            });
            return this.context.accessors.execute(getReq)
              .then(res => Object.assign(res.result._source, request.input.body))
              .then(document=> {
                return this.checkForSourcesFields(document, this.sourceFields[cf._id])
                  .then(() => {
                    request.input.body._computedFields[cf.name] = this.computeField(document, this.sourceFields[cf._id], cf.value);
                  });
              });
          }
          return Promise.reject(error);
        })
      );
    }

    Promise.all(promises)
      .then(() => callback(null, request))
      .catch(e => callback(e, request));
  }


  getCollectionConputedFields(index, collection) {
    return this.computedFields.filter(e => e.index === index && e.collection === collection);
  }

  /**
   * Get the next page of the search identified by the scroll id
   * 
   * @param {String} scrollId: the id of the scroll
   * @param {Number} remaining: the number of remaining document to be scrolled
   * @param {String} index: the index on witch we are updating document computed fields
   * @param {String} collection: the collection on witch we are updating document computed fields
   * 
   * @returns {Promise}
   */

  processNextScroll(scrollId, remaining, index, collection, cfs) {
    const scrollRequest = new this.context.constructors.Request({
      controller: 'document',
      action: 'scroll',
      scrollId,
      scroll: '1m'
    });

    return this.context.accessors.execute(scrollRequest)
      .then(res => {
        const p = [];
        remaining -= res.result.hits.length;
        p.push(this.recomputeFieldsForDocs(
          res.result.hits.map(e => {return {_id: e._id, body: e._source};}),
          index,
          collection,
          cfs)
        );

        if (remaining > 0) {
          p.push(
            this.processNextScroll(res.result._scroll_id, remaining, index, collection, cfs)
          );
        }
        return Promise.all(p);
      });
  }
  
  /**
   * Recompute all computed fields of a collection
   *  
   * @param {String} index : Index containing the collection of documents to be updates 
   * @param {String} collection : Collection containing the documents to be updates
   */
  recomputeCollectionComputedFields(request, index, collection) {
    const cfs = this.getCollectionConputedFields(index, collection);
    let scrollId,
      remaining,
      total;

    const searchRequest = new this.context.constructors.Request(request, 
      {
        index, 
        collection,
        controller: 'document',
        action: 'search',
        body:{},
        scroll: '1m',
        from: 0,
        size: this.config.page_size
      }
    );

    return this.context.accessors.execute(searchRequest)
      .then(res => {
        const documents = res.result.hits.map(e => {return {_id: e._id, body: e._source};});
        scrollId = res.result._scroll_id;
        total = res.result.total;
        remaining = total - res.result.hits.length;
        return this.recomputeFieldsForDocs(documents, index, collection, cfs);
      })
      .then(res => {
        if(remaining > 0) {
          return this.processNextScroll(scrollId, remaining, index, collection, cfs);
        }
      })
      .then(res => {
        return {updatedDocuments: total};
      });
  }
  
  /**
   * Recompute computed documents. This is used after the templates of value cahnged to
   * update computed fields of existings documents
   * 
   * Recalculate computed field for given index/collection
   * If one is null, then will recalculate all computed fields in all collections
   * 
   * @param {Object} request 
   */
  recomputeComputedFields(request) {
    const {index, collection} = request.input.resource;
    return this.recomputeCollectionComputedFields(request, index, collection);
  }

  resetComputedFields() {
    return this.computedFieldsRepository.search({}, 0, 1000)
    .then(r => {
      const p = r.hits.map(e => this.computedFieldsRepository.delete(e._id));
      return Promise.all(p);
    })
    .then(()=>this.loadComputedFields());
  }
}

module.exports = ComputedFieldsService;