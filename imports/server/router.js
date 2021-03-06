import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

//import { initVel } from '/imports/DBs/velocityDb.js';
import {timesOfDay, maxDuration} from '/imports/parameters.js';
import JSZip from 'jszip';
import fs from 'fs';

import { computeScenarioDefault, addCityToList, checkCities, computeDataCity, computeOnlyScenarioDefault } from '/imports/server/startup/scenarioDef.js';
import { scenarioDB, initScenario } from '/imports/DBs/scenarioDB.js';
import {loadCity, citiesData} from '/imports/server/startup/loadCitiesData.js';


Router.route('/addCity/:city', function () {
	let city = this.params.city
	console.log('Adding ... ', city);
 	this.response.end('Adding ... ' + city);
	let scenarioDef = computeScenarioDefault(city);
}, {where: 'server'});
 
 
Router.route('/reloadCities', function () {
  loadCity();
}, {where: 'server'});
