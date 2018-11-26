'use strict';

var debug = require('debug')('loopback:log:models:community-manager');
var utils = require('../../lib/utils');

module.exports = function(CommunityManager) {
    var Model = CommunityManager
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    var threeMonths = 30 * 24 * 60 * 60 * 1000 * 3;
    var sixMonths =  30 * 24 * 60 * 60 * 1000 * 6;

    Model.prototype.__get__community__residences__totalWaste = function(cb) {
        let self = this
        let communityId = utils.validId(self['communityId'])
        Model.app.models['Residence'].find({
            fields: ['id', 'bucket'],
            where: {
                communityId: communityId
            },
            include: {
                relation: 'bucket',
                scope: {
                    fields: ['id', 'wasteCollections'],
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            fields: ['id', 'weight', 'collectedAt'],
                            where: {collectedAt: {gt: Date.now() - oneMonth}},
                            order: 'collectedAt DESC'
                        } 
                    }
                }
            }
        })
        .then(function(res){
            if (!res) {
                let error = new Error()
                error.statusCode = 404
                error.code = 'RESIDENCES_NOT_FOUND'
                error.name = 'Residences djhsgahjdjhaghjdghjaghjdghjaghjdghja with id ' + communityId + ' was not found'
                error.message = 'Community with id ' + communityId + ' was not found'
                cb(error)
            } else {
                let residences = res.map(item => {return item.toJSON()})
                var collections = {
                    '1': {'date': '', 'total': 0},
                    '2': {'date': '', 'total': 0},
                    '3': {'date': '', 'total': 0},
                    '4': {'date': '', 'total': 0}
                };
                console.log(res)
                for (var i=0; i<residences.length; i++){
                    var wasteCollections = residences[i].bucket.wasteCollections;
                    var auxDay = wasteCollections[0].collectedAt.getDate();
                    collections['1'].date = wasteCollections[0].collectedAt
                    var count = 0; //number of collection

                    for (var j=0; j<wasteCollections.length; j++){
                        let day = wasteCollections[j].collectedAt.getDate();
                        if(day == auxDay){
                            if(count==0) collections['1'].total+= wasteCollections[j].weight
                            else if(count==1) collections['2'].total+= wasteCollections[j].weight
                            else if(count==2) collections['3'].total+= wasteCollections[j].weight
                            else if(count==3) collections['4'].total+= wasteCollections[j].weight
                        }
                        else{
                            auxDay = wasteCollections[j].collectedAt.getDate();
                            console.log('new auxDay = ', auxDay)
                            count+=1;
                            if(count==0) collections['1'].total+= wasteCollections[j].weight
                            else if(count==1){
                                collections['2'].date = wasteCollections[j].collectedAt 
                                collections['2'].total+= wasteCollections[j].weight
                            }
                            else if(count==2){
                                collections['3'].date = wasteCollections[j].collectedAt 
                                collections['3'].total+= wasteCollections[j].weight
                            }
                            else if(count==3) {
                                collections['4'].date = wasteCollections[j].collectedAt 
                                collections['4'].total+= wasteCollections[j].weight
                            }
                        }
                    }
                }
                cb(null, collections)
            }
            return null
        })
        .catch(function(err){
            cb(err)
            return null
        })
        return cb.promise;
    };

    Model.remoteMethod('prototype.__get__community__residences__totalWaste', {
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'GET', path: '/community/residences/totalWaste'}
    });



    Model.prototype.__get__community__residences__wasteByFloor = function(time, cb) {
        let self = this
        let communityId = utils.validId(self['communityId'])
        let timeAgo = 0;
        if (time == 1 ){
            timeAgo = oneMonth
        } 
        else if (time == 3){
            timeAgo = threeMonths
        } 
        else if (time == 6){
            timeAgo = sixMonths
        } 
        else return cb(null, false)

        Model.app.models['Residence'].find({
            fields: ['id', 'bucket', 'floor'],
            where: {
                communityId: communityId
            },
            order: 'floor ASC',
            include: {
                relation: 'bucket',
                scope: {
                    fields: ['id', 'wasteCollections'],
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            fields: ['id', 'weight', 'collectedAt'],
                            where: {collectedAt: {gt: Date.now() - timeAgo}},
                            order: 'collectedAt DESC'
                        } 
                    }
                }
            }
        })
        .then(function(res){
            var jsonObj = [];
            res.forEach(function(item) { 
                let totalWeight = 0;
                item = item.toJSON()
                var floor = item['floor']
                var weights = item['bucket']['wasteCollections'] //registros
                weights.forEach(function(itemWeight){
                    var weight = itemWeight['weight']
                    totalWeight += weight
                })
                var item = {}
                item ["floor"] = floor;
                item ["totalWeights"] = totalWeight;
            
                jsonObj.push(item);
            });
            
            cb(null, jsonObj)
        })
        .catch(function(err) {
            cb(err)
            return null
        })
        return cb.promise
    }

    Model.remoteMethod('prototype.__get__community__residences__wasteByFloor',{
        accepts: {arg: 'time', type: 'number'},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'GET', path: '/community/residences/wasteByFloor/:time'}
    })
};
