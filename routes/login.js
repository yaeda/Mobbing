
/*
 * Login and Register
 */



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
  console.log(req.body);

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
  
  res.render('index', { login_message: '', register_message: 'mail:' + mail + ', name:' + name + ', pass:' + pass });

};

function _login(req, res, next) {
  console.log("Login!");
  console.log(req.body);

  var name;
  var pass;

  if( req.body.name ) {
    name = req.body.name;
  }
  if( req.body.pass ) {
    pass = req.body.pass;
  }

  res.render('index', { login_message: 'name:' + name + ', pass:' + pass, register_message: '' });

};

module.exports = {
  login: function(req, res, next){
    login(req, res, next);
  },
};


