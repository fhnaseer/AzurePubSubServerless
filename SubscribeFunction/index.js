const azureStorage = require('azure-storage');
const common = require('../Shared/common');

let subscriberId = '';
let subscriptionType = '';
let matchingInputs = '';
let matchingFunction = '';

module.exports = function(context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    subscriptionType = req.body.subscriptionType;
    matchingInputs = req.body.matchingInputs;
    matchingFunction = req.body.matchingFunction;
    common.createMessageQueue();
    common.createTable(common.functionTableName, context, process.env.StorageConnectionString, addTableData);
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId, subscriptionType, matchingInputs and matchingFunction in the request body');
  }
};

function addTableData() {
  var tableService = azureStorage.createTableService(process.env.StorageConnectionString);
  var task = {
    PartitionKey: { _: subscriptionType },
    RowKey: { _: subscriberId },
    MatchingInputs: { _: matchingInputs },
    MatchingFunction: { _: matchingFunction }
  };
  tableService.insertEntity(common.functionTableName, task, function(error, result, response) {});
}
