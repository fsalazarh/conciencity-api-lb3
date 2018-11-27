'use strict';

module.exports = function(Measurementsensor) {
    var Model = Measurementsensor
    Model.beforeRemote('create', function(context, modelInstance, next) {
        context.args.data.date = new Date();
        context.args.data.sensorId = "5bfc1032c552a65208aedd82"
        next();
    });
};
