var async     = require('async')
  , Entity    = require('../dao/Score')
  , Mapper    = require('../dao/ScoreMapper')
  , ErrorCode = require('../lib/errorcode')
  , Request   = require('../lib/requestquery');

function execute(req, res, next, method, view) {
  var dbconn = req.dbconn;
  if (!dbconn) {
    res.jsonp({result: 'FAIL', error: 'no db connection'});
    return;
  }
  
  var fnParams = function(cb) {
    var params = {limit: 20};
    var reqparams = Request.getParameter(req);
    if (reqparams) {
      Request.setParameter(reqparams, params, method);
    }
    cb(null, params);
  };
  
  var fnRequest = function(params, cb) {
    Request.request(dbconn, Entity, Mapper, params, method, view, cb);
  };
  
  async.waterfall([fnParams, fnRequest], function(err, records) {
    if (err) {
      console.log(err);
      var errcode = err.code;
      if (!ErrorCode[errcode] || ErrorCode[errcode] !== true) {
        res.jsonp({result: 'FAIL'});
        return;
      }
    }
    res.jsonp({result: 'SUCCESS', data: records});
  });
}

module.exports = {
  index: function(req, res, next){
    execute(req, res, next, 'select', 'show');
  },
  create: function(req, res, next){
    execute(req, res, next, 'insert', 'create');
  },
  show: function(req, res, next){
    execute(req, res, next, 'select', 'show');
  },
  update: function(req, res, next){
    execute(req, res, next, 'update', 'update');
  }
};


