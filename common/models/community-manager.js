'use strict';

var debug = require('debug')('loopback:log:models:community-manager');
var utils = require('../../lib/utils');

module.exports = function(CommunityManager) {
    var Model = CommunityManager
    var oneMonth = 30 * 24 * 60 * 60 * 1000;

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
};
