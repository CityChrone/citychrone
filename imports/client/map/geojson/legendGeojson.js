import { Template } from 'meteor/templating';
import turf from 'turf';

import {returnShell, color} from '/imports/client/map/geojson/colorHex.js';

import '/imports/client/map/geojson/legendGeojson.html';

const makeColorLegend = function(shell, color){
	//console.log(shell, color)
	objColor = [];
	
	for (let i = 0; i < shell.length - 1; i++) {
		objColor.push({
			'color': color((shell[i] + shell[i + 1])/2),
			'html': shell[i].toString() + '-' + shell[i + 1].toString()
		});
	}
	objColor.push({
		'color': color(shell[shell.length - 1]),
		'html': '>' + shell[shell.length - 1]
	});
	return objColor;
}


Template.legendGeojson.helpers({
	'listColor' () {
		let feature = Template.quantitySelector.quantitySelectedRV.get();
		let diff =	Template.quantitySelector.quantityDiffSelectedRV.get();
		let shell =	returnShell(feature, diff);
		let selColor = color(feature, diff);
		return makeColorLegend(shell, selColor);

	},
	'title' () {
		let feature = Template.quantitySelector.quantitySelectedRV.get();
		//let mode =	Template.quantityButtons.modeSelectedRV.get();

		switch (feature) {
			case 'newVels':
				return {
					title: 'access-velocity',
					'unity': '[km/h]'
				};
			case 'btnAccessibility':
				return {
					title: 'accessibility',
					'unity': ''
				};
			case 'newPotPop':
				return {
					title: 'potential population',
					'unity': '[Thousand]'
				};
			case 't':
				return {
					title: 'isochrone',
					'unity': 'time'
				};
		}
	}
});
