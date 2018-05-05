const azure = require('azure');
const environment = require('../Shared/environment');

module.exports = function(context, req) {
  if (req.body) {
    let message = req.body.message;
    let topics = req.body.topics;
    var serviceBusService = azure.createServiceBusService(
      environment.topicsConnectionString
    );
    createMessageQueues(serviceBusService, topics);
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
  topics.map(topic => {
    serviceBusService.sendQueueMessage(topic, message, function(error) {});
  });
}

function createMessageQueues(serviceBusService, topics) {
  topics.map(topic => {
    serviceBusService.createQueueIfNotExists(topic, function(error) {});
  });
}
