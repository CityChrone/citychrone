import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

import { initVel } from '/imports/api/DBs/velocityDb.js';
import {timesOfDay, maxDuration} from '/imports/api/parameters.js';
import JSZip from 'jszip';
import fs from 'fs';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';
import { computeScenarioDefault, addCityToList, checkCities } from '/imports/server/startup/scenarioDef.js';

Router.route('/computeScenarioDef/:city', function () {
	let city = this.params.city
	console.log('COMPUTE SCENARIO default of', city);
 	this.response.end('computing default scenario of ' + city);
	let scenarioDef = computeScenarioDefault(city);

	//console.log('computedScenario def', city);
	//addCityToList(scenarioDef);
	//console.log('added to list city def', city);
 	//this.response.end('default scenarion computed of ' + city);
	//this.response.end('Zip per ' + this.params.city + ' esportati!');

}, {where: 'server'});

Router.route('/reloadCities', function () {
  checkCities();

}, {where: 'server'});

