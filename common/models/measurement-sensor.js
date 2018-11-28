'use strict';

module.exports = function(Measurementsensor) {
    var Model = Measurementsensor

    Model.beforeRemote('create', function(context, modelInstance, next) {
        context.args.data.date = new Date();
        context.args.data.sensorId = "5bfc1032c552a65208aedd82"

        //Case 1: Extra Humidity
        if(context.args.data.parameter == "humidity")
            if(context.args.data.value > 0.7){
                Model.app.models['Sensor'].findById(context.args.data.sensorId, {
                    include: {
                        relation: 'slot',
                        scope: {
                            include: {
                                relation: 'composter'
                            }
                        }
                    }                  
                })
                .then(function(response) {
                    response = response.toJSON()
                    let communityId = response.slot.composter.communityId
                    Model.app.models['RecyclerCommunity'].find({
                        where: {
                            communityId: communityId
                        }
                    })
                    .then(function(response){
                        let recyclersId = []
                        response.forEach(function(item){
                            recyclersId.push(item.recyclerId)
                        })
                        Model.app.models['Notification'].create(
                            [
                                {
                                    date: new Date(),
                                    recyclerId: recyclersId[0],
                                    code: 2,
                                    description: 'Humedad demasiado alta',
                                    solve: false                           
                                },
                                {
                                    date: new Date(),
                                    recyclerId: recyclersId[1],
                                    code: 2,
                                    description: 'Humedad demasiado alta',
                                    solve: false                           
                                }
                            ]
                        )
                    })
                    .catch(function(err){
                        return err
                    })
                })
            }
        //next();
    });

};
