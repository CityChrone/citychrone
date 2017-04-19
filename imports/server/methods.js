import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
//import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import {points} from '/imports/api/DBs/stopsAndPointsDB.js';
import {unionHexs} from '/imports/api/CSA-algorithm/isochrone.js';
import {addNewLines} from '/imports/api/CSA-algorithm/addNewLines.js';
import {initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { citiesData } from '/imports/server/startup/scenarioDef.js';
import { maxDuration
} from '/imports/api/parameters.js';
  
let worker = require("/public/workers/CSACore.js");
let mergeArrays = require("/public/workers/mergeArrays.js");

Meteor.methods({
  'metroLines'(city){
    return metroLines.find({'city' : city}).fetch();
  },
  'isochrone'(point, scenarioID, startTime){
      //let point = args[0];
      //let scenarioID = args[1]; 
      //let startTime = args[2];
      console.log('call isochrone!! points', point, scenarioID, startTime);
      var scenario = scenarioDB.findOne({'_id':scenarioID});
      let city = scenario.city;
      if(scenario == [] || !(city in citiesData) ){ 
        console.log('Scenario not found')
        return [];
      } else {
        let cityData = citiesData[city];
        let listPoints = cityData.listPoints;
        let wTime = [startTime , startTime + maxDuration];
        let arrayC2Add = addNewLines(scenario.lines, wTime) || [];
        let arrayC = mergeArrays.mergeSortedC(cityData.arrayC, arrayC2Add);

        let arrayN = cityData.arrayN;

        arrayN.P2SPos = mergeArrays.mergeArrayN(arrayN.P2SPos, scenario.P2S2Add, 'pos');
        arrayN.P2STime = mergeArrays.mergeArrayN(arrayN.P2STime, scenario.P2S2Add, 'time');
        arrayN.S2SPos = mergeArrays.mergeArrayN(arrayN.S2SPos, scenario.S2S2Add, 'pos');
        arrayN.S2STime = mergeArrays.mergeArrayN(arrayN.S2STime, scenario.S2S2Add, 'time');

        let pointsVenues = cityData.pointsVenues;
        let areaHex = cityData.areaHex;
        let arrayPop = cityData.arrayPop;
        console.log('arrayC, arrayN', arrayC.length, Object.keys(arrayN))
        //let startTime = timesOfDay[time_i];
        let returned = worker.CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);


      return returned.tPoint;
    }
  },
  'connections'(city){
    return initArrayC(city, 7*3600, 10.*3600.);
  }
});
