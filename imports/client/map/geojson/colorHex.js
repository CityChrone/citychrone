import {Template} from 'meteor/templating';
//import d3 from 'd3';
import * as d3Inter from 'd3-scale-chromatic';
import d3 from 'd3'
//const shell = [0.,5., 7.,8.,9.,10.,12.,14,16, 20.];
//const shell = [0, 5, 7, 9, 11, 13, 15, 17, 20 ];
//const shell = [0.,3., 5.,7.,9.,11.,13.,15,17, 20.];
export const maxValueDiff = 2.;
export const maxValueAccessDiff = 1.;
export const maxValueIso = 3. * 3600.
export const maxValuePotPop = 1000000;

export const numBinAccess = 15;
export const numBinDiff = 10;
export const numBinIso = 18.;
export const numBinPop = 20;

export const colorVelList = ['#000000', '#993404', "#f16913", "#fdae6b", '#74c476', '#31a354', '#006d2c', "#6baed6", "#4292c6", "#2171b5", '#08519c', '#f768a1', '#dd3497', '#ae017e', '#49006a', '#49006a'];
export const shellVel = [0., 3., 5., 6, 7., 8, 9., 10, 11., 12, 13., 14, 17, 20.];
export const colorVel = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellVel.length; i++) {
		if (val < shellVel[i]) break;
	}
	let color = colorVelList[i];
	return color
};

export const shellPotPop =  _.range(0, maxValuePotPop,  maxValuePotPop/numBinPop)
export const colorPotPop = d3.scaleSequential(d3Inter.interpolateSpectral).domain([0, maxValuePotPop]).clamp(true)

export const shellDiffPotPop = _.range(0, maxValueDiff,  maxValueDiff/numBinDiff)
export const colorDiffPotPop = d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValueDiff]).clamp(true)


export const shellIsochrone =  _.range(-maxValueIso/numBinIso+1, maxValueIso,  maxValueIso/numBinIso)
export const colorIsochrone = d3.scaleSequential(d3Inter.interpolateSpectral).domain([0, maxValueIso]).clamp(true)

export const shellDiffVel = _.range(0, maxValueDiff,  maxValueDiff/numBinDiff)
export const colorDiffVel = d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValueDiff]).clamp(true)

export const shellDiffAccess = _.range(0, maxValueAccessDiff,  maxValueAccessDiff/numBinDiff)
export const colorDiffAccess = d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValueAccessDiff]).clamp(true)

export const shellAccess = _.range(0, 1.001, 1./8)
export const colorAccess = d3.scaleSequential(d3Inter.interpolateRdBu).domain([0, 1]).clamp(true)

export const returnShell = function(feature, diff){
	//console.log('return shell', mode, feature)
	if(!diff){
		switch(feature) {
				case 'newVels':
					return shellVel;
				case 'newAccess':
					return shellAccess;
				case 't':
					return shellIsochrone;
				case 'newPotPop':
					return shellPotPop
			}
		}else{
			switch(feature) {
				case 'newVels':
					return shellDiffVel;
				case 'newAccess':
					return shellDiffAccess;
				case 't':
					return shellDiffIsochrone;
				case 'newPotPop':
					return shellDiffPotPop

			}
		}
};

export const color = function(feature, diff){
	//console.log(feature, mode, 'styleHex!!')
		if (!diff){
			switch(feature) {
				case 'newVels':
					return colorVel;
				case 'newAccess':
					return colorAccessibility;
				case 't':
					return colorIsochrone;
				case 'newPotPop':
					return colorPotPop;
			}
		}else{
			switch(feature) {
				case 'newVels':
					return colorDiffVel;
				case 'newAccess':
					return colorDiffAccessibility;
				case 't':
					return colorDiffIsochrone;
				case 'newPotPop':
					return colorDiffPotPop;

			}
		}
};

export const styleHex = function(feature, diff){
	//console.log(feature, mode, 'styleHex!!')
	if(!diff){			
		switch(feature) {
				case 'newVels':
					return styleVel;
				case 'newAccess':
					return styleAccessibility;
				case 't':
					return styleIsochrone;
				case 'newPotPop':
					return stylePotPop;
			}
		}else{
			switch(feature) {
				case 'newVels':
					return styleDiffVel;
				case 'newAccess':
					return styleDiffAccessibility;
				case 't':
					return styleDiffIsochrone;
				case 'newPotPop':
					return styleDiffPotPop;

			}
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
 
	let style = {
		fillColor: color,
		color: color,
		fill: true,
		fillOpacity: 0.6,
		weight: 0.3
		//clickable : false
	};

	return style;
};


const styleIsochrone = function(feature) {
	let color = colorIsochrone(feature.geometry.properties.t);
	return styleGeojson(color);
};


export const styleVel = function(feature) {
		//console.log(feature.geometry.properties, 'styleVel')
	let color = colorVel(feature.geometry.properties.newVels);
	return styleGeojson(color);
};

export const stylePotPop = function(feature) {
	//console.log(feature.geometry.properties, 'stylePotPop')
	let color = colorPotPop(feature.geometry.properties.newPotPop);
	return styleGeojson(color);
};

export const styleAccessibility = function(feature) {
	let color = colorAccess(feature.geometry.properties.newAccess)
	return styleGeojson(color);
};

export const styleDiffAccessibility = function(feature) {
	let color = colorAccessDiff(parseFloat(feature.geometry.properties.accessDiff))
	return styleGeojson(color);
};

export const styleDiffVel = function(feature, maxValue) {
	return styleGeojson(colorDiff(parseFloat(feature.geometry.properties.vAvgDiff)));
};

export const styleDiffPotPop = function(feature, maxValue) {
	return styleGeojson(colorDiff(parseFloat(feature.geometry.properties.potPopDiff)));
};


export const computeAvgAccessibility = function(access) {
	var maxAccess = _.get(Template, "body.data.defaultScenario.newAccessMax");
	if (!maxAccess || !access)
		return -1;

	var avg = 0.0,
		count = 0;
	for (var n in maxAccess) {
		if (maxAccess[n]) {
			avg += (access[n] || 0) / maxAccess[n];
			count++;
		}
	}

	//console.log('com access', avg, count);

	return count ? (avg / count) : -1;
};

