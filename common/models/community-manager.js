'use strict';

module.exports = function(CommunityManager) {
    var oneMonth = 30 * 24 * 60 * 60 * 1000;

    CommunityManager.getResidencesCommunity = function(cb){
        return CommunityManager.find({
            include: {
                relation: 'community',
                scope: {
                    include: {
                        relation: 'residences',
                        scope: {
                            include: {
                                relation: 'buckets',
                                scope: {
                                    include: {
                                        relation: 'wasteCollections',
                                        scope: {
                                            where: {collectedAt: {gt: Date.now() - oneMonth}}
                                        } 
                                    }
                                }
                            } 
                        }
                    }
                }
            }
        })
    };

    CommunityManager.remoteMethod('getResidencesCommunity', {
        accepts: {arg: 'id', type: 'string', description: 'communityManagerId'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/getResidencesCommunity'}
    });
};
