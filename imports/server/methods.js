import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { addNewLines } from '/imports/lib/newScenarioLib/addNewLines.js';
//import {initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import { citiesData,  listCities} from '/imports/server/startup/loadCitiesData.js';
import { maxDuration
} from '/imports/parameters.js';
  
let worker = require("/public/workers/ICSACore.js");
let mergeArrays = require("/public/workers/mergeArrays.js");

Meteor.methods({
  'isochrone'(point, scenarioID, startTime){
      var scenario = scenarioDB.findOne({'_id':scenarioID});
      let city = scenario.city;
      if(scenario == [] || !(city in citiesData) ){ 
        //console.log('Scenario not found')
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
        let returned = worker.ICSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);


      return returned.tPoint;
    }
  },
    'giveDataBuildScenario' : function(city,data){
    let dataToReturn = {}
    data.forEach( (name)=>{
      if(citiesData[city][name] != undefined){
        dataToReturn[name] = citiesData[city][name];}
      else{
        dataToReturn[name] = [];
      }
    });
    //console.log(city, data)

    return dataToReturn;
  },
  'giveListCitiesScenario' : function(){
    return listCities;
  }
});
