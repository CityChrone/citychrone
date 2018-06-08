
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
var _ = require('lodash');

import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import '/imports/server/methods.js';
import JSZip from 'jszip';
import fs from 'fs';

//import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
//import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';

//import { checkCities } from '/imports/server/startup/scenarioDef.js';
import '/imports/server/router.js';
import {loadCity} from '/imports/server/startup/loadCitiesData.js';

 

Meteor.startup(() => {
  loadCity()
  scenarioDB.rawCollection().createIndex({ "city": 1, 'scores.avgVelocityScore':-1, 'creationDate':-1});
  scenarioDB.rawCollection().createIndex({'scores.avgVelocityScore':-1, 'creationDate':-1});

  Meteor.publish('scenario', function scenarioList(city) {
    let sort = {'scores.avgVelocityScore':-1, 'creationDate':-1};
    let field = {'moments':0, 'P2S2Add': 0, 'S2S2Add':0, 'lines':0};
    console.log("subscribe New scenari0!!", sort, field);
    return scenarioDB.find({'city':city}, {sort:sort, 'fields':field});
  });

  Meteor.publish('scenarioDef', function scenarioList(city, listOfId) {
    return scenarioDB.find({'default':true, 'city' : city}, {sort:{'creationDate':-1}});
  });

  Meteor.publish('scenarioID', function scenarioList(city, _id) {
    return scenarioDB.find({'_id':_id, 'city' : city, 'moments':{'$exists':true}}, {sort:{'creationDate':-1}});
  });

  //console.log('finish publish!!');

  return true;
});

