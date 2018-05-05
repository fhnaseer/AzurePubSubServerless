const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let topics = {};
let subscriberId = '';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.topics;
    subscriberId = req.body.subscriberId;
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
  tableService.createTableIfNotExists(subscriberId, function(error, result, response) {
    if (error) {
      context.res = {
        status: 400,
        body: error
      };
      context.done();
    } else {
      createMessageQueues();
      topics.map(topic => {
        var task = {
          PartitionKey: { _: 'topics' },
          RowKey: { _: topic }
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
