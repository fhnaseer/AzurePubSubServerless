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

function createMessageQueue(queueName) {
  var serviceBusService = getServiceBusService();
  serviceBusService.createQueueIfNotExists(queueName, function(error) {});
}

function createTable(tableName, context, callback = null) {
  var tableService = getTableService();
  tableService.createTableIfNotExists(tableName, function(error, result, response) {
    if (error) {
      sendErrorResponse(context, error);
    } else {
      callback();
    }
  });
}

function getTableService() {
  return azureStorage.createTableService(process.env.StorageConnectionString);
}

function getServiceBusService() {
  return azure.createServiceBusService(connectionString);
}

module.exports = {
  topicsTableName,
  contentTableName,
  functionTableName,
  sendOkResponse,
  sendErrorResponse,
  sendQueueConnectionResponse,
  createMessageQueue,
  createTable,
  getTableService,
  getServiceBusService
};
