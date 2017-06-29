import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

import { initVel } from '/imports/api/DBs/velocityDb.js';
import {timesOfDay, maxDuration} from '/imports/api/parameters.js';
import JSZip from 'jszip';
import fs from 'fs';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';
import { computeScenarioDefault, addCityToList, checkCities, computeDataCity } from '/imports/server/startup/scenarioDef.js';
import { scenarioDB, initScenario } from '/imports/api/DBs/scenarioDB.js';

Router.route('/computeScenarioDef/:city', function () {
	let city = this.params.city
	console.log('COMPUTE SCENARIO default of', city);
 	this.response.end('computing default scenario of ' + city);
	let scenarioDef = computeScenarioDefault(city);
}, {where: 'server'});

Router.route('/addCity/:city', function () {
	let city = this.params.city
	console.log('Adding ... ', city);
 	this.response.end('Adding ... ' + city);
	let scenarioDef = computeScenarioDefault(city);
}, {where: 'server'});
 
Router.route('/createZip/:city', function () {
	let city = this.params.city
	let cityData = computeDataCity(city);
	let scenarioDef = scenarioDB.findOne({'city':city, 'default':true});
	console.log('Adding Zip... ', city);
 	this.response.end('Adding Zip... ' + city);
	addCityToList(scenarioDef, cityData);
}, {where: 'server'});

 
Router.route('/reloadCities', function () {
  checkCities();

}, {where: 'server'});

Router.route('/reloadCity/:city', function () {
	let city = this.params.city
	let scenario = scenarioDB.findOne({'city':city, 'default':true});
	addCityToList(scenario);
}, {where: 'server'});

