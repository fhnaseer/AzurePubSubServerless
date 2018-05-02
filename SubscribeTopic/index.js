const azure = require('azure');
//const common = require('../common');
const environment = require('../Shared/environment');

module.exports = function(context, req) {
  if (req.body) {
    let topics = req.body.topics;
    var serviceBusService = azure.createServiceBusService(
      environment.topicsConnectionString
    );
    //common.createMessageQueues(serviceBusService, topics);

    context.res = {
      status: 200,
      body: {
        connectionString: environment.topicsConnectionString
      }
    };
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
  }
  context.done();
};
