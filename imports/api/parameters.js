import turf from 'turf';
import math from 'mathjs';
import {
	Router
} from 'meteor/iron:router';

export const maxTimeWalk = 900.; //[second] Max distance allowed for walking path between stops and points.
export const walkingVelocity = 5./3.6; // [meter/second].
export const maxDistanceWalk = maxTimeWalk * walkingVelocity; //Max distance allowed for walking path between stops and points.
export const timesOfDay = [7. * 3600.];//, 12 * 3600, 17 * 3600, 22 * 3600];
export const maxDuration = 3 * 3600; //max integration intervals, limit the lenght of array of connections.

//export const zeroTime = 3.0 * 60; //first 3 min are not consider in the average velocity
//export const integralWindTime = Math.log(maxDuration - zeroTime) - Math.log(zeroTime);

export const metroSpeeds = [
	{
		name: "Low",
		topSpeed: 12,
		acceleration: 0.6,
		colorClass: 'btn-danger'
	},
	{
		name: "Med",
		topSpeed: 20,
		acceleration: 0.9,
		colorClass: 'btn-warning'
	},
	{
		name: "High",
		topSpeed: 30,
		acceleration: 1.3,
		colorClass: 'btn-success'
	}
];

export const metroFrequencies = [
	{
		name: "Off",
		frequency: 0,
		colorClass: 'btn-default'
	},
	{
		name: "Low",
		frequency: 15*60,
		colorClass: 'btn-danger'
	},
	{
		name: "Med",
		frequency: 8*60,
		colorClass: 'btn-warning'
	},
	{
		name: "High",
		frequency: 2*60,
		colorClass: 'btn-success'
	},
];
