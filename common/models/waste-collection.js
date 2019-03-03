'use strict';

module.exports = function(Wastecollection) {
  var Model = Wastecollection
  Model.observe('after save', function updateCollectionCount(ctx, next){
    if(ctx.instance){
      Model.findOne({
        where: {
          bucketId : ctx.instance.bucketId
        },
        include: {bucket: 'residence'}
      })
      .then(function(res){
        let response = res.toJSON()
        let countCollection = response.bucket.residence.countCollection
        Model.app.models['Residence'].updateAll(
          {id : response.bucket.residenceId},
          {countCollection: countCollection+1},
          function(err, info){
            if(err) return err
            return info
          }
        )
      }      
    )}
  })
};
