'use strict';

var debug = require('debug')('loopback:log:nest-remoting');

module.exports = function(Server) {
  var Community = Server.models.Community

  Community.nestRemoting('residences');
};
