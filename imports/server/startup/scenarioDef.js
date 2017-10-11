import { Meteor } from 'meteor/meteor';
import JSZip from 'jszip';
import fs from 'fs';
import turf from 'turf';
import math from 'mathjs';
import { EJSON } from 'meteor/ejson';

import { scenarioDB, initScenario, computeScoreNewScenario } from '/imports/api/DBs/scenarioDB.js';

import { timesOfDay, maxDuration } from '/imports/api/parameters.js'

import {loadCity, citiesData} from '/imports/server/loadCitiesData.js';

process.on('unhandledRejection', console.log.bind(console))

var worker = require("/public/workers/ICSACore.js");

export const cutArrayC = function(startTime, arrayC){
	let endTime = startTime + 4*3600.;
	let indexLim = 0;
	console.log(indexLim)
	for(indexLim = 2; indexLim < arrayC.length; indexLim+=4){
			if(arrayC[indexLim] > endTime) break;
	}
	console.log(indexLim)
	arrayCCut = _.slice(arrayC, 0, indexLim+2);
	console.log("cutted array!!", arrayC.length, arrayCCut.length)
	return arrayCCut;
};

export const computeScenario = function(city, dataCity,startTime = timesOfDay[0]){
	
	let listPoints = dataCity.listPoints;
	let arrayN = dataCity.arrayN;

	let arrayC = cutArrayC(startTime, dataCity.arrayC);
 	let areaHex = dataCity.areaHex;
 	let stopsList = dataCity.stopsList;
 	let arrayPop = dataCity.arrayPop;

	let results = [];
	let scenario = initScenario(city, 'default', 'citychrone', startTime);
	scenario.default = true;
	
 	//console.log(arrayN)
 	for(let time_i in timesOfDay){
 		let velocityScore = [];
 		let socialityScore = [];
		let startTime = timesOfDay[time_i];
		for (var point_i = 0; point_i < listPoints.length; point_i++) {
			var point = listPoints[point_i];
			var returned = worker.ICSAPoint(point, arrayC, arrayN, startTime, areaHex, arrayPop);
			//console.log(point, returned);
			if(point.pos % 1000 == 0) console.log(startTime/3600, returned.velocityScore, returned.socialityScore, point.pos)
			velocityScore.push(returned.velocityScore);
			socialityScore.push(returned.socialityScore);
		}
 
		scenario.moments[startTime.toString()] = scenario.moments[startTime.toString()] || {};

		let moment = scenario.moments[startTime.toString()]
		moment.velocityScore = velocityScore;
		moment.socialityScore = socialityScore;

	}


	scenarioDB.remove({'city':city, 'default':true});
	scenario['arrayPop'] = arrayPop;
	scenario['scores'] = computeScoreNewScenario(scenario, timesOfDay[0].toString());

	scenarioDB.insert(scenario);
	
	return scenario;

} 

export const computeScenarioDefault = function(city){
	let dataCity = citiesData[city];
	let scenario = computeScenario(city, dataCity, false);
	return scenario;

} 


export const addCityToList = function(scenarioDef, dataCity) {
return new Promise( function(resolve, reject ){
		console.log("inside PROMISE");
		let city = scenarioDef.city
		citiesData[city] = dataCity;
	});
}

