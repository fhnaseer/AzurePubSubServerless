const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');
const common = require('../Shared/common');

let topics = {};
let subscriberId = '';
let tableName = 'topics';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.topics;
    subscriberId = req.body.subscriberId;
    common.createMessageQueue(subscriberId);
    common.createTable(common.topicsTableName, context, environment.storageConnectionString, addTableData);
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId and topics list in the request body');
  }
};

function addTableData() {
  var tableService = azureStorage.createTableService(environment.storageConnectionString);
  topics.map(topic => {
    var task = {
      PartitionKey: { _: topic },
      RowKey: { _: subscriberId }
    };
    tableService.insertEntity(tableName, task, function(error) {});
  });
}
