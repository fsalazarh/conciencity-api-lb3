'use strict';
var debug = require('debug')('loopback:log:models:assignment');
var utils = require('../../lib/utils');


module.exports = function(Data) {
  const Model = Data
  Model.__get__totalWaste = function(cb) {
    let self = this

    Model.find({
        fields: ['weight']
    })
    .then(function(res){
        if (!res) {
            let error = new Error()
            error.statusCode = 404
            error.code = 'DATA_NOT_FOUND'
            error.name = 'DATA not found'
            error.message = 'DATA not found'
            cb(error)
        } else {
            let response = res.map(item => {return item.toJSON()})
            let totalWaste = response.reduce((a, b) => a + (b["weight"] || 0), 0);
            response = {
              "totalWeight": totalWaste
            }
            cb(null, response)
          }
          //cb(null, response)          
        return null
    })
    .catch(function(err){
        cb(err)
        return null
    })
    return cb.promise;
};

Model.remoteMethod('__get__totalWaste', {
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'GET', path: '/totalWaste'}
});

  
};
