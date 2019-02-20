'use strict'

var debug = require('debug')('loopback:log:scripts:create-waste-collections')
var Server = require('../server/server.js')
var utils = require('../lib/utils.js')

let Community = Server.models.Community
let WasteCollection = Server.models.WasteCollection

Community
	.find({
		include: [{recyclers: 'scale'},{residences:'bucket'}],
			fields: ['id']
 	})
	.then(function(communities){
		let communitiesJson = communities.map(item => {return item.toJSON()})

		communitiesJson.forEach(function(community){
			let scaleId = utils.validId(community.recyclers[0].scale['id']) //First recycler

			//Loop for residences of community
			community.residences.forEach(function(residences){
				let bucketId = utils.validId(residences.bucket['id'])
				let data = {
					scaleId: scaleId,
					bucketId: bucketId,
					weight: (function(){ return Math.floor((Math.random() * 20) + 1);})()
				}
				debug(data)
				WasteCollection
					.create(data)
					.then(function(wasteCollection) {
						debug(wasteCollection)
						return null
					})
					.catch(function(err) {
						debug(err)
						return null
					})
			})
		})
	})
	.catch(function(err) {
		debug(err)
	})		