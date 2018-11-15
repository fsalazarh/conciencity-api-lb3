'use strict';

module.exports = function(Residence) {

    Residence.getLastWasteCollection = function(id, cb){
        return Residence.findById(id)
    }

    Residence.remoteMethod('getLastWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'name', type: 'string'},
        http: {verb: 'GET', path: '/:id/getLastWasteCollection'}
    });
  };
