'use strict';
const to = require('await-to-js').default;

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
                        relation: 'composter',
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
                                                    fields: ['id', 'date', 'parameter', 'value'],
                                                    //where: {date: {gt: Date.now() - oneDay}},
                                                    order: 'date DESC',
                                                    limit: 24
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
            let measurementsJson = res.map(item => {return item.toJSON()})
            let response = []
            measurementsJson.forEach(function(item){
                response.push(item.community.composter.slot.sensor.measurementsSensor)
            })
            response = response.flat()
            console.log(response.length)
            cb(null, response)          
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


    /* Custom delete */
    Recycler.customDelete = function(id, cb){
      Recycler.findById(id, function(err, instance){
        if(err){
          cb(err, null);
          return null;
        }
        const Recycler = instance;
        //Check active of instance
        if(Recycler.active == true){
          Recycler.updateAttributes({'active': false}, function(err, data){
            if(err){
              cb(err, null);
              return null;
            }
            cb(null, data);
          })
        }
        else{
          let error = new Error()
          error.statusCode = 409
          error.code = 'USER_NOT_ACTIVE'
          error.name = 'Recycler ' + Recycler.name + ' was already deleted'
          error.message = 'Recycler ' + Recycler.name + ' is not active'
          cb(error);
        }
      })
    }

    Recycler.remoteMethod('customDelete', {
      accepts: {arg: 'id', type: 'string'},
      return: {arg: 'data', type: 'object'},
      http: {verb: 'DELETE', path: '/:id/customDelete'}
    });


      /* Resolve assignment for recycler */
  Recycler.beforeRemote('prototype.__updateById__assignments', async (ctx, modelInstance, next)=>{
    let scale, err, updatedScale, recyclerScale, assignment, updatedAssignment;
    //Validate that recycler doesn't have Scale
    [err, recyclerScale] = await to(Model.app.models['Scale'].findOne({ where: { recyclerId: ctx.instance.id }}))
    if(recyclerScale) {
      let error = new Error()
      error.statusCode = 409
      error.code = 'ALREADY_HAVE_SCALE'
      error.name = 'recycler already have one scale associated'
      error.message = 'recycler already have one scale associated.'
      return next(error);
    }

    //Find one Scale non active 
    [err, scale] = await to(Model.app.models['Scale'].findOne({where: { active: false } }));
    if(!scale){
      let error = new Error()
      error.statusCode = 409
      error.code = 'NO_SCALES'
      error.name = 'No more scales registered in system'
      error.message = 'There are no more scales registered in the system, please contact to administrator.'
      return next(error);
    } 

    //Activate Scale and assign to recycler
    [err, updatedScale] = await to(scale.updateAttributes({
      recyclerId: ctx.instance.id,
      active: true
    }))
    if(err){
      let error = new Error();
      error.statusCode = 409
      error.code = 'ERROR_UPDATING_SCALE'
      error.name = 'Error updating scale attributes'
      error.message = 'There was an error updating the scale instance.'
      return next(error);
    }
            
    //Find assignment
    [err, assignment] = await to(Model.app.models['Assignment'].findById(ctx.req.params.fk))
    if(assignment.active===true){
      [err, updatedAssignment] = await to(assignment.updateAttributes({
        active: false,
        conciencityId: ctx.req.accessToken.userId,
        resolvedAt: new Date().toLocaleString()
      }))
      if(err){
        let error = new Error();
        error.statusCode = 409
        error.code = 'ERROR_UPDATING_ASSIGNMENT'
        error.name = 'Error updating assignment attributes'
        error.message = 'There was an error updating the assignment instance.'
        return next(error);
      }
      return next();
    }
   })



};
