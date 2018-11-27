'use strict';

module.exports = function(Residence) {

    /* Function that return the last 4 wasteCollections for user logged-in */
    Residence.getLastWasteCollection = function(id, cb){
        return Residence.find({
            where: {
                id: id
            },
            include:{
                relation: 'bucket',
                scope: {
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            limit: '4',
                            include: {
                                relation: 'scale',
                                scope: {
                                    relation: 'recycler'
                                }
                            }
                        }
                    }
                }
            }
        })
    };

    Residence.remoteMethod('getLastWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/getLastWasteCollection'}
    });

    /*Function that return the date of collection of his Community*/
    Residence.getDateCollection = function(id, cb){
        return Residence.find({
            where: {
                id: id
            },
            fields: {
                floor : false,
                number : false,
                rut : false,
                name : false,
                username : false,
                email : false,
                id : false
            },
            include: {
                relation: 'community'
            }
        })
    };

    Residence.remoteMethod('getDateCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'dateCollection', type: 'object'},
        http: {verb: 'GET', path: '/:id/getDateCollection'}
    });
};
