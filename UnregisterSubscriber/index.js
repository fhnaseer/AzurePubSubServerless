const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');

let subscriberId = '';
let topicsTable = 'topics';
let contentTable = 'content';
let functionsTable = 'functions';

module.exports = function(context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    deleteMessageQueue();
    deleteSubscriberData();
    context.res = {
      status: 200,
      body: {
        message: 'Subscriber removed,'
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

function deleteSubscriberData() {
  var tableService = azureStorage.createTableService(environment.storageConnectionString);
  var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey']).where('RowKey eq ?', subscriberId);
  tableService.queryEntities(topicsTable, query, null, function(error, result, response) {
    if (!error) {
      deleteTableRow(tableService, response.body.value);
    }
  });
  tableService.queryEntities(contentTable, query, null, function(error, result, response) {
    if (!error) {
      deleteTableRow(tableService, response.body.value);
    }
  });
  tableService.queryEntities(functionsTable, query, null, function(error, result, response) {
    if (!error) {
      deleteTableRow(tableService, response.body.value);
    }
  });
}

function deleteTableRow(tableService, tableName, topics) {
  topics.map(topic => {
    let task = {
      PartitionKey: { _: topic.PartitionKey },
      RowKey: { _: topic.RowKey }
    };
    tableService.deleteEntity(tableName, task, function(error, response) {});
  });
}
