import turf from 'turf';
import math from 'mathjs';
import {
	Router
} from 'meteor/iron:router';

export const timesOfDay = [7 * 3600, 12 * 3600, 17 * 3600, 22 * 3600];
export const maxDuration = 3 * 3600;

//export let city = 'roma';
export const zeroTime = 3.0 * 60; //first 3 min are not consider in the average velocity
export const integralWindTime = Math.log(maxDuration - zeroTime) - Math.log(zeroTime);
//export const serverOsrm = 'http://192.168.1.104:3000';// 'http://130.192.68.192:3000';
export const serverOsrm = 'http://130.192.68.192:3000';
//export const serverOsrm = 'http://141.108.1.12:3000';// 'http://130.192.68.192:3000';
export const costMetroStop = 100;
export const costTubeKm = 30;
export const budget = 5000;

export let hexList = {};

hexList.roma = {
	'coordinates': [[[12.214074052781484, 41.87554302083059],
    [12.212864889931536, 41.87398360797108],
    [12.210446564231644, 41.87398360797108],
    [12.209237401381696, 41.87554302083059],
    [12.210446564231644, 41.877102433690105],
    [12.212864889931536, 41.877102433690105],
    [12.214074052781484, 41.87554302083059]]],
	'type': 'Polygon'
};

hexList.torino = {
	"type": "Polygon",
	"coordinates": [[[7.484547576603371, 45.053963488716754], [ 7.483275609117042, 45.05240495044235 ], [ 7.4807316741443834, 45.05240495044235 ], [ 7.479459706658054, 45.053963488716754 ], [ 7.4807316741443834, 45.055522026991156 ], [ 7.483275609117042, 45.055522026991156 ], [ 7.484547576603371, 45.053963488716754 ] ] ] };

hexList.vienna = {"type":"Polygon","coordinates":[[[16.253606654579997,48.19558550775174],[16.252259151845518,48.194027827303785],[16.24956414637656,48.194027827303785],[16.24821664364208,48.19558550775174],[16.24956414637656,48.19714318819969],[16.252259151845518,48.19714318819969],[16.253606654579997,48.19558550775174]]]};

export let HexArea = {};

for (let city in hexList) {
	HexArea[city] = turf.area(hexList[city]) / (math.pow(10, 6));
}


export let CenterHex = {
	'roma': [(hexList['roma']["coordinates"][0][0][0]+hexList['roma']["coordinates"][0][3][0])/2., (hexList['roma']["coordinates"][0][0][1]+hexList['roma']["coordinates"][0][3][1])/2.],
	'vienna': [16.25091164911104,48.19558550775174],
	'torino': [7.482003641630713, 45.053963488716754]
};

export let CenterCity = {
	'roma': [12.501755, 41.900648],
	'vienna': [16.363449, 48.210033],
	'torino': [7.5998772, 45.0701175]
};


//var city;

export const getCity = function() {
	if (Meteor.isServer) {
		throw new Exception("Only allowed on client");
	}
	if (Router && Router.current && Router.current() && Router.current().params && Router.current().params.city) {
		console.log("getCity, Router esiste: " + Router.current().params.city);
		return Router.current().params.city;
	}
	var pp = window.location.pathname.split("/");
	if (pp.length > 2) {
		console.log("getCity, Router non esiste, location si: " + pp[2]);
		return pp[2];
	}

	console.log("getCity, Router non esiste, location neanche");
	return 'roma';

};
