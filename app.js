
/**
 * Module dependencies.
 */


var express = require('express')
  , resource   = require('express-resource')
  , routes = require('./routes')
  , event_routes = require('./routes/event')
  , mysql      = require('mysql')
  , http    = require('http')
  , path    = require('path')
  , MemoryStore  = express.session.MemoryStore
  , sessionStore = new MemoryStore()
  , Session = express.session.Session
  , connect = require("express/node_modules/connect")
  , wsGame = require('./websocket/game')
  , settings = require('./settings.json');

// create instance
var app = express();

// create db connection as pooled connection
var pool = mysql.createPool({
  host     : settings.dbhost,
  port     : settings.dbport,
  user     : settings.dbuser,
  password : settings.dbpassword,
  database : settings.dbdatabase
});


// all environments

app.configure(function() {
  app.set('port', process.env.PORT || 3001);

  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  
  // secret key for session
  app.set('secretKey', 'mySecret');
  
  // session key to store session id in cookie
  app.set('cookieSessionKey', 'sid');
  app.use(express.bodyParser());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());

  app.use(express.cookieParser(app.get('secretKey'))); // needed to use session
  app.use(express.session(
    {
    key : app.get('cookieSessionKey')
  , secret : app.get('secretKey')
  , store: sessionStore
  , cookie : {maxAge: 1000 * 60 * 60 * 24 * 7} // 1week
    }
  ));

  app.use(express.methodOverride());

  app.use(function(req, res, next){
    console.log('this function is called before url api call');
    // session data is stored in the followings
    var sessiondata = req.session;
    // sample to store data in the session
    if (!req.session.lasttime) {
      req.session.lasttime = parseInt((new Date)/1000);
    }

  // sample : check session data
  console.log(req.session.lasttime);

  // share db connection
  req.dbconn = pool;
  next();
  });

  app.use(app.router);

  // error handling
  app.use(function(err, req, res, next){
    console.log('error handling');
    if (!err) {
      console.log('no error');
      return;
    }
    console.log(err);
    console.log(err.stack);
    res.send(500, 'Server error!');
  });

  //use static public resources
  app.use(express.static(path.join(__dirname, 'public')));

});




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var apikeys = {id: 'id'};

app.get('/', routes.index);

// api for this service
// login
app.post('/login', require('./routes/login').login);
app.get('/login', require('./routes/login').logout);


// event
app.get('/events/:event_id', event_routes.event);

// event list
app.resource('events', require('./routes/events'), apikeys);


// api to get score table
app.resource('score', require('./routes/score'), apikeys);

// game sample
app.get('/game_sample', function(req, res) {
    res.render('game_sample');
});

//Create HTTP Server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
///////////////////////////////////////////////////////////////////////////////////////////////
//                                      Web Socket
///////////////////////////////////////////////////////////////////////////////////////////////
var socketio = require('socket.io').listen(server);
socketio.set('log level', 1);

// initialize websocket for game
var cookiename = 'cookie';

// share session between express and socket.id
socketio.set('authorization', function(handshakeData, callback) {
  var header_cookie = handshakeData.headers[cookiename];
  if (header_cookie) {
    // get cookie
    var cookie = require('cookie').parse(decodeURIComponent(header_cookie));
    cookie = connect.utils.parseSignedCookies(cookie, app.get('secretKey'));
    var sessionID = cookie[app.get('cookieSessionKey')];
    // get session
    sessionStore.get(sessionID, function(err, session) {
      if (err) {
        // in case of no session
        console.dir(err);
        callback(err.message, false);
      }
      else if (!session) {
        console.log('session not found');
        callback('session not found', false);
      }
      else {
        console.log("authorization success");
        
        // set session data to socket.io
        handshakeData.cookie = cookie;
        handshakeData.sessionID = sessionID;
        handshakeData.sessionStore = sessionStore;
        handshakeData.session = new Session(handshakeData, session);
        
        callback(null, true);
      }
    });
  }
  else {
    // in case of no cookie
    return callback('cookie not found', false);
  }
});


wsGame.initialize(server, socketio, cookiename);

