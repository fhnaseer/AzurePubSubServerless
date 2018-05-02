const azure = require('azure');

//const common = require('../common');
const environment = require('../Shared/environment');

module.exports = function(context, req) {
  if (req.body) {
    let message = req.body.message;
    let topics = req.body.topics;
    var serviceBusService = azure.createServiceBusService(
      environment.topicsConnectionString
    );
    //common.createMessageQueues(serviceBusService, topics);
    //publishMessages(context, topics, message);
    context.res = {
      status: 200,
      body: 'Messages published,'
    };
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
  }
  context.done();
};

// async function publishMessages(serviceBusService, topics, message) {
//   var messageBody = {
//     text: message
//   };
//   const promises = topics.map(async topic => {
//     serviceBusService.sendQueueMessage(topic, messageBody, function(error) {});
//   });
//   await Promise.all(promises);
// }
