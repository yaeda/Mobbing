/*
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

*/
////////////////////////////////////Following is Added by wang///////////////////////////////////////////

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

//player join 
function join( eventId, playerId)
{
  var event = eventById(eventId);
  if(event==false) event = createEvent(eventId);
  
  event.playerIds.push(playerId);
  
  return event;

}

//player leave
function leave(playerId)
{
  var event = eventByPlayerId(playerId);
  if(event)
  {
    event.playerIds.splice(event.playerIds.indexOf(playerId), 1);
    return event;
  }
  else
  return false;
}


///////exports
exports.eventlist = events;
exports.eventById = eventById;
exports.join = join;
exports.leave = leave;

exports.event = function(req, res){
  //event id‚ðŽæ“¾
  var str = req.url;
  var strArry = str.split("/");
  var event_id = strArry[strArry.length-1];
  
  //event‚ðŽæ“¾,‘¶Ý‚µ‚È‚¢ê‡Create
  var event = eventById(event_id);
  if(event==false) event = createEvent(event_id);
  
  res.render('event', { event_id: event_id });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
