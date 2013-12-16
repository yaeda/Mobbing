
var ErrorCode = require('./errorcode')
  , ObjUtil   = require('./objectutil')
  , QueryUtil = require('./queryutil');


var requestquery = {

  getParameter: function(req) {
    if (!req) {return;}
    var params = {};
    var setParam = function(src, dst) {
      if (!src || !dst) {return;}
      for (var param in src) {
        if (typeof(param) === 'function') {
          continue;
        }
        dst[param] = src[param];
      }
    }
    if (req.params) {
      setParam(req.params, params);
    }
    if (req.query) {
      setParam(req.query, params);
    }    
    if (req.body) {
      setParam(req.body, params);
    }
    return params;
  },

  setParameter: function(src, dst, method) {
    if (!src || !dst) {
      return;
    }
    for (var param in src) {
      if (method !== 'select') {
        if (param === 'orders' || param === 'limit' || param === 'offset') {
          continue;
        }
      }
      dst[param] = src[param];
    }
  },

  _getRecord: function(params) {
    if (!params || !params.record) {
      return;
    }
    var record = params.record;
    delete  params.record;
    if (ObjUtil.isString(record) === true) {
      try {
        record = JSON.parse(record);
      } catch (e) {
        throw e;
        return;
      }
    }
    return ObjUtil.toArray(record);
  },

  _getOrder: function(params) {
    if (!params || !params.order) {
      return;
    }
    var order = params.order;
    delete  params.order;
    if (ObjUtil.isString(order) === true) {
      try {
        order = JSON.parse(order);
      } catch (e) {
        order = {key: order};
      }
    }
    return ObjUtil.toArray(order);
  },

  request: function(conn, entity, mapper, params, method, view, cb) {
    var err;
    if (!conn) {
      err = new Error('no db connection');
      if (cb) {cb(err);}
      return;
    }
    if (!entity || !mapper) {
      err = new Error('request object is not set');
      if (cb) {cb(err);}
      return;
    }

    // get param pair
    var records;
    var orders;
    // get record and order
    records = requestquery._getRecord(params);
    orders  = requestquery._getOrder(params);

    if (method === 'insert' && !records) {
      records = entity.create(params);
    }
console.log(records);

    if (orders) {
      params.orders = orders;
    }

    try {
      if (mapper[method]) {
        mapper[method](conn, records, params, cb);
      } else {
        err = new Error('invalid method');
        if (cb) {cb(err);}
      }
    } catch(err) {
      if (cb) {cb(err);}
    }
  }

};

module.exports = requestquery;

