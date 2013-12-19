var async           = require('async')
  , Entity          = require('../dao/Event')
  , EventMapper     = require('../dao/EventMapper')
  , EventListMapper = require('../dao/EventListMapper')
  , ErrorCode = require('../lib/errorcode')
  , Request   = require('../lib/requestquery');

var ejs = {
  show  : 'events.ejs',
  new   : 'eventnew.ejs',
  edit  : 'eventedit.ejs'
}


function fnRequest(conn, req, mapper, method, view, cb) {
  var _fnParams = function(cb) {
    var params = {limit: 20};
    var reqparams = Request.getParameter(req);
    if (reqparams) {
      Request.setParameter(reqparams, params, method);
    }
    cb(null, params);
  };
  
  var _fnRequest = function(params, cb) {
    Request.request(conn, Entity, mapper, params, method, view, cb);
  }; 

  async.waterfall([_fnParams, _fnRequest], function(err, records) {
    if (err) {
      console.log(err);
      var errcode = err.code;
      if (!ErrorCode[errcode] || ErrorCode[errcode] !== true) {
        cb(err);
        return;
      }
    }
    cb(err, records);
  });

};


function execute(req, res, next, method, view) {
  var dbconn = req.dbconn;
  if (!dbconn) {
    res.jsonp({result: 'FAIL', error: 'no db connection'});
    return;
  }

  var username;
  var userid;
  if( req.session.user.name ) {
    username = req.session.user.name;
  }
  if( req.session.user.id ) {
    userid = req.session.user.id;
  }

  var _fnRender = function(err, view, data) {
    res.render(ejs[view], data);
  };

  var _fnShow = function(method, view) {
    var _cbShow = function(err, records) {
      _fnRender(err, view, {events: records, username: username, userid: userid});
    };
    fnRequest(dbconn, req, EventListMapper, method, view, _cbShow);
  };
  
  var _fnCreate = function(method, view) {
    var _cbCreate = function(err, records) {
      _fnShow('select', 'show');
    };
    fnRequest(dbconn, req, EventMapper, method, view, _cbCreate);
  };

  if (!method && (view === 'new' || view === 'edit')) {
    _fnRender(null, view, {username: username, userid: userid});
    return;
  } else if (view === 'show') {
    _fnShow(method, view);
  } else if (view === 'create') {
    _fnCreate(method, view);
  }

}

module.exports = {
  index: function(req, res, next){
    execute(req, res, next, 'select', 'show');
  },
  new: function(req, res, next){
    execute(req, res, next, null, 'new');
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


