import { Template } from 'meteor/templating';
import turf from 'turf';

import {returnShell, color} from '/imports/client/map/geojson/colorHex.js';
import { field2text } from '/imports/client//selector/quantitySelector.js';
import '/imports/client/map/geojson/legendGeojson.html';

const makeColorLegend = function(shell, color, functionToShell){
	functionToShell = functionToShell || function(val){return val.toString()}
	objColor = [];
	
	for (let i = 0; i < shell.length - 1; i++) {
		objColor.push({
			'color': color((shell[i] + shell[i + 1])/2),
			'html': functionToShell(shell[i]) + '-' + functionToShell(shell[i + 1])
		});
	}
	objColor.push({
		'color': color(shell[shell.length - 1]),
		'html': '>' + functionToShell(shell[shell.length - 1])
	});
	return objColor;
}

let dataQuantity = function(quantity){
	switch (quantity) {
			case 'newVels':
				return {
					title: field2text['newVels'],
					'unity': '[km/h]',
					'functionToShell' : undefined
				};
			case 'newVelsDiff':
				return {
					title: field2text['newVelsDiff'],
					'unity': '[km/h]',
					'functionToShell' : (val) => { 
						if(val < 0) return "no diff"
						if(val == 0) return 0
						return Math.round(val*10)/10;
					}

				};
			case 'btnAccessibility':
				return {
					title: 'accessibility',
					'unity': ''
				};
			case 'newPotPop':
				return {
					title: field2text['newPotPop'],
					'unity': '[individuals]',
					'functionToShell' : (val) => { return (val/1000.).toString() + 'K';}
				};
			case 'newPotPopDiff':
				return {
					title: field2text['newPotPopDiff'],
					'unity': '[individuals]',
					'functionToShell' : (val) => { 
						if(val < 0) return "no diff"
						if(val == 0) return 0
						return Math.round((val/1000.)).toString() + 'K';
					}
				};
			case 't':
				return {
					title: field2text['t'],
					'unity': '[min]',
					'functionToShell' : (val) => { 
						if (val == 0) return "start";
						if (val / 60 < 1) return 0;
						return (val/60.).toString();
					}
				};
		}
}

Template.legendGeojson.helpers({
	'listColor' () {
		let quantity = Template.quantitySelector.quantitySelectedRV.get();
		let diff =	Template.quantitySelector.quantityDiffSelectedRV.get();
		let shell =	returnShell(quantity, diff);
		let selColor = color(quantity, diff);
		return makeColorLegend(shell, selColor, dataQuantity(quantity).functionToShell);

	},
	'title' () {
		let quantity = Template.quantitySelector.quantitySelectedRV.get();
		//let mode =	Template.quantityButtons.modeSelectedRV.get();
		return dataQuantity(quantity);
		
	}
});
