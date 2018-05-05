const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let topics = {};
let subscriberId = '';
let tableName = 'topics';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.topics;
    subscriberId = req.body.subscriberId;
    createMessageQueues();
    createTables(context);
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
    context.done();
  }
};

function createTables(context) {
  var tableService = azureStorage.createTableService(environment.storageConnectionString);
  tableService.createTableIfNotExists(tableName, function(error, result, response) {
    if (error) {
      context.res = {
        status: 400,
        body: error
      };
      context.done();
    } else {
      topics.map(topic => {
        var task = {
          PartitionKey: { _: topic },
          RowKey: { _: subscriberId }
        };
        tableService.insertEntity(subscriberId, task, function(error, result, response) {
          if (!error) {
            // Entity inserted
          }
        });
      });

      context.res = {
        status: 200,
        body: {
          connectionString: environment.topicsConnectionString,
          queueName: subscriberId
        }
      };
      context.done();
    }
  });
}

function createMessageQueues() {
  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
  serviceBusService.createQueueIfNotExists(subscriberId, function(error) {});
}
