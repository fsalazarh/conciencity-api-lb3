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
                    '0': {'date': '', 'total': 0},
                    '1': {'date': '', 'total': 0},
                    '2': {'date': '', 'total': 0},
                    '3': {'date': '', 'total': 0}
                };
                let wasteCollections = []
                residences.forEach(function(register){
                    wasteCollections.push(register['bucket']['wasteCollections'])
                })
                wasteCollections = wasteCollections.flat() //reduce the complexity
                wasteCollections.sortBy(function(o){ return -o.collectedAt }); //order by date
                console.log('array', wasteCollections)

                collections['0'].date = wasteCollections[0].collectedAt 
                let count = 0 //number of collection
                let date = wasteCollections[0].collectedAt.getDate()
                for(var i = 0; i<wasteCollections.length; i++){
                    let dateAux = wasteCollections[i].collectedAt.getDate()
                    if (dateAux == date){
                        if(count==0) collections['0'].total += wasteCollections[i].weight
                        else if(count==1) collections['1'].total += wasteCollections[i].weight
                        else if(count==2) collections['2'].total += wasteCollections[i].weight
                        else if(count==3) collections['3'].total += wasteCollections[i].weight
                    }
                    else{
                        date = dateAux
                        count += 1
                        if(count==1) {
                            collections['1'].date = wasteCollections[i].collectedAt
                            collections['1'].total += wasteCollections[i].weight
                        }
                        else if(count==2){
                            collections['2'].date = wasteCollections[i].collectedAt
                            collections['2'].total += wasteCollections[i].weight
                        } 
                        else if(count==3){
                            collections['3'].date = wasteCollections[i].collectedAt
                            collections['3'].total += wasteCollections[i].weight
                        } 
                    }
                }
                
                }
                cb(null, collections)
            
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
                            fields: ['id', 'weight', 'collectedAt', 'recyclerId'],
                            where: {collectedAt: {gt: Date.now() - timeAgo}},
                            order: 'collectedAt DESC',
                            include: {
                                relation : 'recycler'
                            }
                        } 
                    }
                }
            }
        })
        .then(function(res){
            var jsonObj = [];
            let resJson = res[0].toJSON()
            let recyclerName = resJson['bucket']['wasteCollections'][0]['recycler']['name']

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
            let item = {}
            item ["recycler"] = recyclerName;
            jsonObj.push(item); //add recyclerName
            
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
