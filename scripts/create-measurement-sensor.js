'use strict'

var debug = require('debug')('loopback:log:scripts:create-measurement-sensor')
var Server = require('../server/server.js')
var utils = require('../lib/utils.js')

let Community = Server.models.Community
let MeasurementSensor = Server.models.MeasurementSensor

Community
    .find({
        include: {composter: {slot: 'sensor'}},
        fields: ['id']
    })
    .then(function(res){
        let response = res.map(item => {return item.toJSON()})
            response.forEach(function(response){
                let sensorId = utils.validId(response.composter.slot.sensor['id'])
                let data = {
                    parameter: "humidity",
                     value: utils.getRandomArbitrary(0.6, 0.9),
                     sensorId: sensorId
                }
                //POST measurementSensor for each sensor
                MeasurementSensor
                    .create(data)
                    .then(function(measurementSensor){
                        debug(measurementSensor)
                        return null
                    })
                    .catch(function(err){
                        debug(err)
                        return null
                    })
            })
    })
    .catch(function(err){
        debug(err)
    })