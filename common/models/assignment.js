'use strict';
var debug = require('debug')('loopback:log:models:assignment');


module.exports = function(Assignment) {
  const Model = Assignment
  Model.beforeRemote('patchAttributes', function(context, modelInstance, next){
    console.log("Before remote")
    if(context.args.data.user_type == "Recycler"){
      Model.app.models['Recycler'].findById(context.args.data.user_id)
      .then(function(response){
        response = response.toJSON()
        debug(response);
      })
    }
  });
};
