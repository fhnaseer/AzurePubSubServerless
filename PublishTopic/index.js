const azure = require('../node_modules/azure');
const common = require('../common');
const environment = require('../environment');

module.exports = function(context, req) {
  if (req.body) {
    let message = req.body.message;
    let topics = req.body.topics;
    var serviceBusService = azure.createServiceBusService(
      environment.topicsConnectionString
    );
    common.createMessageQueues(serviceBusService, topics);
    publishMessages(serviceBusService, topics, message);
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

function publishMessages(serviceBusService, topics, message) {
  var messageBody = {
    text: message
  };
  each(topics, function(topic) {
    serviceBusService.sendQueueMessage(topic, messageBody, function(error) {
      if (!error) {
        context.log('Message published,');
      } else {
        context.log(error);
      }
    });
  });
}
