'use strict';

var debug = require('debug')('loopback:log:models:manager');
var utils = require('../../lib/utils');

module.exports = function(manager) {
    var Model = manager
    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    var threeMonths = 30 * 24 * 60 * 60 * 1000 * 3;
    var sixMonths =  30 * 24 * 60 * 60 * 1000 * 6;

    Model.prototype.__get__community__totalWaste = function(cb) {
        let self = this
        let communityId = utils.validId(self['communityId']) //communityId
        let userId = utils.validId(self['id']) //managerID

        Model.find({
            fields: ['id', 'communityId'],
            where: {
                id: userId
            },
            include: {community: {residences: {bucket: 'wasteCollections'}}}
        })
        .then(function(res){      
            if (!res) {
                let error = new Error()
                error.statusCode = 404
                error.code = 'RESIDENCES_NOT_FOUND'
                error.name = 'Residences with id ' + communityId + ' was not found'
                error.message = 'Community with id ' + communityId + ' was not found'
                cb(error)
            } else {
                let response = res.map(item => {return item.toJSON()})
                var collections = {
                    '0': {'date': '', 'total': 0},
                    '1': {'date': '', 'total': 0},
                    '2': {'date': '', 'total': 0},
                    '3': {'date': '', 'total': 0}
                };
                let residences = response[0].community.residences
                let wasteCollections = []
                residences.forEach(function(residence){
                    let wastes = residence.bucket.wasteCollections
                    try{
                        wasteCollections.push(wastes)
                    }
                    catch(err){
                        console.log('El residente no tiene asociado un balde')
                    } 
                })
                wasteCollections = wasteCollections.flat() //reduce the complexity
                wasteCollections.sortBy(function(o){ return -o.created }); //order by date
                
                collections['0'].date = wasteCollections[0].created // 0 is the most recent collection
                let count = 0 //number of collection
                let date = wasteCollections[0].created.getDate() //get day of collection i.e: 21
                
                for(var i = 0; i<wasteCollections.length; i++){ 
                    let dateAux = wasteCollections[i].created.getDate() 
                    if (dateAux == date){ //sum data of same date collection
                        if(count==0) collections['0'].total += wasteCollections[i].weight
                        else if(count==1) collections['1'].total += wasteCollections[i].weight
                        else if(count==2) collections['2'].total += wasteCollections[i].weight
                        else if(count==3) collections['3'].total += wasteCollections[i].weight
                    }
                    else{
                        date = dateAux //change date collection
                        count += 1
                        if(count==1) {
                            collections['1'].date = wasteCollections[i].created
                            collections['1'].total += wasteCollections[i].weight
                        }
                        else if(count==2){
                            collections['2'].date = wasteCollections[i].created
                            collections['2'].total += wasteCollections[i].weight
                        } 
                        else if(count==3){
                            collections['3'].date = wasteCollections[i].created
                            collections['3'].total += wasteCollections[i].weight
                        } 
                    }
                }
                }
                cb(null, collections)          
            return null
        })
        .catch(function(err){
            cb(err)
            return null
        })
        return cb.promise;
    };

    Model.remoteMethod('prototype.__get__community__totalWaste', {
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'GET', path: '/community/totalWaste'}
    });



    Model.prototype.__get__community__wasteByFloor = function(time, cb) {
        let self = this
        let communityId = utils.validId(self['communityId'])
        let timeAgo = 0;
        if (time == 1 ){
            timeAgo = oneMonth
        } 
        else if (time == 3){
            timeAgo = threeMonths
        } 
        else if (time == 6){
            timeAgo = sixMonths
        } 
        else return cb(null, false)

        Model.app.models['Residence'].find({
            where: {
                communityId: communityId
            },
            order: 'floor ASC',
            include: {
                relation: 'bucket',
                scope: {
                    fields: ['id', 'wasteCollections'],
                    include: {
                        relation: 'wasteCollections',
                        scope: {
                            fields: ['id', 'weight', 'created', 'scaleId'],
                            where: {created: {gt: Date.now() - timeAgo}},
                            order: 'created DESC'
                        } 
                    }
                }
            }
        })
        .then(function(res){
            var jsonObj = [];
            let floorAux = res[0].floor //first floor

            res.forEach(function(residence) { 
                residence = residence.toJSON()
                let floor = residence['floor'] //floor of residence

                if(floor==floorAux) debug('Es el mismo piso...')
                else{ 
                    floorAux = floor //next floor
                }
                var item = {} 
                item ["floor"] = floorAux
                let totalWeight = 0;
                try{
                    var weights = residence['bucket']['wasteCollections'] //registers of wasteCollections 
                    weights.forEach(function(itemWeight){ //register by register
                        let weight = itemWeight['weight']
                        totalWeight += weight
                    })
                    item ["totalWeights"] = totalWeight;
                    jsonObj.push(item);         
                }
                catch(error){
                    console.log('no hay asociación de baldes para el residente')
                }              
            });
            cb(null, jsonObj)
        })
        .catch(function(err) {
            cb(err)
            return null
        })
        return cb.promise
    }

    Model.remoteMethod('prototype.__get__community__wasteByFloor',{
        accepts: {arg: 'time', type: 'number'},
        returns: {arg: 'data', type: 'object', root: true}, 
        http: {verb: 'GET', path: '/community/wasteByFloor/:time'}
    })


    Model.prototype.__get__community__statusComposter = function(cb) {
        let self = this
        let userId = utils.validId(self['id']) //managerID

        Model.find({
            fields: ['id', 'communityId'],
            where: {
                id: userId
            },
            include: {
                relation: 'community',
                scope: {
                    include: {
                        relation: 'composter',
                        scope: {
                            include: {
                                relation: 'slot',
                                scope: {
                                    include: {
                                        relation: 'sensor',
                                        scope: {
                                            include: {
                                                relation: 'measurementsSensor',
                                                scope: {
                                                    order: 'created DESC',
                                                    limit: 12
                                                }                                              
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } 
        })
        .then(function(res){       
            if (!res) {
                let error = new Error()
                error.statusCode = 404
                error.code = 'MANAGER_NOT_FOUND'
                error.name = 'Manager with id ' + userId + ' was not found'
                error.message = 'Manager with id ' + userId + ' was not found'
                cb(error)
            } else {
                let response = res.map(item => {return item.toJSON()})
                var measurementsSensor = response[0].community.composter.slot.sensor.measurementsSensor
                //debug('data: ', measurementsSensor)
            }
            cb(null, measurementsSensor)          
        })
        .catch(function(err){
            cb(err)
            return null
        })
        return cb.promise;
    };

    Model.remoteMethod('prototype.__get__community__statusComposter',{
        returns: {arg: 'data', type: 'object', root: true}, 
        http: {verb: 'GET', path: '/community/statusComposter'}
    })

};
