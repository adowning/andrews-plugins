// const axios = require('axios');
// const tokenUrl =
//   'https://www.jnctn.com/restapi?Output=json&Action=SessionCreate&Username=ash@andrewsgroup.onsip.com&Password=Sugarlips42!';
// const baseUrl = 'https://api.onsip.com/api'; 

// /**
//  * Plugins must be valid Node.js requirable modules,
//  * usually shipped as a directory and containing either:
//  *
//  *  - an `index.js` file in its root directory, exporting a Javascript class
//  *  - a well-formed `package.json` file in its root directory,
//  *    specifying the path of the main requirable file in the `main` field.
//  *
//  * To determine the Plugin name, Kuzzle looks for the `name` field
//  * in the `manifest.json` file.
//  * @deprecated  - If no `manifest.json` file is found, Kuzzle will fall back
//  * to the `package.json` file, if there is one. Otherwise, an exception is thrown
//  * and Kuzzle will fail to start.
//  *
//  * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/
//  */
// class CorePlugin {
//   /* eslint-disable no-unused-vars */
//   /* eslint-disable no-console */

//   /**
//    * Create a new instance of CorePlugin
//    *
//    * Workflow:
//    *  - Kuzzle loads plugins in <kuzzle install dir>/plugins/enabled/* and
//    *     instantiate them, also configuration and manifest.json files are read.
//    *  - The "init" function is called
//    *  - The plugin manager registers all plugin features into Kuzzle:
//    *    hooks, pipes, authentication strategies and custom API routes
//    *
//    * Kuzzle aborts its own start sequence if any error occurs during
//    * plugins initialization.
//    *
//    */
//   constructor() {
//     /**
//      * The schema passed to GraphQL on every request.
//      */

    
//     this.sessionId = null;

//     /**
//      * The plugin context is provided by Kuzzle as an argument to the
//      * "init" function
//      *
//      * @type {PluginContext}
//      */
//     this.context = null;

//     /**
//      * Here is a good place to set default configuration values.
//      * You can merge them with overridden values, provided by Kuzzle
//      * as an argument to the "init" function.
//      *
//      * @type {Object}
//      */
//     this.config = {
//       param: '<default value>'
//     };

//     /**
//      * Specifies a set of events along with the asynchronous
//      * listener functions they trigger.
//      *
//      * The function "asyncListener" will be called whenever
//      * the following events are triggered:
//      * - "document:beforeCreateOrReplace"
//      * - "document:beforeReplace"
//      * - "document:beforeUpdate"
//      *
//      * The function "asyncOverloadListener" will be called whenever the event
//      * "core:overload" is triggered.
//      *
//      * @type {Object}
//      *
//      * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-hooks/
//      * @see https://docs.kuzzle.io/kuzzle-events/
//      */
//     this.hooks = {};

//     /**
//      * Specifies a set of events along with the synchronous
//      * listener functions they trigger.
//      *
//      * The function "syncListener" will be called whenever the following
//      * events are triggered:
//      * - "document:beforeCreate"
//      * - "realtime:beforePublish"
//      *
//      * Kuzzle will wait for these functions before continuing the request process
//      *
//      * @type {Object}
//      *
//      * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-pipes/
//      * @see https://docs.kuzzle.io/kuzzle-events/
//      */
//     this.pipes = {};

//     /**
//      * The "controllers" property enables to extend the Kuzzle API with
//      * new controllers and actions
//      *
//      * These actions point to functions exposed to Kuzzle by the plugin.
//      *
//      * Any network protocol other than HTTP will be able to invoke this new
//      * controller with the following JSON object:
//      *
//      * {
//      *   controller: 'kuzzle-core-plugin-boilerplate/myNewController',
//      *   action: 'myNewAction',
//      *   ...
//      * }
//      *
//      * @type {Object}
//      *
//      * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
//      */
//     this.controllers = {
//       onsip: {
//         addCallrecord: 'addCallrecord',
//         createSubscription: 'createSubscription'
//       }
//     };

//     /**
//      * The following "routes" exposed property allows Kuzzle to bind new
//      * controllers and actions to HTTP endpoints
//      *
//      * Any parameter starting with a ':' in the URL will be made dynamic by Kuzzle.
//      *
//      * The first route exposes the following GET URL:
//      *  https://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something/<dynamic value>
//      *
//      * Kuzzle will call the function 'doSomething' with a Request object,
//      * containing the "name" property: request.input.args.property = '<dynamic value>'
//      *
//      * The second route exposes the following POST URL:
//      *  https://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something
//      *
//      * Kuzzle will provide the content body of the request in the Request object
//      * passed to the function 'doSomething', in the request.input.body property
//      *
//      * @type {Array}
//      *
//      * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
//      */
//     this.routes = [
//       {
//         verb: 'post',
//         url: '/onsip/callrecords',
//         controller: 'onsip',
//         action: 'addCallrecord'
//       },
//       {
//         verb: 'post',
//         url: '/onsip/createSubscription',
//         controller: 'onsip',
//         action: 'createSubscription'
//       }
//     ];
//   }