/////////////////////////////////////////////////////////////////////////////////////
function playerinfo(id,name){ this.id=id; this.name=name;this.status="notready"; }

var players = [];  // all players connected with server
var gPlayerNum=0;//increase the user num(temp)

//register player
function register(id,name){
  if(id==name){
    players.push(new playerinfo(id,"ゲスト_"+gPlayerNum++));
  }
  else
  {
    gPlayerNum++;
    players.push(new playerinfo(id,name));
  }
}

// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

//Get Event Players
function playersInEvent(event_id)
{
  var playerslist = [];
  var event = event_routes.eventById(event_id);

  var i;
  for (i = 0; i < event.playerIds.length; i++) {
  	playerslist.push( playerById(event.playerIds[i]) );
  }

  return playerslist;

}



////////////////////////////////////////////////////////////////////////////////////////




// Socket client connection
socketio.of('/mobbing').on('connection', function(client) {

  // Socket client Disconnect Handler
  var fnClientDisconnect = function() {
  	var removePlayer = playerById(client.player_id);
  	// Player not found
  	if (!removePlayer) {
  		//util.log("Player not found: "+this.player_id);
      console.log('can not find');
      return;
  	};
  
      // Remove player from players array
  	players.splice(players.indexOf(removePlayer), 1);
  
    //leave the event
    var userId;
    if (client.handshake.session && client.handshake.session.user) {
      userId = client.handshake.session.user.id;
    }
    var event = event_routes.leave(pool, removePlayer.id, userId);
    if(event) this.leave( this.player_id);
  	else
  		return;
  
  	// Broadcast removed player to connected socket clients
  	this.broadcast.to(event.id).emit('push', {from:"server" , to:"othersInEvent" , msg:removePlayer.name +" が退出しました！"});
  	this.broadcast.to(event.id).emit('playerout', removePlayer);
  };

  /////Handlerの設定

  //Join
  client.on('join', function(param) { // クライアントから joinを受信した時
    var player_id = param.player_id;
    if(!player_id) player_id = client.id;

    //player 登録
    if(param.username) register(player_id, param.username);
    else register(player_id, player_id);

    var _cb = function(event) {
      client.join( event.id );
      client.event_id = event.id; //save event id to socket;
      client.player_id = player_id;//save player id to socket;
  
      //Event内、他のPlayerへ参加したことを通知
      client.broadcast.to(event.id).emit('push', {from:"server" , to:"othersInEvent" , msg:playerById(player_id).name +" が参加しました！"} );
      client.broadcast.to(event.id).emit('playerin', playerById(player_id));
  
      //Event内、すべてのPlayerの情報を取得し、自分に振り分けられたidを取得
      client.emit('playersupdate', playersInEvent(event.id) );
      client.emit('currentplayer',  playerById(player_id));
    };

    //event へjoin
    var userId;
    if (client.handshake.session && client.handshake.session.user) {
      userId = client.handshake.session.user.id;
    }
    event_routes.join(pool, param.event_id , player_id, userId, _cb);
  });


  //Disconnected
  client.on("disconnect", fnClientDisconnect); // クライアントDisconnect時

  //Send
  client.on('send', function(param) { // クライアントから send を受信した時
    client.emit('push', {from: client.player_id , to: client.player_id , msg: param.message}); // クライアントに push を送信
    if(client.event_id)
    {
      client.broadcast.to(client.event_id).emit('push', {from: client.player_id, to: "othersInEvent", msg: playerById(client.player_id).name +" : "+param.message}); // 他クライアントにも push イベントを送信
    }
    else///lobbyにいる、Eventへ未参加
    {
      client.broadcast.emit('push', {from:client.player_id, to:"othersInEvent", msg: playerById(client.player_id).name +" : "+param.message}); // 他クライアントにも push イベントを送信
    }
  });

  //status
  client.on('status', function(param) {
    //change status
    playerById(client.player_id).status = param.message;

    //broadcast to others in the Event
  	if(client.event_id)
    {
      client.broadcast.to(client.event_id).emit('status', {from:client.player_id, to:"othersInEvent", msg: param.message}); // 他クライアントにも push イベントを送信
    }
  });

});
