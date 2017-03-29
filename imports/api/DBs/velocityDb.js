import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {points} from '/imports/api/DBs/stopsAndPointsDB.js';
import {CenterCity} from '/imports/api/parameters.js';
import {cities} from '/imports/api/DBs/citiesDB.js';

import turf from 'turf';

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

export const initVel = function(city) {
	//vel.find({},{fields:{'coor':1,'dTerm':1,'pos':1,'vAvg':1,'_id':0}})
	console.log('start InitVel');
	var vel = [];

	var cityObj = cities.findOne({'city_name': city});
	if (!cityObj || !cityObj.latlng)
		return vel;

	const cityCenter = turf.point([cityObj.latlng[1], cityObj.latlng[0]]);
	let cond = {
		'city': city
	};
	// if (city == 'roma')
	// 	cond.inCity = true;

	//throw new Exception("non rigenerare roma!");

	var totDist = 0;

	points.find(cond, {
		fields: {
			'point': 1,
			'pos': 1,
			'venues': 1
		}
	}).forEach(function(doc, index) {
		var ndoc = {};
		doc.latlng = [doc.point.coordinates[1], doc.point.coordinates[0]];
		ndoc.dTerm = parseInt(turf.distance(cityCenter, doc.point, 'kilometers'));
		totDist += ndoc.dTerm;
		ndoc.coor = [doc.latlng[1], doc.latlng[0]];
		ndoc.pos = doc.pos;
		ndoc.venues = venuesToType(doc.venues || {});
		//ndoc.vAvg = doc.vAvg;
		vel.push(ndoc);
	});
	console.log('end InitVel : ', vel.length, totDist / vel.length);
	return vel;
};
