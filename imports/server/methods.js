import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
//import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import {points} from '/imports/api/DBs/stopsAndPointsDB.js';
import {unionHexs} from '/imports/api/CSA-algorithm/isochrone.js';
import {addNewLines} from '/imports/api/CSA-algorithm/addNewLines.js';
import {initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { citiesData } from '/imports/server/saveScenarioData.js';
import { maxDuration
} from '/imports/api/parameters.js';
  
let worker = require("/public/workers/CSACore.js");
let mergeArrays = require("/public/workers/mergeArrays.js");

Meteor.methods({
  'metroLinesDefault'(city){
    return metroLines.findOne({'city' : city});
  },
    'budget'(city){
    return metroLines.findOne({'city' : city}, {fields:{'budget':1}});
  },
  'serverOSRM'(city){
    return metroLines.findOne({'city' : city}, {fields:{'serverOSRM':1}});
  },
  'isCreateScenario'(city){
    //console.log('isCreateScenario', metroLines.findOne({'city' : city})['newScenario'] )
    return metroLines.findOne({'city' : city}, {fields :{'newScenario':1}})['newScenario'];
  },
  'isochrone'(point, scenarioID, startTime){
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

        let arrayN = {};
        let arrayNDef = cityData.arrayN;

        arrayN['P2SPos'] = mergeArrays.mergeArrayN(arrayNDef.P2SPos, scenario.P2S2Add, 'pos');
        arrayN['P2STime'] = mergeArrays.mergeArrayN(arrayNDef.P2STime, scenario.P2S2Add, 'time');
        arrayN['S2SPos'] = mergeArrays.mergeArrayN(arrayNDef.S2SPos, scenario.S2S2Add, 'pos');
        arrayN['S2STime'] = mergeArrays.mergeArrayN(arrayNDef.S2STime, scenario.S2S2Add, 'time');
        arrayN['P2PPos'] = arrayNDef.P2PPos.slice();
        arrayN['P2PTime'] = arrayNDef.P2PTime.slice();

        let pointsVenues = cityData.pointsVenues;
        let areaHex = cityData.areaHex;
        let arrayPop = cityData.arrayPop;
        //console.log('arrayC, arrayN', arrayC.length, Object.keys(arrayN))
        //let startTime = timesOfDay[time_i];
        let returned = worker.CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);


      return returned.tPoint;
    }
  },
  'connections'(city){
    return initArrayC(city, 7*3600, 10.*3600.);
  }
});
