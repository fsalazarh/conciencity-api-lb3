module.exports = function(app) {

    app.models.Community.find({
          include: [{recyclers: 'scale'},{residences:'bucket'}],
          fields: ['id']
     })
    .then(function(communities){
          let communitiesJson = communities.map(item => {return item.toJSON()})
          communitiesJson.forEach(function(community){
               scaleId = community.recyclers[0].scale['id'] //First recycler 

               /*Loop for residences of community*/
               community.residences.forEach(function(residences){
                    bucketId = residences.bucket['id']
                    /*POST WasteCollection*/
                    app.models.WasteCollection.create({
                         scaleId: scaleId,
                         bucketId: bucketId,
                         weight: (function(){ return Math.floor((Math.random() * 20) + 1);})()
                    })
               })
          });
    })
    .catch(function(err){
         console.log(err)
    }

)};