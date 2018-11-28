'use strict';

var debug = require('debug')('loopback:log:security:role-resolver')

module.exports = function(Server) {
  var Role = Server.models.Role

  function validId(id) {
    if (id) return id + ''
    return id
  }

  Role.registerResolver('everyone', function(role, ctx, cb) {
    debug('ROLE:EVERYONE')
    cb(null, true)
    return cb.promise
  })

  Role.registerResolver('authenticated', function(role, ctx, cb) {
    debug('ROLE:AUTHENTICATED')
    if (ctx['accessToken']['id'] == '$anonymous') cb(null, false)
    else if (ctx.modelName == ctx.accessToken.principalType){
      cb(null, true)
    } else cb(null, false)  
    return cb.promise
  })

  Role.registerResolver('owner', function(role, ctx, cb) {
    debug('ROLE:', role)
    //debug('ACCESS TOKEN: ', ctx.accessToken)
    if (ctx.accessToken['id'] == '$anonymous') cb(null, false)
    else if (ctx.accessToken.principalType == ctx.modelName) {
      if (ctx.accessToken.userId == ctx.modelId) {
        cb(null, true)
      } else cb(null, false)
    } else cb(null, false)
    return cb.promise
  })

  Role.registerResolver('residenceAdmin', function(role, ctx, cb) {
  debug('ROLE', role)
  debug(ctx['options'])
  if (ctx.accessToken['id'] == '$anonymous') cb(null, false)
  else {
    Server
      .models['Residence']
      .findOne({
        where: {
          id: validId(ctx.accessToken['userId']),
          communityId: validId(ctx.modelId)
        }
      })
      .then(function(residence) {
        if (residence) cb(null, true)
        else cb(null, false)
        return null
      })
      .catch(function(err) {
        cb(null, false)
        return null
      })
  }
  return cb.promise
  })

  Role.registerResolver('conciencity', function(role, ctx, cb){
    debug('ROLE:', role)
    if (ctx.accessToken['id'] == '$anonymous') cb(null, false)
    else if (ctx.accessToken.principalType == 'Conciencity') {
      cb(null, true)
    } else cb(null, false)
    return cb.promise
  })

  Role.registerResolver('communityManager', function(role, ctx, cb){
    debug('ROLE:', role)
    if (ctx.accessToken['id'] == '$anonymous') cb(null, false)
    else if (ctx.accessToken.principalType == 'CommunityManager') {
      cb(null, true)
    } else cb(null, false)
    return cb.promise
  })

}
