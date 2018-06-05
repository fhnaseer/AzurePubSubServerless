const common = require('../Shared/common');

let topics = {};
let subscriberId = '';

module.exports = function(context, req) {
  if (req.body) {
    topics = req.body.topics;
    subscriberId = req.body.subscriberId;
    addTableData();
    common.sendQueueConnectionResponse(context, subscriberId);
  } else {
    common.sendErrorResponse(context, 'Please pass subscriberId and topics list in the request body');
  }
};

function addTableData() {
  var tableService = common.getTableService();
  topics.map(topic => {
    var task = {
      PartitionKey: { _: topic },
      RowKey: { _: subscriberId }
    };
    tableService.insertEntity(common.topicsTableName, task, function(error) {});
  });
}
