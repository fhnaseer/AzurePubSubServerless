const azureStorage = require('azure-storage');
const common = require('../Shared/common');

let topics = {};
let subscriberId = '';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.topics;
    subscriberId = req.body.subscriberId;
    common.createMessageQueue(subscriberId);
    common.createTable(common.topicsTableName, context, process.env.StorageConnectionString, addTableData);
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId and topics list in the request body');
  }
};

function addTableData() {
  var tableService = azureStorage.createTableService(process.env.StorageConnectionString);
  topics.map(topic => {
    var task = {
      PartitionKey: { _: topic },
      RowKey: { _: subscriberId }
    };
    tableService.insertEntity(common.topicsTableName, task, function(error) {});
  });
}
