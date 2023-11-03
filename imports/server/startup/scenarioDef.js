import { Meteor } from 'meteor/meteor';
import JSZip from 'jszip';
import fs from 'fs';
import turf from 'turf';
import math from 'mathjs';
import { EJSON } from 'meteor/ejson';

import { scenarioDB, initScenario, computeScoreNewScenario } from '/imports/DBs/scenarioDB.js';

import { timesOfDay, maxDuration } from '/imports/parameters.js'

import { loadCity, citiesData } from '/imports/server/startup/loadCitiesData.js';

import { cutArrayC } from '/imports/lib/utils.js';


process.on('unhandledRejection', console.log.bind(console))

var worker = require("/public/workers/ICSACore.js");

var _ = require('lodash');

var avgEmAll = function (arrays) {
	result = []
	for (var i = 0; i < arrays[0].length; i++) {
		var num = 0;
		//still assuming all arrays have the same amount of numbers
		for (var i2 = 0; i2 < arrays.length; i2++) {
			num += arrays[i2][i];
		}
		result.push(num / arrays.length);
	}

	return result
}


export const computeScenario = function (city, dataCity, startTimes = timesOfDay) {
	Meteor.setTimeout(() => {
		let listPoints = dataCity.listPoints;
		let arrayN = dataCity.arrayN;

		let areaHex = dataCity.areaHex;
		let stopsList = dataCity.stopsList;
		let arrayPop = dataCity.arrayPop;

		let results = [];
		let scenario = initScenario(city, 'default', 'citychrone', startTimes);
		scenario.default = true;

		//console.log(arrayN)
		let perLim = 5;
		for (let time_i in startTimes) {
			let percentage = 0
			let velocityScore = [];
			let socialityScore = [];
			let startTime = startTimes[time_i];
			let arrayC = cutArrayC(startTime, dataCity.arrayC);
			for (var point_i = 0; point_i < listPoints.length; point_i++) {
				var point = listPoints[point_i];
				var returned = worker.ICSAPoint(point, arrayC, arrayN, startTime, areaHex, arrayPop);
				//console.log(point.pos , listPoints.length ,percentage);
				if (100. * point.pos / listPoints.length > percentage) {
					console.log(city, startTime / 3600, returned.velocityScore, returned.socialityScore, (parseInt(100. * point.pos / listPoints.length)).toString() + "%")
					percentage += perLim
				}
				velocityScore.push(returned.velocityScore);
				socialityScore.push(returned.socialityScore);
			}


			scenario.moments[startTime.toString()] = scenario.moments[startTime.toString()] || {};

			let moment = scenario.moments[startTime.toString()]
			moment.velocityScore = velocityScore;
			moment.socialityScore = socialityScore;

		}


		let velocities = [];
		let socialities = [];
		for (let time in scenario.moments) {
			console.log(time)
			if (scenario.moments[time]['velocityScore'].length > 0) {
				velocities.push(scenario.moments[time]['velocityScore']);
				socialities.push(scenario.moments[time]['socialityScore']);
			}
		}

		console.log(velocities.length, "after", Object.keys(scenario.moments))
		scenario.moments["avg"] = {};
		scenario.moments["avg"].velocityScore = avgEmAll(velocities);
		scenario.moments["avg"].socialityScore = avgEmAll(socialities);

		//console.log(velocities)

		scenarioDB.remove({ 'city': city, 'default': true });
		scenario['arrayPop'] = arrayPop;
		scenario['scores'] = computeScoreNewScenario(scenario, startTimes[0].toString());

		scenarioDB.insert(scenario);

		//return scenario;
	}, 0.2);

}

export const computeScenarioDefault = function (city) {
	let dataCity = citiesData[city];
	let scenario = computeScenario(city, dataCity);
	return scenario;

}


export const addCityToList = function (scenarioDef, dataCity) {
	return new Promise(function (resolve, reject) {
		console.log("inside PROMISE");
		let city = scenarioDef.city
		citiesData[city] = dataCity;
	});
}

