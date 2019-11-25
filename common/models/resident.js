'use strict';
var debug = require('debug')('loopback:log:models:Resident');

module.exports = function(Resident) {
    /* Function that return the last 4 wasteCollections for user logged-in */
    Resident.__get__lastFourWasteCollection = function(id, cb){
        return Resident.find({
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
                            fields: ['id', 'weight', 'created', 'scaleId'],
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

    Resident.remoteMethod('__get__lastFourWasteCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/lastFourWasteCollection'}
    });

    /*Function that return the date of collection of his Community*/
    Resident.__get__dateCollection = function(id, cb){
        Resident.find({
            fields: ['communityId'],
            where: {
                id: id
            },
            include: {
                relation: 'community',
                scope: {
                    fields: ['name', 'dateCollection']
                }
            }
        })
        .then(function(res){
            if(!res){
                console.log('No hay resultados')
                cb(null, false)
            }
            else {
                let response = res.map(item => {return item.toJSON()})
                let date = {
                    "community": response[0]['community']['name'],
                    "dateCollection": response[0]['community']['dateCollection']
                }
                cb(null, date)
            }
        })
    };

    Resident.remoteMethod('__get__dateCollection', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'data', type: 'object'},
        http: {verb: 'GET', path: '/:id/dateCollection'}
    });


    /* Custom delete */
    Resident.customDelete = function(id, cb){
      Resident.findById(id, function(err, instance){
        if(err){
          cb(err);
          return null;
        }
        const resident = instance;
        //Check active of instance
        if(resident.active == 'true'){
          resident.updateAttributes({'active': false}, function(err, data){
            if(err){
              cb(err);
              return null;
            }
            cb(data);
          })
        }
        else{
          let error = new Error()
          error.statusCode = 409
          error.code = 'USER_NOT_ACTIVE'
          error.name = 'Resident ' + resident.name + ' was already deleted'
          error.message = 'Resident ' + resident.name + ' is not active'
          cb(error);
        }
      })
    }

    Resident.remoteMethod('customDelete', {
      accepts: {arg: 'id', type: 'string'},
      return: {arg: 'data', type: 'object'},
      http: {verb: 'DELETE', path: '/:id/customDelete'}
    });

    //Disable Remote Methods 
    Resident.disableRemoteMethodByName('findOne');
};
