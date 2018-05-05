const uuidv1 = require('uuid/v1');

module.exports = function(context, req) {
  let subsriberId = 'subscriber' + uuidv1().replace(/-/g, '');
  context.res = {
    body: { id: subsriberId }
  };
  context.done();
};
