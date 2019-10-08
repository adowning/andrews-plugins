const axios = require('axios');
const tokenUrl =
  'https://www.jnctn.com/restapi?Output=json&Action=SessionCreate&Username=ash@andrewsgroup.onsip.com&Password=Sugarlips42!';
const baseUrl = 'https://api.onsip.com/api'; 


const
  BaseController = require('./BaseController');

class CallrecordsController extends BaseController {
  constructor (context, config) {
    super(context, config);


    this.sessionId = null;

    this.name = 'onsip';

    this.actions = [
      'createSubscription',
      'addCallrecord'
    ];
  
    this.routes = [
      { verb: 'post', url: '/createSubscription', action: 'createSubscription'},
      { verb: 'post', url: '/callrecords', action: 'addCallrecord' }
    ];
  }

  /**
   * Initializes the plugin with configuration and context.
   *
   * @param {Object} customConfig - This plugin custom configuration
   * @param {Object} context      - A restricted gateway to the Kuzzle API
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/#plugin-init-function
   * @see https://docs.kuzzle.io/plugins-reference/managing-plugins#configuring-plugins
   * @see https://docs.kuzzle.io/plugins-reference/plugins-context/
   */
  init(customConfig, context) {
    this.config = Object.assign(this.config, customConfig);
    this.context = context;
  }

  async addCallrecord(request) {

    // try{
    //   this.getObjectFromBody(request, 'variables', null, null);
    // }catch(e) {
    //   console.log(e.message);
    // }
    try{
      await this.context.accessors.execute(
        this.context.constructors.Request(request, {
          controller: 'document',
          action: 'create',
          index: 'coms',
          collection: 'callrecords',
          refresh: 'wait_for',
          body: {
            id:  request.input.body.id,
            callId: request.input.body.payload.callId,
            toUri: request.input.body.payload.toUri,
            fromUri: request.input.body.payload.fromUri,
            streamId: request.input.body.streamId,
            subscriptionId: request.input.body.subscriptionId,
            type: request.input.body.type,
            // createdAt: request.input.body.createdAt
          }
        }));
    }catch(e) {
      console.log(e.message);
      return (200, JSON.stringify(e.message));
    }
    return 'OK';

  }
    

  /**
   * @returns {Repository}
   */
  getCallrecordsRepository () {
    if (!this.callrecordsRepository) {
      this.callrecordsRepository = new this.context.constructors.Repository('callrecords');
    }

    return this.callrecordsRepository;
  }

  /**
   * @returns {Repository}
   */
  getSubscriptionsRepository () {
    if (!this.subscriptionsRepository) {
      this.subscriptionsRepository = new this.context.constructors.Repository('subscriptions');
    }

    return this.subscriptionsRepository;
  }

  async setSessionId() {
    const token = await axios.get(tokenUrl).then(
      function (httpResponse) {
        // this.sessionId = httpResponse.data.Response.Context.Session.SessionId;
        return httpResponse.data.Response.Context.Session.SessionId;
      },
      function (httpResponse) {
        console.error('Request failed with response code ' + httpResponse.status);
      }
    );
    // console.log(token)
    this.sessionId= token;
    return this.sessionId;
  }
  // async readSubscription() {
  //   if (this.sessionId === undefined || this.sessionId === null) {
  //     this.sessionId = await this.setSessionId();
  //   }
  //   console.log(this.sessionId);
  //   const results = await axios
  //     .post(
  //       // `${baseUrl}?Output=json&Action=AuthCallSetup&SessionId=${sessionId}&FromAddress=${from}&ToAddress=${to}`
  //       // `${baseUrl}?Output=json&Action=WebhookSubscriptionAdd&SessionId=${sessionId}&OrganizationId=74954&Name=Auto Execution Test&TargetUrl=https://andrews.serveo.net/callrecords&SslVerify=false`
  //       `${baseUrl}?Output=json&Action=WebhookSubscriptionRead&SessionId=${this.sessionId}&WebhookSubscriptionId=${this.subscriptionId}`
  //     );
  // }
  // async createSubscription (kuzzleMessage, event) {
  async createSubscription() {
    var d = new Date();
    var results;
    if (this.sessionId === undefined || this.sessionId === null) {
      this.sessionId = await this.setSessionId();
    }

    try{
      results = await axios
        .post(
        // http://74.192.107.223:7512/test/callrecords/_create
          `${baseUrl}?Output=json&Action=WebhookSubscriptionAdd&SessionId=${this.sessionId}&OrganizationId=74954&Name=${d.getTime()}&TargetUrl=https://reverseproxy.ashdevtools.com/onsip/callrecords&SslVerify=false`
        );
    }catch(e) {
      console.log(e.message);
    }
      
    console.log(results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription);
    
    let Callid = results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription.WebhookSubscriptionId;
    let data = results.Response.Result.WebhookSubscriptionAdd.WebhookSubscription;
    console.log(data);
    return this.getCallrecordsRepository().create({
      Callid,
      data
    }, {refresh: 'wait_for'});
  }
}
module.exports = CallrecordsController;
