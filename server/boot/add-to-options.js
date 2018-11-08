'use strict';

var debug = require('debug')('loopback:log:boot:add-to-options');
var utils = require('../../lib/utils');

module.exports = function(Server) {
  var req, token;
  Server.remotes().phases
    .addBefore('auth', 'options-from-request')
    .use(function(ctx, next) {
      if (!ctx.args.options) ctx.args.options = {};
      ctx.args.options['user'] = null;
      req = ctx.req;
      token = req.headers['Authorization'] ||
        req.headers['access_token'] || req.query['Authorization'] ||
        req.query['access_token'];
      if (!token) next();
      else {
        Server.models['CustomAccessToken']
          .findById(utils.validId(token), {include: "user"})
          .then(function(accessToken) {
            if (!accessToken) ctx.args.options['accessToken'] = "$anonymous";
            else {
              ctx.args.options['accessToken'] = accessToken;
              if (accessToken['user']) {
                ctx.args.options['user'] = accessToken['user']();
              }
            }
            next();
          })
          .catch(function(err) {
            next();
          });
      }
      return next.promise;
    });
};

