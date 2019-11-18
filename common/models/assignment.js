'use strict';
var debug = require('debug')('loopback:log:models:assignment');


module.exports = function(Assignment) {
  const Model = Assignment

  Model.beforeRemote('create', function(context, modelInstance, next){

    // Add fields to instance
    context.args.data["principalType"] = context.args.options.accessToken.principalType;

    next();
  });


  Model.beforeRemote('prototype.patchAttributes', function(context, modelInstance, next){
    // Get Instance from Assignment collection
    let assignment = Model.findById(context.req.params.id)
    .then(function(assignment){
      //Check if instance is a Resident or Recycler
      debug(assignment)
      if(assignment.principalType == "Resident"){
        //Check Buckets availables
        Model.app.models['Bucket'].findOne({where: { active: false } })
        .then(async (bucket) => {
          if(bucket){
            let resident = await Model.app.models['Resident'].findById(assignment.userId);
            if (typeof resident.Buckets === "undefined" || resident.Buckets.length === 0){
              //Update bucket instance
              let updatedBucket = await bucket.updateAttributes({
                active: true, 
                assigned_at: new Date().toLocaleString(),
                residentId: assignment.userId
              })
              debug(updatedBucket);
  
              //Assign bucket to resident
              const updatedResident = await resident.updateAttributes({buckets: [bucket]});
              debug(updatedResident);
  
              //Update fields of Assignment instance
              context.req.params["active"] = false;
              context.req.params["resolved_at"] = new Date().toLocaleString();
              context.req.params["conciencity_id"] = context.args.options.accessToken.userId;
  
              next();
            }
            else{
              let error = new Error()
              error.statusCode = 403
              error.code = 'BUCKET_ALREADY'
              error.name = 'Resident with id ' + assignment.userId + ' already has Bucket associated'
              error.message = 'Resident with id ' + assignment.userId + ' already has Bucket associated'
              next(error);
            }
            return null;
          }
          else{
            let error = new Error()
            error.statusCode = 403
            error.code = 'NO_AVAILABLE_BUCKETS'
            error.name = 'No more buckets available in system, please contact to administrator'
            error.message = 'No more buckets available in system, please contact to administrator'
            next(error);
            return null;
          }
        })
        .catch((err) => {
          next(err);
          return null;
        })
      }
      // else{
      //   //findOne non assigned scale
      //   Model.app.models['Scale'].findOne({ where: { active: false } })
      //   .then(async (scale) => {
      //     //scale = scale.toJSON();

      //     //TODO: Validar que el reciclador no tenga scales asociados 

      //     //Update scale instance
      //     let updateScale = scale.updateAttributes({
      //       active: true, 
      //       assigned_at: new Date().toLocaleString(),
      //       recyclerId: assignment.userId
      //     })
      //     const updatedScale = await updateScale;
      //     debug(updatedScale);

      //     //Assign Scale to Recycler
      //     let recycler = await Model.app.models['Recycler'].findById(assignment.userId);
      //     const updateAttr = recycler.updateAttributes({scales: [scale]});
      //     const updatedRecycler = await updateAttr;
      //     debug(updatedRecycler);
      //   })
      // }
      return null;
    })
    .catch((err)=>{
      next(err);
      return null;
    })
    return next.promise;
  })
};
