
/**
 * Module dependencies.
 */

var express = require('express')
  , resource   = require('express-resource')
  , routes = require('./routes')
  , mysql      = require('mysql')
  , http = require('http')
  , path = require('path')
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
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser()); // needed to use session
app.use(express.session(
  {secret : 'secret',
   cookie : {maxAge: 1000 * 60 * 60 * 24 * 7} // 1week
  }
));
app.use(express.methodOverride());
app.use(function(req, res, next){
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

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var apikeys = {id: 'id'};

// api for this service
// login
app.resource('login', require('./routes/login'), apikeys);
// event
app.resource('event', require('./routes/event'), apikeys);

// api to get score table
app.resource('score', require('./routes/score'), apikeys);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
