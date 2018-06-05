const uuidv1 = require('uuid/v1');
const common = require('../Shared/common');

module.exports = function(context, req) {
  let subscriberId = 'subscriber' + uuidv1().replace(/-/g, '');
  common.createMessageQueue(subscriberId);
  common.sendQueueConnectionResponse(context, subscriberId);
};