//   /**
//    * Initializes the plugin with configuration and context.
//    *
//    * @param {Object} customConfig - This plugin custom configuration
//    * @param {Object} context      - A restricted gateway to the Kuzzle API
//    *
//    * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/#plugin-init-function
//    * @see https://docs.kuzzle.io/plugins-reference/managing-plugins#configuring-plugins
//    * @see https://docs.kuzzle.io/plugins-reference/plugins-context/
//    */
//   init(customConfig, context) {
//     this.config = Object.assign(this.config, customConfig);
//     this.context = context;
//   }

//   async addCallrecord(request) {

//     try{
//       const variables = this.getObjectFromBody(request, 'variables', null, null);
//     }catch(e) {
//       console.log(e.message);
//     }

//     await this.context.accessors.execute(
//       this.context.constructors.Request(request, {
//         controller: 'document',
//         action: 'create',
//         index: 'coms',
//         collection: 'callrecords',
//         refresh: 'wait_for',
//         body: {
//           id:  request.input.body.id,
//           callId: request.input.body.payload.callId,
//           toUri: request.input.body.payload.toUri,
//           fromUri: request.input.body.payload.fromUri,
//           streamId: request.input.body.streamId,
//           subscriptionId: request.input.body.subscriptionId,
//           type: request.input.body.type,
//           createdAt: request.input.body.createdAt,
//         }
//       }));

//     return 'OK';

//   }
    

//   /**
//    * @returns {Repository}
//    */
//   getCallrecordsRepository () {
//     if (!this.callrecordsRepository) {
//       this.callrecordsRepository = new this.context.constructors.Repository('callrecords');
//     }

//     return this.callrecordsRepository;
//   }

//   /**
//    * @returns {Repository}
//    */
//   getSubscriptionsRepository () {
//     if (!this.subscriptionsRepository) {
//       this.subscriptionsRepository = new this.context.constructors.Repository('subscriptions');
//     }

//     return this.subscriptionsRepository;
//   }

//   async setSessionId() {
//     const token = await axios.get(tokenUrl).then(
//       function (httpResponse) {
//         // this.sessionId = httpResponse.data.Response.Context.Session.SessionId;
//         return httpResponse.data.Response.Context.Session.SessionId;
//       },
//       function (httpResponse) {
//         console.error('Request failed with response code ' + httpResponse.status);
//       }
//     );
//     // console.log(token)
//     this.sessionId= token;
//     return this.sessionId;
//   }
//   // async readSubscription() {
//   //   if (this.sessionId === undefined || this.sessionId === null) {
//   //     this.sessionId = await this.setSessionId();
//   //   }
//   //   console.log(this.sessionId);
//   //   const results = await axios
//   //     .post(
//   //       // `${baseUrl}?Output=json&Action=AuthCallSetup&SessionId=${sessionId}&FromAddress=${from}&ToAddress=${to}`
//   //       // `${baseUrl}?Output=json&Action=WebhookSubscriptionAdd&SessionId=${sessionId}&OrganizationId=74954&Name=Auto Execution Test&TargetUrl=https://andrews.serveo.net/callrecords&SslVerify=false`
//   //       `${baseUrl}?Output=json&Action=WebhookSubscriptionRead&SessionId=${this.sessionId}&WebhookSubscriptionId=${this.subscriptionId}`
//   //     );
//   // }
//   // async createSubscription (kuzzleMessage, event) {
//   async createSubscription() {
//     if (this.sessionId === undefined || this.sessionId === null) {
//       this.sessionId = await this.setSessionId();
//     }
//     var d = new Date();
//     try{
//       const results = await axios
//         .post(
//         // http://74.192.107.223:7512/test/callrecords/_create
//           `${baseUrl}?Output=json&Action=WebhookSubscriptionAdd&SessionId=${this.sessionId}&OrganizationId=74954&Name=${d.getTime()}&TargetUrl=https://andrews.serveo.net/_plugin/kuzzle-plugin-graphql/onsip/callrecords&SslVerify=false`
//         );
//     }catch(e) {
//       console.log(e.message);
//     }
      
//     console.log(results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription);
    
//     let Callid = results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription.WebhookSubscriptionId;
//     let data = results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription;
//     console.log(data);
//     return this.getCallrecordsRepository().create({
//       Callid,
//       data
//     }, {refresh: 'wait_for'});
//   }
// }
// module.exports = CorePlugin;
