const common = require('../Shared/common');

let subscriberId = '';
let functionType = '';
let subscriptionTopic = '';
let matchingInputs = '';
let matchingFunction = '';

module.exports = function (context, req) {
  if (req.body) {
    subscriberId = req.body.subscriberId;
    functionType = req.body.functionType;
    subscriptionTopic = req.body.subscriptionTopic;
    matchingInputs = req.body.matchingInputs;
    matchingFunction = req.body.matchingFunction;
    addTableData();
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId, funtionType, subscriptionTopic, matchingInputs and matchingFunction in the request body');
  }
};

function addTableData() {
  var tableService = common.getTableService();
  var task = {
    PartitionKey: { _: subscriptionTopic },
    RowKey: { _: subscriberId },
    FunctionType: { _: functionType },
    MatchingFunction: { _: matchingFunction },
    MatchingInputs: { _: matchingInputs }
  };
  tableService.insertEntity(common.functionTableName, task, function (error, result, response) { });
}
