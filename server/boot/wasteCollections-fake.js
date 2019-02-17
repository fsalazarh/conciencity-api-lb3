module.exports = function(app) {

    app.models.Community.find({
          include: {
               relation: 'recyclers',
               scope: {
                    include: {
                         relation: 'scale'
                    }
               }
          }
     })
    .then(function(communities){
          let communitiesJson = communities.map(item => {return item.toJSON()})
          console.log(communitiesJson)
    })
    .catch(function(err){
         console.log(err)
    }

)};