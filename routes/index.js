
/*
 * GET home page.
 */

exports.index = function(req, res){
  if( req.session.user ) {
    console.log(req.session);
    //res.redirect('/events');
    res.render('index', { username: req.session.user.name,
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