import { Mongo, NumberInt } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

//import {CenterCity} from '/imports/api/parameters.js';
//import {cities} from '/imports/api/DBs/citiesDB.js';

import turf from 'turf';

const points = new Mongo.Collection('points');
const stops = new Mongo.Collection('stops');


// const vel = new Mongo.Collection('vel');
//
// if(Meteor.isServer){
// 	vel.rawDatabase().ensureIndex('vel', {'point':'2dsphere'});
// 	vel.rawDatabase().ensureIndex('vel', {'dTerm': 1 });
// 	vel.rawDatabase().ensureIndex('vel', {'coor': 1 });
// }

export const venuesByName = {
	"Medical Center": "m",
	"Office": "o",
	"Food": "f",
	"Spiritual Center": "p",
	"Arts & Entertainment": "a",
	"Shop & Service": "s",
	"Nightlife Spot": "n",
	"Government Building": "g",
	"Outdoors & Recreation": "r",
	"Education": "e"
};

export let venuesByType = {};
for (var name in venuesByName)
	venuesByType[venuesByName[name]] = name;

export const venuesToName = function(venues) {
	var nv = {};
	if (!venues)
		return nv;
	for (var n in venues) {
		nv[venuesByType[n]] = venues[n];
	}
	return nv;
};

export const venuesToType = function(venues) {
	var nv = {};
	if (!venues)
		return nv;
	for (var n in venues) {
		nv[venuesByName[n]] = venues[n];
	}
	return nv;
};

const initPoints = function(city) {
	//vel.find({},{fields:{'coor':1,'dTerm':1,'pos':1,'vAvg':1,'_id':0}})
	console.log('start InitPoints');

	var pointsArray = [];

	var totDist = 0;

	points.find({'city':city}, {
		fields: {
			'point': 1,
			'pos': 1,
			'venues': 1,
			'dCenter':1
		},
		sort : {
			'pos' : 1
		}
	}).forEach(function(doc, index) {
		var ndoc = {};
		ndoc.dCenter = doc.dCenter || 0;
		ndoc.coor = doc.point.coordinates;
		ndoc.pos = doc.pos;
		ndoc.pop = doc.pop || {};
		ndoc.venues = venuesToType(doc.venues || {});
		//ndoc.vAvg = doc.vAvg;
		pointsArray.push(ndoc);
	});
	console.log('end InitPoints : ', pointsArray.length);
	return pointsArray;
};

const initArrayPop = function(city) {
	console.log('start InitPop');

	var arrayPop = [];

	points.find({'city':city}, {
		fields: {
			'pop': 1,
			'_id': 1,
		},
		sort : {
			'pos' : 1
		}
	}).forEach(function(doc, index) {
		arrayPop.push(doc.pop);
	});
	//console.log('end arrayPop : ', arrayPop.length);
	return arrayPop;
};



export {points, stops, initPoints, initArrayPop};
