'use strict';
var debug = require('debug')('loopback:log:models:assignment');


module.exports = function(Assignment) {
  const Model = Assignment
  Model.beforeRemote('prototype.patchAttributes', function(context, modelInstance, next){
    // Get Instance from Assignment collection
    let instance = Model.findById(context.req.params.id)
    .then(function(assignment){   
      //Check if instance is a Resident or Recycler
      debug(assignment)
      if(assignment.user_type == "Resident"){
        //Check Buckets availables
        Model.app.models['Bucket'].findOne({
          where: {
            active: false
          }
        })
        .then(function(bucket){
          bucket = bucket.toJSON();

          //TODO: Validar que el residente no tenga buckets asociados 

          Model.app.models['Resident'].updateAll({
            id: assignment.user_id,
            bucket: bucket
          })
        })
      }
      else{
        //findOne non assigned scale
        Model.app.models['Scale'].findOne({
          where: {
            active: false
          }
        })
        .then(async (scale) => {
          //scale = scale.toJSON();

          //TODO: Validar que el reciclador no tenga scales asociados 

          //Update scale instance
          let updateScale = scale.updateAttributes({
            active: true, 
            assigned_at: new Date().toLocaleString(),
            recyclerId: assignment.user_id
          })
          const updatedScale = await updateScale;
          debug(updatedScale);

          //Assign Scale to Recycler
          let recycler = await Model.app.models['Recycler'].findById(assignment.user_id);
          const updateAttr = recycler.updateAttributes({scales: [scale]});
          const updatedRecycler = await updateAttr;
          debug(updatedRecycler);
        })
      }
    })
  })
};
