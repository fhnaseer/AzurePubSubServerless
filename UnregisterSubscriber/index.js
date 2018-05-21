const azureStorage = require('azure-storage');
const common = require('../Shared/common');

let subscriberId = '';
let tableNames = ['topics', 'content', 'functions'];

module.exports = function(context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    common.deleteMessageQueue(subscriberId);
    deleteSubscriberData();
    common.sendOkResponse(context, 'Subscriber removed,');
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId in the request body,');
  }
};

function deleteSubscriberData() {
  var tableService = azureStorage.createTableService(process.env.StorageConnectionString);
  var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey']).where('RowKey eq ?', subscriberId);

  tableNames.map(tableName => {
    tableService.queryEntities(tableName, query, null, function(error, result, response) {
      if (!error) {
        deleteTableRow(tableService, tableName, response.body.value);
      }
    });
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
