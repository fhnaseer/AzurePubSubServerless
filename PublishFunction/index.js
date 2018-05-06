const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let tableName = 'functions';
let subscriptionType = '';
let message = '';

module.exports = function(context, req) {
  if (req.body) {
    message = req.body.message;
    subscriptionType = req.body.subscriptionType;

    var tableService = azureStorage.createTableService(environment.storageConnectionString);
    var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey', 'MatchingInputs', 'MatchingFunction']).where('PartitionKey eq ?', subscriptionType);
    tableService.queryEntities(tableName, query, null, function(error, result, response) {
      if (!error) {
        context.log(response.body.value);
        publishMessages(response.body.value);
      }
    });
    context.res = {
      status: 200,
      body: 'Messages published,'
    };
    context.done();
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
    context.done();
  }
};

function publishMessages(topics) {
  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
  topics.map(topic => {
    let matchingFunction = new Function(topic.MatchingInputs, topic.MatchingFunction);
    let value = matchingFunction(message);
    if (value) {
      let completeMessage = {
        topic: topic.PartitionKey,
        message: message,
        value: value
      };
      serviceBusService.sendQueueMessage(topic.RowKey, JSON.stringify(completeMessage), function(error) {});
    }
  });
}
