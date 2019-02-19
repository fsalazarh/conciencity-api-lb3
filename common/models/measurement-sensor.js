'use strict';

module.exports = function(Measurementsensor) {
    var Model = Measurementsensor

    Model.beforeRemote('create', function(context, modelInstance, next) {
        if(context.args.data.parameter == "humidity")
            //Case 1: Extra Humidity
            if(context.args.data.value > 0.8){
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
            //Case 1: Less Humidity
            else if(context.args.data.value < 0.6){
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
                            {
                                date: new Date(),
                                recyclerId: recyclersId[0],
                                code: 1,
                                description: 'Humedad demasiado baja',
                                solve: false                           
                            }
                        )
                    })
                    .catch(function(err){
                        return err
                    })
                })
            }
        next();
    });
};
