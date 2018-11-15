'use strict';

module.exports = function(Residence) {

    /* Function that return the last 4 wasteCollections for user logged-in */
    Residence.getLastWasteCollection = function(id, cb){
        return Residence.find({
            where: {
                id: id
            },
            include:{
                relation: 'buckets',
                scope: {
                    where: {residenceId: id},
                        scope: {
                            limit: '4',
                            include: {
                                relation: 'recycler'
                            }
                        }
                    }
                }
            }
        })
    };

    Residence.remoteMethod('getLastWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'string'},
        http: {verb: 'GET', path: '/:id/getLastWasteCollection'}
    });
  };
