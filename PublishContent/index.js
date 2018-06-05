const common = require('../Shared/common');

let message = '';
let contents = {};

module.exports = function(context, req) {
  if (req.body) {
    message = req.body.message;
    contents = req.body.content;
    queryTableData();
    common.sendOkResponse(context, 'Messages published,');
  } else {
    common.sendErrorResponse(context, 'Please pass message and topics list in the request body');
  }
};

function queryTableData(context) {
  var tableService = common.getTableService();
  contents.map(content => {
    var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey', 'Value', 'Condition']).where('PartitionKey eq ?', content.key);
    tableService.queryEntities(common.contentTableName, query, null, function(error, result, response) {
      if (error) {
        common.sendErrorResponse(context, error);
      } else {
        publishMessages(response.body.value, message);
      }
    });
  });
}

function publishMessages(topics, message) {
  let content;
  var serviceBusService = common.getServiceBusService();
  topics.map(topic => {
    content = findObjectByKey(contents, 'key', topic.PartitionKey);
    var addMessage = checkConditions(topic.Condition, content.value, topic.Value);
    if (addMessage) {
      let completeMessage = {
        topic: topic.PartitionKey,
        value: topic.Value,
        message: message
      };
      serviceBusService.sendQueueMessage(topic.RowKey, JSON.stringify(completeMessage), function(error) {});
    }
  });
}

function findObjectByKey(array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return array[i];
    }
  }
  return null;
}

function checkConditions(operator, publicationValueString, subscriberValueString) {
  if (operator === '>=' || operator === '>' || operator === '<' || operator === '<=') {
    let publicationVal = parseFloat(publicationValueString);
    let subscriberVal = parseFloat(subscriberValueString);
    if (isNaN(publicationVal) || isNaN(subscriberVal)) {
      return false;
    } else {
      if (operator === '>=') {
        if (publicationVal >= subscriberVal) {
          return true;
        }
      } else if (operator === '>') {
        if (publicationVal > subscriberVal) {
          return true;
        }
      } else if (operator === '<') {
        if (publicationVal < subscriberVal) {
          return true;
        }
      } else if (operator === '<=') {
        if (publicationVal <= subscriberVal) {
          return true;
        }
      }
    }
  } else if (operator === '=') {
    let publicationVal = publicationValueString;
    let subscriberVal = subscriberValueString;
    if (publicationVal.toLowerCase() === subscriberVal.toLowerCase()) {
      return true;
    }
  }
  return false;
}
