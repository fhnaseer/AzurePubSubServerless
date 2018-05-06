const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let subscriberId = '';
let tableName = 'functions';
let subscriptionType = '';
let matchingInputs = '';
let matchingFunction = '';

module.exports = function(context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    subscriptionType = req.body.subscriptionType;
    matchingInputs = req.body.matchingInputs;
    matchingFunction = req.body.matchingFunction;
    createMessageQueue();
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
      var task = {
        PartitionKey: { _: subscriptionType },
        RowKey: { _: subscriberId },
        MatchingInputs: { _: matchingInputs },
        MatchingFunction: { _: matchingFunction }
      };
      tableService.insertEntity(tableName, task, function(error, result, response) {
        if (!error) {
          // Entity inserted
        }
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
