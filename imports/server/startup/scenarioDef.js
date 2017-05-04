import { Meteor } from 'meteor/meteor';
import JSZip from 'jszip';
import fs from 'fs';
import turf from 'turf';
import math from 'mathjs';
import { EJSON } from 'meteor/ejson';

import { scenarioDB, initScenario, computeScoreNewScenario } from '/imports/api/DBs/scenarioDB.js';

import {points, stops, initPoints, initArrayPop} from '/imports/api/DBs/stopsAndPointsDB.js';
import { initVel } from '/imports/api/DBs/velocityDb.js';
import { connections } from '/imports/api/DBs/connectionsDB.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import { fileDB } from '/imports/api/DBs/fileDB.js';

import { timesOfDay } from '/imports/api/parameters.js'
//import '/public/workers/CSACore.js';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';
import  { dataCitiesDB } from '/imports/api/DBs/dataCitiesDB.js';

var worker = require("/public/workers/CSACore.js");

export let citiesData = {}

const findCities = function(){
	let field = 'city'
	let citiesP = points.rawCollection().distinct(field)
	let citiesS = stops.rawCollection().distinct(field)
	let citiesC = connections.rawCollection().distinct(field)
	let citiesML = metroLines.rawCollection().distinct(field)
	console.log('findCities!!');
	return [citiesP,citiesS, citiesC, citiesML]

};

const findCitiesDef = function(){
	let field = 'city'
	let citiesDef = scenarioDB.rawCollection().distinct(field, {'default':true})
	console.log('findCities!!', citiesDef);
	return [citiesDef]

};


const initPointsVenues = function(listPoints){
	pointsVenues = []
	for (var point_i = 0; point_i < listPoints.length; point_i++) {
		let doc = listPoints[point_i]
		pointsVenues[doc.pos] = doc.venues
	}
	return pointsVenues;
};

const computeDataCity = function(city, computeArrayC = true){
	let startTime = timesOfDay[0];
	let listPoints = initPoints(city);
	let arrayN = initNeighStopAndPoint(city);
	let arrayC = [];
	if(computeArrayC) arrayC = initArrayC(city, startTime, startTime + 3.*3600.);
 	let pointsVenues = initPointsVenues(listPoints);
 	console.log('computeData')
 	let areaHex = turf.area(points.findOne({'city':city}).hex)/ (math.pow(10, 6));
 	let stopsList = stops.find({'city':city}, {fields : {'pos':1, 'point':1, 'city':1}, sort :{'pos':1}}).fetch();
 	let arrayPop = initArrayPop(city)
 	let centerPoint = points.findOne({'city':city});
 	return {
		'arrayN': arrayN, 
		'arrayC': arrayC, 
		'listPoints': listPoints, 
		'pointsVenues': pointsVenues,
		'areaHex' : areaHex,
		'stops' : stopsList,
		'arrayPop': arrayPop,
		'oneHex' : centerPoint.hex
	 };
};

export const computeScenarioDefault = function(city){
	let startTime = timesOfDay[0];
	let results = [];
	let scenario = initScenario(city, 'default', 'citychrone', startTime);
	scenario.default = true;
	
	let dataCity = computeDataCity(city, false)

	let listPoints = dataCity.listPoints;
	let arrayN = dataCity.arrayN;
	let arrayC = initArrayC(city, 0, 27.*3600.);
 	let pointsVenues = dataCity.pointsVenues;
 	let areaHex = dataCity.areaHex;
 	let stopsList = dataCity.stopsList;
 	let arrayPop = dataCity.arrayPop;

 	console.log(areaHex, points.findOne({'city':city}).hex);

 	//console.log(arrayC, arrayN)
 	for(let time_i in timesOfDay){
 		let newVels = [];
 		let newAccess = [];
 		let newPotPop = [];
		let startTime = timesOfDay[time_i];
		for (var point_i = 0; point_i < listPoints.length; point_i++) {
			var point = listPoints[point_i];
			var returned = worker.CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);
			//console.log(point, returned);
			if(point.pos % 2000 == 0) console.log(startTime/3600, returned.newVels, returned.popMean, point.pos)
			newVels.push(returned.newVels);
			newAccess.push(returned.newAccess);
			newPotPop.push(returned.newPotPop);
		}
 
		scenario.moments[startTime.toString()] = scenario.moments[startTime.toString()] || {};

		let moment = scenario.moments[startTime.toString()]
		moment.newVels = newVels;
		moment.newAccess = newAccess;
		moment.newPotPop = newPotPop;

	}


	scenarioDB.remove({'city':city, 'default':true});
	console.log(Object.keys(scenario));
	scenario['arrayPop'] = arrayPop;
	scenario['scores'] = computeScoreNewScenario(scenario, timesOfDay[0].toString());

	scenarioDB.insert(scenario, (e)=>{
		addCityToList(scenario);
	});
	

	return scenario;

} 

export const addCityToList = function(scenarioDef) {
return new Promise( function(resolve, reject ){
		resolve(true);
		console.log("inside PROMISE");
		let city = scenarioDef.city

		citiesData[city] = computeDataCity(city);
		let startTime = Object.keys(scenarioDef.moments)[0];
		let moment = scenarioDef.moments[startTime.toString()];
		let maxVelPoint = {'pos':0, 'newVel':0}
		moment['newVels'].forEach((newVel, index)=>{
			if(newVel > maxVelPoint.newVel) maxVelPoint = {'pos':index, 'newVel':newVel}
		});
		citiesData[city]['centerCity'] = points.findOne({'city':city,'pos':maxVelPoint.pos}).hex.coordinates[0][0];
		citiesData[city]['centerCity'].reverse();
		citiesData[city]['city'] = city;
		console.log('finding', dataCitiesDB.find({'city':city}).count())
		//console.log(city, citiesData[city]['centerCity']);
	});
}

const checkCities = function(){
	let promiseCities = findCitiesDef()

  	console.log('check Cities', promiseCities);

  	scenarioDB.find({'default':true}).forEach(function(scenarioDef, index){
  		let city = scenarioDef.city
  		if(! (city in citiesData)){
			let res = addCityToList(scenarioDef);
			console.log("promise returned", res);
		}
	});
	console.log('citiesData crearted', Object.keys(citiesData))
};
 
Meteor.methods({
	'giveDataBuildScenario' : function(city,data){
		console.log(city, data)
		let toReturn = citiesData[city][data] || [];
		return toReturn;
	},
	'giveListCitiesScenario' : function(){
		let cities = [];
		for(city in citiesData){
			let latlng = citiesData[city]['centerCity'];
			console.log(city, latlng)
			cities.push({'city':city, 'latlng':latlng})
		}
		console.log(cities)
		return cities;
	},

});

export {checkCities, dataCities}

