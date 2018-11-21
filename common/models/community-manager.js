'use strict';

module.exports = function(CommunityManager) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;

    CommunityManager.prototype.wasteCommunity = function(cb){
        CommunityManager.find({
            include: {
                relation: 'community',
                scope: {
                    include: {
                        relation: 'residences',
                        scope: {
                            include: {
                                relation: 'bucket',
                                scope: {
                                    include: {
                                        relation: 'wasteCollections',
                                        scope: {
                                            where: {collectedAt: {gt: Date.now() - oneMonth}},
                                            order: 'collectedAt DESC'
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
            var response = res[0].toJSON();
            var residences = response.community.residences;
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
            return null
        })
        .catch(function(err){
            cb(err)
            return null
        })
    };

    CommunityManager.remoteMethod('prototype.wasteCommunity', {
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/wasteCommunity'}
    });
};
