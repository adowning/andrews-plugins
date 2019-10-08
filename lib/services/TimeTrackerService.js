
const
  PluginContext = require('../PluginContext');

class TimeTrackerService extends PluginContext {
  constructor (context, config) {
  // You must call the parent constructor with the context and the config
  // provided by Kuzzle and passed to the plugin init() method
    super(context, config);
  }

  /**
 * Adds a random awesome message to any created document
 *
 * @param {KuzzleRequest} request
 * @returns {Promise<KuzzleRequest>}
 */
  async addAwesomeness (request) {
  // Modify the document body before creation
    const awesomeMessage = this._getRandomAwesomeness();
    request.input.body.awesomeness = awesomeMessage;

    // Use the memoryStorage controller of the SDK to increment this message count in redis
    await this.context.accessors.sdk.ms.incr(awesomeMessage);

    return request;
  }

  _getRandomAwesomeness () {
    const randomIndex =
    Math.trunc(Math.random() * this.config.awesomeMessages.length);

    // The awesomeness messages can be configurated in the kuzzlerc configuration file
    return this.config.awesomeMessages[randomIndex];
  }
}

module.exports = TimeTrackerService;

// const axios = require('axios');
// const tokenUrl =
//   'https://www.jnctn.com/restapi?Output=json&Action=SessionCreate&Username=ash@andrewsgroup.onsip.com&Password=Sugarlips42!';
// // const baseUrl = 'https://api.onsip.com/api'; 


// class CorePlugin {
 
//   constructor() {

//     this.sessionId = null;
//     this.context = null;

//     this.config = {
//       param: '<default value>'
//     };

//     this.hooks = {};
//     this.pipes = {};

//   }
//   init(customConfig, context) {
//     this.config = Object.assign(this.config, customConfig);
//     this.context = context;
//   }

//   async saveTrackItem(request) {

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
    
//   getCallrecordsRepository () {
//     if (!this.callrecordsRepository) {
//       this.callrecordsRepository = new this.context.constructors.Repository('callrecords');
//     }

//     return this.callrecordsRepository;
//   }

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

// }
// module.exports = CorePlugin;
