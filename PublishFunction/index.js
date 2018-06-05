const common = require('../Shared/common');
const azureStorage = require('azure-storage');

let subscriptionType = '';
let message = '';

module.exports = function(context, req) {
  if (req.body) {
    message = req.body.message;
    subscriptionType = req.body.subscriptionType;
    queryTableData(context);
    common.sendOkResponse(context, 'Messages published,');
    context.done();
  } else {
    common.sendErrorResponse(context, 'Please pass message and subscriptionType in the request body');
  }
};

function queryTableData(context) {
  var tableService = common.getTableService();
  var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey', 'MatchingInputs', 'MatchingFunction']).where('PartitionKey eq ?', subscriptionType);
  tableService.queryEntities(common.functionTableName, query, null, function(error, result, response) {
    if (error) {
      common.sendErrorResponse(context, error);
    } else {
      publishMessages(response.body.value);
    }
  });
}

function publishMessages(topics) {
  var serviceBusService = common.getServiceBusService();
  topics.map(topic => {
    let matchingFunction = new Function(topic.MatchingInputs, topic.MatchingFunction);
    let value = matchingFunction(message);
    if (value) {
      let completeMessage = {
        topic: topic.PartitionKey,
        message: message,
        value: value
      };
      serviceBusService.sendQueueMessage(topic.RowKey, JSON.stringify(completeMessage), function(error) {});
    }
  });
}
