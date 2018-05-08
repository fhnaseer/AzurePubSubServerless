const azure = require('azure');
const azureStorage = require('azure-storage');
const environment = require('./environment');

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
    connectionString: environment.topicsConnectionString,
    queueName: queueName
  });
}

function sendResponse(context, message, statusCode) {
  context.res = {
    status: statusCode,
    body: {
      message
    }
  };
  context.done();
}

function createMessageQueue(queueName, connectionString = environment.topicsConnectionString) {
  var serviceBusService = azure.createServiceBusService(connectionString);
  serviceBusService.createQueueIfNotExists(queueName, function(error) {});
}

function deleteMessageQueue(queueName, connectionString = environment.topicsConnectionString) {
  var serviceBusService = azure.createServiceBusService(connectionString);
  serviceBusService.deleteQueue(queueName, function(error) {});
}

function createTable(tableName, context, connectionString = environment.storageConnectionString, callback = null) {
  var tableService = azureStorage.createTableService(environment.storageConnectionString);
  tableService.createTableIfNotExists(tableName, function(error, result, response) {
    if (error) {
      sendErrorResponse(confirm, error);
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
