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
                        relation: 'composters',
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
                                                    //fields: ['id', 'date', 'parameter'],
                                                    where: {date: {gt: Date.now() - oneDay}},
                                                    order: 'collectedAt DESC'
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
            //res = res.flat() 
            console.log(res)    
            cb(null, res)          
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
