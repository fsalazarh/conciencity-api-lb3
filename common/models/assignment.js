'use strict';
var debug = require('debug')('loopback:log:models:assignment');
var utils = require('../../lib/utils');


module.exports = function(Assignment) {
  const Model = Assignment

  Model.beforeRemote('create', function(context, modelInstance, next){

    // Add fields to instance
    context.args.data["principalType"] = context.args.options.accessToken.principalType;
    next();
  });

};
