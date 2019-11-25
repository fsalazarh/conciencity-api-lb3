'use strict';

var debug = require('debug')('loopback:log:models:recycler');
var utils = require('../../lib/utils');

module.exports = function(Recycler) {
    var Model = Recycler
    var oneDay = 24 * 60 * 60 * 1000;
    Model.prototype.__get__community__composter_measurementsSensor = function(cb) {
        let self = this
        let recyclerId = utils.validId(self['id'])
        Model.app.models['RecyclerCommunity'].find({
            fields: ['id', 'communityId'],
            where: {
                recyclerId: recyclerId
            },
            include: {
                relation: 'community',
                scope: {
                    fields: ['id'],
                    include: {
                        relation: 'composter',
                        scope: {
                            fields: ['id'],
                            include: {
                                relation: 'slot',
                                scope: {
                                    fields: ['id'],
                                    include: {
                                        relation: 'sensor',
                                        scope: {
                                            fields: ['id'],
                                            include: {
                                                relation: 'measurementsSensor',
                                                scope: {
                                                    fields: ['id', 'date', 'parameter', 'value'],
                                                    //where: {date: {gt: Date.now() - oneDay}},
                                                    order: 'date DESC',
                                                    limit: 24
                                                }
                                            }
                                        }
                                    }
                                }                              
                            }                           
                        }
                    }
                }
            }
        })
        .then(function(res){ 
            let measurementsJson = res.map(item => {return item.toJSON()})
            let response = []
            measurementsJson.forEach(function(item){
                response.push(item.community.composter.slot.sensor.measurementsSensor)
            })
            response = response.flat()
            console.log(response.length)
            cb(null, response)          
            return null
        })
        .catch(function(err){
            cb(err)
            return null
        })
        return cb.promise;
    };

    Model.remoteMethod('prototype.__get__community__composter_measurementsSensor', {
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'GET', path: '/community/composter/slot/sensor/measurementsSensor'}
    });


    /* Custom delete */
    Recycler.customDelete = function(id, cb){
      Recycler.findById(id, function(err, instance){
        if(err){
          cb(err);
          return null;
        }
        const Recycler = instance;
        //Check active of instance
        if(Recycler.active == 'true'){
          Recycler.updateAttributes({'active': false}, function(err, data){
            if(err){
              cb(err);
              return null;
            }
            cb(data);
          })
        }
        else{
          let error = new Error()
          error.statusCode = 409
          error.code = 'USER_NOT_ACTIVE'
          error.name = 'Recycler ' + Recycler.name + ' was already deleted'
          error.message = 'Recycler ' + Recycler.name + ' is not active'
          cb(error);
        }
      })
    }

    Recycler.remoteMethod('customDelete', {
      accepts: {arg: 'id', type: 'string'},
      return: {arg: 'data', type: 'object'},
      http: {verb: 'DELETE', path: '/:id/customDelete'}
    });


};
