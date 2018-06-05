const common = require('../Shared/common');

module.exports = function(context, req) {
  common.createTable(common.topicsTableName, context);
  common.createTable(common.contentTableName, context);
  common.createTable(common.functionTableName, context);
  common.sendOkResponse(context, 'Resources created');
};
