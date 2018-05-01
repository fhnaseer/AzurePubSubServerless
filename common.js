const azure = require('azure');
const each = require('async/each');

function createMessageQueues(serviceBusService, topics) {
  each(topics, function(topic) {
    serviceBusService.createQueueIfNotExists(topic, function(error) {
      if (error) {
        context.log(error);
      }
    });
  });
}

module.exports = {
  createMessageQueues
};
