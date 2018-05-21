const azure = require('azure');
const azureStorage = require('azure-storage');

let topicsTableName = 'topics';
let contentTableName = 'content';
let functionTableName = 'functions';
let tableNames = [topicsTableName, contentTableName, functionTableName];

function sendOkResponse(context, message) {
  sendResponse(context, message, 200);
}

function sendErrorResponse(context, message) {
  sendResponse(context, message, 400);
}

function sendQueueConnectionResponse(context, queueName) {
  sendOkResponse(context, {
    connectionString: process.env.TopicsConnectionString,
    queueName: queueName
  });
}

function sendResponse(context, message, statusCode) {
  context.res = {
    status: statusCode,
    body: message
  };
  context.done();
}

function createMessageQueue(queueName, connectionString = process.env.TopicsConnectionString) {
  var serviceBusService = azure.createServiceBusService(connectionString);
  serviceBusService.createQueueIfNotExists(queueName, function(error) {});
}

function deleteMessageQueue(queueName, connectionString = process.env.TopicsConnectionString) {
  var serviceBusService = azure.createServiceBusService(connectionString);
  serviceBusService.deleteQueue(queueName, function(error) {});
}

function createTable(tableName, context, connectionString = process.env.StorageConnectionString, callback = null) {
  var tableService = azureStorage.createTableService(process.env.StorageConnectionString);
  tableService.createTableIfNotExists(tableName, function(error, result, response) {
    if (error) {
      sendErrorResponse(context, error);
    } else {
      callback();
    }
  });
}

module.exports = {
  topicsTableName,
  contentTableName,
  functionTableName,
  sendOkResponse,
  sendErrorResponse,
  sendQueueConnectionResponse,
  createMessageQueue,
  deleteMessageQueue,
  createTable
};
