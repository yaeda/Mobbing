
/*
 * GET home page.
 */



function execute(req, res, next, method, view) {
console.log(method);
console.log(next);

var err = new Error('event error');
next(err);
return;

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


