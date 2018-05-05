const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let topics = {};
let subscriberId = '';
let tableName = 'content';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.content;
    subscriberId = req.body.subscriberId;
    createMessageQueue();
    createTables(context);
  } else {
    context.res = {
      status: 400,
      body: 'Error,'
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
      context.log(topics[0]);
      topics.map(topic => {
        var task = {
          PartitionKey: { _: topic.key },
          RowKey: { _: subscriberId },
          Value: { _: topic.value },
          Condition: { _: topic.condition }
        };
        tableService.insertEntity(tableName, task, function(error, result, response) {
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

function createMessageQueue() {
  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
  serviceBusService.createQueueIfNotExists(subscriberId, function(error) {});
}
