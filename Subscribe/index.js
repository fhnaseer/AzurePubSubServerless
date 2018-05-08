const uuidv1 = require('uuid/v1');
const common = require('../Shared/common');

module.exports = function(context, req) {
  let subsriberId = 'subscriber' + uuidv1().replace(/-/g, '');
  common.sendOkResponse(context, { id: subsriberId });
};
