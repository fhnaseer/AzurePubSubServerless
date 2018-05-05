const uuidv1 = require('uuid/v1');

module.exports = function(context, req) {
  let subsriberId = uuidv1();
  context.res = {
    body: { id: subsriberId }
  };
  context.done();
};
