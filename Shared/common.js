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

function sendResponse(context, message, statusCode) {
  context.res = {
    status: statusCode,
    body: {
      message
    }
  };
  context.done();
}

function deleteMessageQueue(queueName, connectionString = environment.topicsConnectionString) {
  var serviceBusService = azure.createServiceBusService(connectionString);
  serviceBusService.deleteQueue(queueName, function(error) {});
}

module.exports = {
  sendOkResponse,
  sendErrorResponse,
  deleteMessageQueue
};
