const azureStorage = require('azure-storage');
const common = require('../Shared/common');

let topics = {};
let subscriberId = '';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.content;
    subscriberId = req.body.subscriberId;
    common.createMessageQueue(subscriberId);
    common.createTable(common.contentTableName, context, process.env.StorageConnectionString, addTableData);
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId and content in the request body');
  }
};

function addTableData() {
  var tableService = azureStorage.createTableService(process.env.StorageConnectionString);
  topics.map(topic => {
    var task = {
      PartitionKey: { _: topic.key },
      RowKey: { _: subscriberId },
      Value: { _: topic.value },
      Condition: { _: topic.condition }
    };
    tableService.insertEntity(common.contentTableName, task, function(error) {});
  });
}
