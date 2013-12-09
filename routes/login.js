
/*
 * Login and Register
 */

var mysql    = require('mysql');
var settings = require('./../settings.json');

// create db connection as pooled connection
var pool = mysql.createPool({
  host     : settings.dbhost,
  port     : settings.dbport,
  user     : settings.dbuser,
  password : settings.dbpassword
});

var SQLselect = "select * from webgame.User WHERE name = ? AND password = ?";
var SQLinsert = "insert into webgame.User (email, name, password, icon_url) VALUES(?, ?, ?, ?)";

function login(req, res, next) {
  console.log(req.body);

  var submit;
  if( req.body.submit ) {
    submit = req.body.submit;
  }

  if( submit === "Login" ) {
    _login(req, res, next);
  }
  else if( submit === "Register" ) {
    _register(req, res, next);
  }
  else {
    console.log("ERROR!");
  }
  
};

function _register(req, res, next) {
  console.log("Register!");

  var mail;
  var name;
  var pass;

  if( req.body.mail ) {
    mail = req.body.mail;
  }
  if( req.body.name ) {
    name = req.body.name;
  }
  if( req.body.pass ) {
    pass = req.body.pass;
  }
  
  // DB connection
  pool.getConnection( function( err, connection ) {
    // Use the connection
    connection.query( SQLinsert, [mail, name, pass, ''], function( err, rows ) {
      connection.release();
    } );
  } );

  
  res.render('index', { login_message: '', register_message: 'mail:' + mail + ', name:' + name + ', pass:' + pass });

};

function _login(req, res, next) {
  console.log("Login!");

  var name;
  var pass;

  if( req.body.name ) {
    name = req.body.name;
  }
  if( req.body.pass ) {
    pass = req.body.pass;
  }

  // DB connection
  pool.getConnection( function( err, connection ) {
    // Use the connection
    connection.query( SQLselect, [name, pass], function( err, rows ) {
      if( rows === null || rows === undefined || rows.length === 0 ) {
        console.log( 'login error!' );
      }
      else {
        console.log( 'login success!' );
      }
      connection.release();
    } );
  } );


  res.render('index', { login_message: 'name:' + name + ', pass:' + pass, register_message: '' });

};

module.exports = {
  login: function(req, res, next){
    login(req, res, next);
  },
};


