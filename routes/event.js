/********************************************************
var async     = require('async')
  , Entity    = require('../dao/Event')
  , Mapper    = require('../dao/EventMapper')
  , ErrorCode = require('../lib/errorcode')
  , Request   = require('../lib/requestquery');

function execute(req, res, next, method, view) {
  var dbconn = req.dbconn;
  if (!dbconn) {
    res.jsonp({result: 'FAIL', error: 'no db connection'});
    return;
  }
  
  var username;
  var userid;
  if( req.session && req.session.user ) {
    username = req.session.user.name;
    userid = req.session.user.id;
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

*************************************************************/


////////////////////////////////////Following is Added by wang///////////////////////////////////////////
var Score       = require('../dao/Score')
  , ScoreMapper = require('../dao/ScoreMapper')
  , ErrorCode = require('../lib/errorcode');


function eventinfo(event_id){this.id = event_id;this.playerIds = [];}
var events = [];   // all events in server

// Find event by ID
function eventById(id) {
	var i;
	for (i = 0; i < events.length; i++) {
		if (events[i].id == id)
			return events[i];
	};
	
	return false;
};

//create event
function createEvent(id){
    var event = new eventinfo(id);
    events.push(event);
    return event;
}

// Find event by playerid
function eventByPlayerId(id) {
	var i;
	for (i = 0; i < events.length; i++) {
		var j;
		for(j =0; j < events[i].playerIds.length;j++){
		if (events[i].playerIds[j] == id)
			return events[i];
		}
	};
	
	return false;
};

// player join
// next step, we need to use userid as playerId
function join(pool, eventId, playerId, userId, cb)
{
  var event = eventById(eventId);
  if(event==false) event = createEvent(eventId);
  event.playerIds.push(playerId);

  // add data to db
  var score = Score.create();
  score.User_id  = userId;
  score.Event_id = eventId;

  var _cb = function(err, records) {
    return cb(event);
  };
  ScoreMapper.insert(pool, score, null, _cb);
}

//player leave
function leave(pool, playerId, userId)
{
  var event = eventByPlayerId(playerId);
  if(event)
  {
    // delete data from db
    var score = Score.create();
    score.User_id  = userId;
    score.Event_id = event.id;
    
    ScoreMapper.delete(pool, score, {que: 'score IS NULL'});
    event.playerIds.splice(event.playerIds.indexOf(playerId), 1);
    return event;
  }
  else
  return false;
}

function updateScore(pool, userId, value)
{
  var event = eventByPlayerId(userId);
  if (event !== null && event !== undefined)
  {
    // update data from db
    var score = Score.create();
    score.User_id = userId;
    score.Event_id = event.id;

    var _cb = function(err, retScore) {
      if (retScore && retScore.length > 0) {
        retScore[0].score = value;
        ScoreMapper.update(pool, retScore, null, function(err, hoge) {
          console.log(hoge);
        });
      }
    }

    ScoreMapper.select(pool, score, null, _cb)
  }
}


///////exports
exports.eventlist = events;
exports.eventById = eventById;
exports.join = join;
exports.leave = leave;
exports.updateScore = updateScore;

exports.event = function(req, res){

  // no user info in session
  if( !req.session.user ) {
    res.redirect('/');
  }

  //event idを取得
  var str = req.url;
  var strArry = str.split("/");
  var event_id = strArry[strArry.length-1];
  
  var username;
  var userid;
  if( req.session && req.session.user ) {
    username = req.session.user.name;
    userid = req.session.user.id;
  }
  
  //eventを取得,存在しない場合Create
  var event = eventById(event_id);
  if(event==false) event = createEvent(event_id);
  
  res.render('event', { event_id: event_id, username: username, userid: userid });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
