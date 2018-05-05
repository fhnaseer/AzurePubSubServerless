const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');
let tableName = 'topics';

module.exports = function(context, req) {
  if (req.body) {
    let message = req.body.message;
    let topics = req.body.topics;

    var tableService = azureStorage.createTableService(environment.storageConnectionString);
    topics.map(topic => {
      var query = new azureStorage.TableQuery().select(['RowKey']).where('PartitionKey eq ?', topic);
      tableService.queryEntities(tableName, query, null, function(error, result, response) {
        if (!error) {
          context.log(response.body.value);
          publishMessages(response.body.value, message);
        }
      });
    });

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

function publishMessages(topics, message) {
  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
  topics.map(topic => {
    serviceBusService.sendQueueMessage(topic.RowKey, message, function(error) {});
  });
}
