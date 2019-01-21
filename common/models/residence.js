'use strict';

module.exports = function(Residence) {

    /* Function that return the last 4 wasteCollections for user logged-in */
    Residence.lastWasteCollection = function(id, cb){
        return Residence.find({
            where: {
                id: id
            },
            fields: ['id', 'name', 'bucketId'],
            include:{
                relation: 'bucket',
                scope: {
                    fields: ['id', 'wasteCollections'],
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            fields: ['id', 'weight', 'collectedAt', 'scaleId'],
                            limit: '4',
                            include: {
                                relation: 'scale',
                                scope: {
                                    fields: ['recyclerId'],
                                    include: {
                                        relation: 'recycler',
                                        scope: {
                                            fields: ['name']
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

    Residence.remoteMethod('lastWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/lastWasteCollection'}
    });

    /*Function that return the date of collection of his Community*/
    Residence.dateCollection = function(id, cb){
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

    Residence.remoteMethod('dateCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'dateCollection', type: 'object'},
        http: {verb: 'GET', path: '/:id/dateCollection'}
    });
};
