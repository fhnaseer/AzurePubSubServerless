const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let subscriberId = '';

module.exports = function(context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    deleteMessageQueue();
    context.res = {
      status: 200,
      body: {
        connectionString: environment.topicsConnectionString,
        queueName: subscriberId
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

function deleteMessageQueue() {
  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
  serviceBusService.deleteQueue(subscriberId, function(error) {});
}
