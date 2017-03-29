import {connections, initConnections } from '/imports/api/DBs/connectionsDB.js';
import {points, stops} from '/imports/api/DBs/stopsAndPointsDB.js';
import { mergeSortedC } from '/imports/lib/utils.js';
import { timesOfDay, maxDuration  } from '/imports/api/parameters.js';
import { metroSpeeds, metroFrequencies  } from '/imports/client/legends/metroSpeed.js';
import math from 'mathjs';
import turf from 'turf';

function computeTfor2Stops(dist, Vf, a){//dist in meters
	// const Vf = 30; // max speed 100km/h
	// const a = 1.3; //acceleration 1.3 m/s^2
	const Ta = Vf / a; //time needed to reach max velocity
	const DISTa = 0.5 * a * Ta * Ta; //dist to reach the maximun velocity

	if(dist / 2.0 <= DISTa){
		return 2 * math.sqrt(dist);
	}else{
		//console.log('TimeDist ', DISTa, math.sqrt(DISTa), (dist - 2. * DISTa) / Vf);
		return math.round(2 * math.sqrt(DISTa) + (dist - 2.0 * DISTa) / Vf);
	}
}

function findSpeed(name) {
	for (var speed of metroSpeeds) {
		if (speed.name == name)
			return speed.topSpeed;
	}
	return 30;
}

function findAccel(name) {
	for (var speed of metroSpeeds) {
		if (speed.name == name)
			return speed.acceleration;
	}
	return 1.3;
}

function findFreq(name) {
	for (var freq of metroFrequencies) {
		if (freq.name == name)
			return freq.frequency;
	}
	return 2*60;
}

function addNewLines(metroLinesFetched, limT){

	const dockTime = 15; //time the trains is stopped at dock

	var stopsLines = {};
	console.log('metroLinesFetched', metroLinesFetched)

	_.each(metroLinesFetched, function(line){
		line.stops.forEach(function(stop, indexStop){
			if(indexStop === 0){
				stopsLines[line.lineName] = {
					'points' : [turf.point([stop.latlng[1], stop.latlng[0]])],
					'pos' : [stop.pos],
					speed: findSpeed(line.speedName),
					accel: findAccel(line.speedName),
					frequency: findFreq(line.frequencyName)
				};
			}else{
				stopsLines[line.lineName].points.push(turf.point([stop.latlng[1], stop.latlng[0]]));
				stopsLines[line.lineName].pos.push(stop.pos);
			}
		});
	});

	console.log(stopsLines);
	/*
	metro.find({temp:true}, {sort: {'timeCreation':1}}).forEach(function(stop){
		if(stop.line in stopsLines) {
			stopsLines[stop.line].points.push(stop.point);
			stopsLines[stop.line].pos.push(stop.pos);
		}else{
			stopsLines[stop.line] = {'points' : [stop.point], 'pos' : [stop.pos]};
		}
	});*/
	//console.log('addNEwLines', stopsLines);
	//connections.remove({'temp' : true});
	let cArrayTemp = [];

	_.each(stopsLines, function(line, lineName){
		//console.log(lines);
		let freqTime = line.frequency;
		let speed = line.speed;
		let accel = line.accel;

		if (!freqTime)
			return; //knock out linea

		let startingStopTime = 5*3600; //line starts at 5am
		let endTime = 24*3600; //line ends at 12pm

		let startStopPoint = line.points[0];
		let startStopPos = line.pos[0];
		//console.log(startStopPoint);

		//** One direction
		for(let stop_i = 1; stop_i < line.points.length; stop_i++){
			let endStopPoint = line.points[stop_i];
			let endStopPos = line.pos[stop_i];
			//console.log(startStopPoint, endStopPoint);
			let dist =  turf.distance(startStopPoint, endStopPoint, 'kilometers') * 1000.0;
			let timeDist = computeTfor2Stops(dist, speed, accel);
			let endingTime = startingStopTime + timeDist;
			let cArray2Add = [];
			for(let StartingTimeTemp = startingStopTime; StartingTimeTemp + timeDist <= endTime; StartingTimeTemp += freqTime){
				if(StartingTimeTemp >=  limT[0] && StartingTimeTemp + timeDist <= limT[1]){
					cArray2Add.push(startStopPos, endStopPos, StartingTimeTemp , StartingTimeTemp + timeDist);
				}
			}
			cArrayTemp = mergeSortedC(cArrayTemp, cArray2Add);
			startingStopTime = endingTime + dockTime;
			startStopPoint = line.points[stop_i];
			startStopPos = line.pos[stop_i];
		}
		// *** Opposite direction
		startingStopTime = 5*3600; //line starts at 5am
		endTime = 24*3600; //line ends at 12pm
		var totStop = line.points.length-1;
		startStopPoint = line.points[totStop];
		startStopPos = line.pos[totStop];
		for(let stop_i = totStop -1 ; stop_i >= 0; stop_i--){
			let endStopPoint = line.points[stop_i];
			let endStopPos = line.pos[stop_i];
			let dist =  turf.distance(startStopPoint, endStopPoint, 'kilometers') * 1000.0;
			let timeDist = computeTfor2Stops(dist, speed, accel);
			let endingTime = startingStopTime + timeDist;
			let cArray2Add = [];
			for(let StartingTimeTemp = startingStopTime; StartingTimeTemp + timeDist <= endTime; StartingTimeTemp += freqTime){
				if(StartingTimeTemp >=  limT[0] && StartingTimeTemp + timeDist <= limT[1]){
					cArray2Add.push(startStopPos, endStopPos, StartingTimeTemp , StartingTimeTemp + timeDist);
				}
			}
			cArrayTemp = mergeSortedC(cArrayTemp, cArray2Add);
			startingStopTime = endingTime + dockTime;
			startStopPoint = line.points[stop_i];
			startStopPos = line.pos[stop_i];
		}


	});
	console.log(cArrayTemp.length)
	return cArrayTemp;
	//console.log(stopsLines);
}

export {addNewLines};
