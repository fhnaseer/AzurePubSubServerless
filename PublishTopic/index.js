const common = require('../Shared/common');
const azureStorage = require('azure-storage');

let message = '';
let topics = {};

module.exports = function(context, req) {
  if (req.body) {
    message = req.body.message;
    topics = req.body.topics;
    queryTableData();
    common.sendOkResponse(context, 'Messages published,');
  } else {
    common.sendErrorResponse(context, 'Please pass message and topics list in the request body');
  }
};

function queryTableData(context) {
  var tableService = common.getTableService();
  topics.map(topic => {
    var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey']).where('PartitionKey eq ?', topic);
    tableService.queryEntities(common.topicsTableName, query, null, function(error, result, response) {
      if (error) {
        common.sendErrorResponse(context, error);
      } else {
        publishMessages(response.body.value, message);
      }
    });
  });
}

function publishMessages(topics, message) {
  var serviceBusService = common.getServiceBusService();
  topics.map(topic => {
    let completeMessage = {
      topic: topic.PartitionKey,
      message: message
    };
    serviceBusService.sendQueueMessage(topic.RowKey, JSON.stringify(completeMessage), function(error) {});
  });
}
