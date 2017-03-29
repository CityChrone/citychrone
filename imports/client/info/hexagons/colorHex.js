import {Template} from 'meteor/templating';
//import d3 from 'd3';
import * as d3Inter from 'd3-scale-chromatic';
import d3 from 'd3'
//const shell = [0.,5., 7.,8.,9.,10.,12.,14,16, 20.];
//const shell = [0, 5, 7, 9, 11, 13, 15, 17, 20 ];
//const shell = [0.,3., 5.,7.,9.,11.,13.,15,17, 20.];
export const maxValueDiff = 2.;
export const maxBinAccess = 15;
export const maxBinDiff = 10;
export const maxValueAccessDiff = 1.;
export const maxValueIso = 3. * 3600.
export const numBinIso = 9.


export const mycolor = ['#000000', '#993404', "#f16913", "#fdae6b", '#74c476', '#31a354', '#006d2c', "#6baed6", "#4292c6", "#2171b5", '#08519c', '#f768a1', '#dd3497', '#ae017e', '#49006a'];
//export const colorIso = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'].reverse();
//export const colorDiff = ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'];

export const shell = [0., 3., 5., 6, 7., 8, 9., 10, 11., 12, 13., 14, 17, 20.];

export const shellIso =  _.range(0, maxValueIso,  maxValueIso/numBinIso)
export const colorIso = d3.scaleSequential(d3Inter.interpolateSpectral).domain([0, maxValueIso]).clamp(true)

export const shellDiff = _.range(0, maxValueDiff,  maxValueDiff/maxBinDiff)
export const shellDiffAccess = _.range(0, maxValueAccessDiff,  maxValueAccessDiff/maxBinDiff)
export const colorDiff = d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValueDiff]).clamp(true)
export const colorAccessDiff = d3.scaleSequential(d3Inter.interpolateBlues).domain([0, maxValueAccessDiff]).clamp(true)

console.log(d3Inter)


export const shellAccess = _.range(0, 1.001, 1./8)
export const colorAccess = d3.scaleSequential(d3Inter.interpolateRdBu).domain([0, 1]).clamp(true)

export const returnShell = function(field){
	switch(field) {
		case 'vAvg':
			return shell;
		case 'vAvgNew':
			return shell;
		case 'isochrone':
			return shellIso;
		case 'vAvgDiff':
			return shellDiff;
		case 'accessOldVal':
			return shellAccess;
		case 'accessNewVal':
			return shellAccess;
		case 'accessDiff':
			return shellDiffAccess;
		case 't':
		return shellIso;
	}
}

/*
export const returnColor = function(field){
	switch(field) {
		case 'vAvg':
			return mycolor;
		case 'vAvgNew':
			return mycolor;
		case 't':
			return colorIso;
		case 'diff':
			return colorDiff;
		case 'accessOld':
			return colorAccess;
	}
}
*/

const isochrone_style = {
	weight: 2,
	opacity: 1,
	color: 'white',
	dashArray: '3',
	fillOpacity: 0.3,
	//clickable: false,
};

export const styleGeojson = function(color) {
 
	//let color = colorD3Catb(Math.ceil( (val / maxVal)*20));
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


export const styleHex = function(feature) {
	//console.log('stylehex',feature, Template.body.data.buttonsFeature, Template.body.data.buttonsHex)
	switch (Template.body.data.buttonsFeature) {
		case 'btnVelocity':
			switch (Template.body.data.buttonsHex) {
				case 'velHex':
					return styleVel(feature);
				case 'velNewHex':
					return styleVelNew(feature);
				case 'diffHex':
					return styleDiff(feature, maxValueDiff);
			}
		break;

		case 'btnAccessibility':
			switch (Template.body.data.buttonsHex) {
				case 'velHex':
					return styleAccessibility(feature);
				case 'velNewHex':
					return styleAccessibilityNew(feature);
				case 'diffHex':
					return styleDiffAccessibility(feature);
			}
			break;
		case 'btnIsochrones':
			switch (Template.body.data.buttonsHex) {
				case 'velHex':
					return styleIsochrone(feature);
				case 'velNewHex':
					return styleIsochrone(feature);
				case 'diffHex':
					return styleIsochrone(feature);
			}
		break;
	}	
	return '';
};


const styleIsochrone = function(feature) {
	let color = colorIso(feature.geometry.properties.t);
	//console.log(feature, color)
	return styleGeojson(color);
};


export const styleVel = function(feature) {
	return colorShell(feature.geometry.properties.vAvg);
};

export const styleVelNew = function(feature) {
	return colorShell(feature.geometry.properties.vAvgNew);
};


export const styleAccessibility = function(feature) {
	let color = colorAccess(feature.geometry.properties.accessOldVal)
	return styleGeojson(color);
};

export const styleAccessibilityNew = function(feature) {
	let color = colorAccess(feature.geometry.properties.accessNewVal)
	return styleGeojson(color);
};

export const styleDiffAccessibility = function(feature) {
	return styleGeojson(colorAccessDiff(parseFloat(feature.geometry.properties.accessDiff)));
};

export const styleDiff = function(feature, maxValue) {
	return styleGeojson(colorDiff(parseFloat(feature.geometry.properties.vAvgDiff)));
};

export const colorShell = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shell.length; i++) {
		if (val < shell[i]) break;
	}
	//if(val> 8.9) console.log(val);
	//let color = colorD3Catb(Math.floor(val));
	//let color = colorRainbow(val/maxV);
	let color = mycolor[i];
	let style = {
		fillColor: color,
		color: color,
		fill: true,
		fillOpacity: 0.6,
		weight: 0.3,
		//clickable : false
	};

	return style;
};


export const colorAccessibility = function(val) {
	let i = 0;
	//let maxV = 16.;
	for (i = 0; i < shellAccess.length; i++) {
		if (val < shellAccess[i]) break;
	}
	//if(val> 8.9) console.log(val);
	//let color = colorD3Catb(Math.floor(val));
	//let color = colorRainbow(val/maxV);
	let color = colorAccess[i];
	let style = {
		fillColor: color,
		color: color,
		fill: true,
		fillOpacity: 0.6,
		weight: 0.3,
		//clickable : false
	};

	return style;
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

