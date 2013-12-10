
/*
 * GET home page.
 */

exports.index = function(req, res){
  if( req.session.username ) {
    res.render('index', { status: 'logined : username = ' + req.session.username, login_message: '', register_message: '' });
  } else {
    res.render('index', { status: 'not logined', login_message: '', register_message: '' });
  }
};