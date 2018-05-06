const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('../Shared/environment');
let tableName = 'content';
let message = '';
let contents = {};

module.exports = function(context, req) {
  if (req.body) {
    let message = req.body.message;
    contents = req.body.content;

    var tableService = azureStorage.createTableService(environment.storageConnectionString);
    contents.map(content => {
      var query = new azureStorage.TableQuery().select(['PartitionKey', 'RowKey', 'Value', 'Condition']).where('PartitionKey eq ?', content.key);
      tableService.queryEntities(tableName, query, null, function(error, result, response) {
        if (!error) {
          context.log(response.body.value);
          publishMessages(response.body.value, message);
        }
      });
    });

    context.res = {
      status: 200,
      body: 'Messages published,'
    };
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
  }
  context.done();
};

function publishMessages(topics, message) {
  let content;

  var serviceBusService = azure.createServiceBusService(environment.topicsConnectionString);
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
