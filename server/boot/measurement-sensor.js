var utils = require('../../lib/utils');

module.exports = function(app) {
    setInterval(function(){
        app.models.Community.find({
            include: {composter: {slot: 'sensor'}}
        })
        .then(function(res){
            let response = res.map(item => {return item.toJSON()})
            //console.log('sensors: ', response)
            response.forEach(function(response){
                let sensorId = response.composter.slot.sensor['id']
                //POST measurementSensor for each sensor
                app.models.MeasurementSensor.create({
                    parameter: "humidity",
                    value: utils.getRandomArbitrary(0.6, 0.9),
                    sensorId: sensorId
                })
            })
        })
        .catch(function(err){
            console.log(err)
        })
    }, 3600000);
};