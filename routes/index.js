
/*
 * GET home page.
 */

exports.index = function(req, res){
  if( req.session.username ) {
    res.render('index', { username: req.session.username,
                          status: 'logined', 
                          login_message: '', 
                          register_message: '' });
  } else {
    res.render('index', { username: '',
                          status: 'not logined', 
                          login_message: '', 
                          register_message: '' });
  }
};