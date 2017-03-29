import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
// import { Session } from 'meteor/session'

//import { ranking } from '/imports/api/DBs/rankDB.js';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import {points, stops} from '/imports/api/DBs/stopsAndPointsDB.js';
import { initVel } from '/imports/api/DBs/velocityDb.js';
import { connections } from '/imports/api/DBs/connectionsDB.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import { fileDB } from '/imports/api/DBs/fileDB.js';

import '/imports/server/methods.js';
// import { runCSA, runCSA2 } from '/imports/api/CSA-algorithm/CSA-loop.js';
import {timesOfDay, maxDuration} from '/imports/api/parameters.js';
import JSZip from 'jszip';
import fs from 'fs';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';

import { checkCities } from '/imports/server/startup/scenarioDef.js';

var _;


Meteor.startup(() => {
  // console.log(JSZip, fs);
  _ = lodash;
  checkCities();

  Meteor.publish('scenario', function scenarioList(city) {

    //console.log('scenario published ' + city);
    let res = scenarioDB.findOne({'default':true, 'city' : city}, {sort:{'creationDate':-1}, reactive: false, field:{'moments':0}} );

    return scenarioDB.find({'city':city}, {field:{'moments':0, 'P2S2Add': 0, 'S2S2Add':0, 'lines':0}});
  });

  Meteor.publish('scenarioDef', function scenarioList(city) {

    //console.log('scenario published ' + city);

    return scenarioDB.find({'default':true, 'city' : city}, {sort:{'creationDate':-1}});
  });

  Meteor.publish('scenarioID', function scenarioList(city, _id) {

    //console.log('scenario published ' + city);

    return scenarioDB.find({'_id':id, 'city' : city}, {sort:{'creationDate':-1}});
  });



  Meteor.publish('points', function returnPoints(city) {
  	let findPoint = points.find({'city':city}, {fields : {'pos':1, 'point':1}, sort :{'pos':1}});
  	console.log('points published ' + city, findPoint.count());
  	return findPoint;
  });

  Meteor.publish('stops', function returnPoints(city) {
    let findStops = stops.find({'city':city}, {fields : {'pos':1, 'point':1, 'city':1}, sort :{'pos':1}});
    console.log('stops published ' + city, findStops.count());
    return findStops;
  });

  Meteor.publish('metroLines', function returnPoints(city) {
    let MetroLinesFetched = metroLines.find({city:city},{sort :{'indexLine' : 1, 'name' : 1, 'lineName':1}});
    console.log('metroLines published ' + city, MetroLinesFetched.count());
    return MetroLinesFetched;
  });
  //
  // Meteor.publish('vel', function returnVel() {
  // 	return vel.find({}, {sort :{'dTerm':1}});
  // });



});
