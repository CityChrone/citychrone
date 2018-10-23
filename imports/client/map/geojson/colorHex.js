import {Template} from 'meteor/templating';
//import d3 from 'd3';
import * as d3Inter from 'd3-scale-chromatic';
import d3 from 'd3'

//const shell = [0.,5., 7.,8.,9.,10.,12.,14,16, 20.];
//const shell = [0, 5, 7, 9, 11, 13, 15, 17, 20 ];
//const shell = [0.,3., 5.,7.,9.,11.,13.,15,17, 20.];

// Primary color:

let r_0 = "#FEB1B3";
let r_1 = "#EF4E65" ;
let r_2 = "#E4203B" ;
let r_3 = "#9B0015" ;
let r_4 = "#740010" ;

//*** Secondary color (1):

 let y_0 = "#C77307";
let y_1 = "#FBB252";
let y_2 = "#F09621" ;
let y_3 = "#A35C00";
let y_4 = "#7A4500";
//*** Secondary color (2):

let b_0 = "#0C5080" ;
let b_1 = "#3C77A1" ;
let b_2 = "#1E669A";
let b_3 = "#064069";
let b_4 = "#032F4E";

//*** Complement color:

  let g_0 = "#2DA906" ;
   let g_1 = "#68D546" ;
  let g_2 = "#46CB1C";
  let g_3 = "#218A00";
  let g_4 = "#196700";

let colorV = ['#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a']
let red = d3Inter.interpolateReds
let grey = d3Inter.interpolateGreys
let green = d3Inter.interpolateGreens
let orange = d3Inter.interpolateOranges
let blue = d3Inter.interpolateBlues
let purple = d3Inter.interpolateRdPu;
let yellowOrangeRed = d3Inter.interpolateYlOrRd
let orangeRed = d3Inter.interpolateOrRd
let spectral = d3Inter.interpolateSpectral
let redPurple = d3Inter.interpolateRdPu
let plasma = d3Inter.interpolatePlasma
let third = orangeRed;
let fourth = redPurple;
let second =  blue;
let first = grey;


export const maxValueIso = 2. * 3600.
export const maxValuePotPop = 1000000;

export const numBinIso = 8.;
export const numBinPop = 20;

//export const colorVelList = ['#000000',grey(0.8), "#f16913","#fdae6b",  '#74c476', '#31a354', '#006d2c', "#4292c6", "#2171b5", '#08519c', "#26188A", "#800080FF"];
export const colorVelList = ['#000000',spectral(0.),spectral(0.1),spectral(0.2),spectral(0.3),spectral(0.4),spectral(0.7),spectral(0.8),spectral(0.85),spectral(0.9),spectral(0.95),spectral(1)];

//export const colorVelList = ['#000000', red(0.6), red(0.4), red(0.2), y_3,y_2, y_1, "#6baed6", "#4292c6", "#2171b5", '#08519c', g_1, g_2, g_3, g_4];
export const shellVel = [0., 2., 4., 5, 6., 7, 8., 9, 10., 12., 14];
//export const shellVel = [0., 2., 4., 5,  6., 7,  8., 10.,  12., 14];

export const colorVel = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellVel.length; i++) {
		if (val < shellVel[i]) break;
	}
	let color = colorVelList[i];
	//color = spectral(val/shellVel[shellVel.length-1])
	return color
};


//export const shellPotPop =  [0, 50000, 100000, 200000, 300000, 400000, 500000, 600000,700000,800000, 900000, 1000000,1500000, 2000000,2500000, 3000000]
export const shellPotPop =  [0, 50000, 100000, 200000, 400000, 600000, 800000, 1000000,1500000, 2000000, 3000000]
//export const colorPopList = ['#000000', first(0.9), first(0.7), second(0.7), second(0.5), second(0.3), third(0.3), third(0.5), third(0.7), fourth(0.7),fourth(0.85)];
export const colorPopList = colorVelList;
export const colorPotPop = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellPotPop.length; i++) {
		if (val < shellPotPop[i]) break;
	}
	if (i < colorPopList.length)
	{
		return colorPopList[i];
	}
	else {
		return colorPopList[colorPopList.length-1];
	}
};

//export const colorPotPop = logBase
export const maxValueVelDiff = 2.;
export const numBinDiff = 15;
export const maxValuePotPopDiff = 200000;

export const shellVelDiff = _.range(0, maxValueVelDiff,  maxValueVelDiff/numBinDiff);
shellVelDiff.unshift(-1);
//console.log(shellVelDiff)
export const colorVelDiff = function(val) {
	if(val < 0) return null;
	else{
		return d3.scaleSequential(purple).domain([0, maxValueVelDiff]).clamp(true)(val);
	}
};


