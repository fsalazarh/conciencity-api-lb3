'use strict';

module.exports = function(Community) {
    var Model = Community

    Model.prototype.getSomething = function(options, cb) {
      cb(null, options)
      return cb.promise
    }

    Model.remoteMethod(
      'prototype.getSomething',
      {
        description: 'Get tsomething',
        accessType: 'READ',
        accepts: [
          {
            arg: 'options',
            type: 'object',
            http: 'optionsFromRequest'
          }
        ],
        returns: {arg: 'data', type: 'any', root: true},
        http: {path: '/something', verb: 'get'}
      }
    )
};
