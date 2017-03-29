import { budget,costMetroStop,costTubeKm, getCity } from '../../api/parameters.js';

import turf from 'turf';
import Template from 'meteor/templating';
import {Mongo} from 'meteor/mongo';
export const computeBadget =  function(numStop, totLength){
	return budget - (numStop) * costMetroStop - totLength * costTubeKm;
};


export const metroLength = function(stopList){
	//console.log(stopList);
	let lineStop = stopList.map(function(stop){return stop.latlng;});
	return turf.lineDistance(turf.lineString(lineStop), 'kilometers');
};

export const costLines = function(linesDb){
	var city = getCity();
	let lines = linesDb.find({city:city,temp:true});
	let totTempStop = 0;
	let totTubeLength = 0;
	lines.forEach(function(line){
		if(line.stops.length > 0){
			//console.log(line.stops.length, 0.5*(line.stops.length > 0), 0.5*(line.stops.length > 1));
			totTempStop += (line.stops.length - 0.5*(line.stops.length > 0) - 0.5*(line.stops.length > 1));
			let tempLineLength = metroLength(line.stops);
			totTubeLength += tempLineLength;
		}
	});
	return computeBadget(totTempStop, totTubeLength);
};

export const CheckCostAddStop = function(linesDb, stop, lineNameStop){
	var city = getCity();
	let lines = linesDb.find({city:city,temp:true});
	let newLines = new Mongo.Collection(null);
	let totTempStop = 0;
	let totTubeLength = 0;
	lines.forEach(function(line){
		//console.log(line);
		if(line.lineName != lineNameStop){
			newLines.insert(line);
			//totTempStop += (line.stops.length - 0.5*(line.stops.length > 0) - 0.5*(line.stops.length > 1));
			//let tempLineLength = metroLength(line.stops);
			//totTubeLength += tempLineLength;
		}
		else{
			//let newNum = line.stops.length + 1
			//totTempStop += (newNum - 0.5*(newNum > 0) - 0.5*(newNum > 1));
			line.stops.push(stop);
			newLines.insert(line);
			//let tempLineLength = metroLength(line.stops);
			//totTubeLength += tempLineLength;
		}
	});
	//console.log('costs',lineNameStop, computeBadget(totTempStop, totTubeLength),lineNameStop,linesDb.findOne({city:city,temp:true}));
	return costLines(newLines) > 0;
};

export const CheckCostDragStop = function(linesDb, marker){
	var city = getCity();
	let lines = linesDb.find({city:city,temp:true});
	let newLines = new Mongo.Collection(null);
	let stopTemp = {
		'latlng':[marker._latlng.lat, marker._latlng.lng],
		'_leaflet_id':marker._leaflet_id
	};

	lines.forEach(function(line){
		let positionToChange = _.findIndex(line.stops, function(stop){ return stop._leaflet_id == marker._leaflet_id;});
		if(positionToChange == -1){
			newLines.insert(line);
		}
		else{
			line.stops.splice(positionToChange,1, stopTemp);
			newLines.insert(line);
		}
	});
	return costLines(newLines) > 0;
};