export const shellPotPopDiff = _.range(0, maxValuePotPopDiff,  maxValuePotPopDiff/numBinDiff)
shellPotPopDiff.unshift(-1);

export const colorPotPopDiff = function(val) {
	//console.log(val, val < 0)
	if(val <= 0){
		//console.log('returning null');
	 return null;
	}
	else {
		return  d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValuePotPopDiff]).clamp(true)(val);
	}
};


export const shellPopulation =  [0,50,100, 200, 400, 700, 1000, 2000, 4000]
export const colorListPopulation = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#abd9e9','#74add1','#4575b4', '#878787'].reverse()
export const colorPopulation = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellPopulation.length; i++) {
		if (val < shellPopulation[i]) break;
	}
		//console.log(i, val, colorListIso[i], shellIsochrone)
	let color = colorListPopulation[i-1];
	return color
};

export const shellIsochrone  =  _.range(maxValueIso/numBinIso, maxValueIso+1,  maxValueIso/numBinIso)
shellIsochrone.unshift(1)
shellIsochrone.unshift(0)
export const colorListIso = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'].reverse()
export const colorIsochrone = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellIsochrone.length; i++) {
		if (val < shellIsochrone[i]) break;
	}
		//console.log(i, val, colorListIso[i], shellIsochrone)
	let color = colorListIso[i-1];
	return color
};




export const returnShell = function(feature, diff){
	//console.log('return shell', mode, feature)
	switch(feature) {
		case 'velocityScore':
			return shellVel;
		case 't':
			return shellIsochrone;
		case 'socialityScore':
			return shellPotPop;
		case 'velocityScoreDiff':
			return shellVelDiff;
		case 'socialityScoreDiff':
			return shellPotPopDiff;
		case 'noLayer':
			return [0];
		case 'population':
			return shellPopulation;



	}
};

export const color = function(feature){
	//console.log(feature, mode, 'styleHex!!')
	switch(feature) {
		case 'velocityScore':
			return colorVel;
		case 't':
			return colorIsochrone;
		case 'socialityScore':
			return colorPotPop;
		case 'velocityScoreDiff':
			return colorVelDiff;
		case 'socialityScoreDiff':
			return colorPotPopDiff;
		case 'noLayer':
			return ()=>{return null};
		case 'population':
			return colorPopulation;


	}
};

export const styleHex = function(feature){
	switch(feature) {
			case 'velocityScore':
				return styleVel;
			case 't':
				return styleIsochrone;
			case 'socialityScore':
				return stylePotPop;
			case 'velocityScoreDiff':
				return styleVelDiff;
			case 'socialityScoreDiff':
				return stylePotPopDiff;
			case 'noLayer':
				return styleGeojson(null);
			case 'population':
				return stylePopulation;
		}
};

const isochrone_style = {
	weight: 2,
	opacity: 1,
	color: 'white',
	dashArray: '3',
	fillOpacity: 0.3,
	//clickable: false,
};

export const styleGeojson = function(color) {
	let opacity = 0.5;
 	if (color ==null) opacity = 0;
	let style = {
		fillColor: color,
		color: '#bababa',
		fill: true,
		fillOpacity: opacity,
		opacity : 0.4,
		weight: 0.5
		//clickable : false
	};

	return style;
};


const styleIsochrone = function(feature) {
	let color = colorIsochrone(feature.geometry.properties.t);
	return styleGeojson(color);
};


export const styleVel = function(feature) {
	let color = colorVel(feature.geometry.properties.velocityScore);
	return styleGeojson(color);
};
export const styleVelDiff = function(feature) {
	let color = colorVelDiff(parseFloat(feature.geometry.properties.velocityScoreDiff));
	return styleGeojson(color);
};


export const stylePotPop = function(feature) {
	let color = colorPotPop(parseFloat(feature.geometry.properties.socialityScore));
	return styleGeojson(color);
};

export const stylePotPopDiff = function(feature) {
	let color = colorPotPopDiff(parseFloat(feature.geometry.properties.socialityScoreDiff));
	return styleGeojson(color);
};

export const styleDiffVel = function(feature, maxValue) {
	return styleGeojson(colorDiff(parseFloat(feature.geometry.properties.vAvgDiff)));
};

export const stylePopulation = function(feature) {
	let color = colorPopulation(feature.geometry.properties.population);
	return styleGeojson(color);
};

