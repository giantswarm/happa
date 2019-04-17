// Mock superagent.Request to use native Promise which is mocked by 'promise-mock'

module.exports = function(superagent) {
  var Request = superagent.Request;

  Request.prototype.promise = function() {
    var req = this;
    var error;
    return new Promise(function(resolve, reject) {
      req.end(function(err, res) {
        if (typeof res !== 'undefined' && res !== null && res.status >= 400) {
          var msg = 'cannot ' +
            req.method +
            ' ' +
            req.url +
            ' (' +
            res.status +
            ')';
          error = new superagent.SuperagentPromiseError(msg);
          error.status = res.status;
          error.body = res.body;
          error.res = res;
          reject(error);
        } else if (err) {
          reject(new superagent.SuperagentPromiseError(err.message, err));
        } else {
          resolve(res);
        }
      });
    });
  };
};
