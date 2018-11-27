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
                                                    order: 'collectedAt DESC',
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

};
