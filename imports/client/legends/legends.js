import '/imports/client/legends/legends.html';
import {
	Template
} from 'meteor/templating';
import turf from 'turf';

import '/imports/client/legends/addLinesButtons.js';
import '/imports/client/legends/selectorModeButtons.js';
import '/imports/client/legends/quantityButtons.js';
import '/imports/client/legends/timeRadioButtons.js';
import '/imports/client/legends/metroSpeed.js';

import {returnShell, styleHex, computeAvgAccessibility, color} from '/imports/client/info/hexagons/colorHex.js';
import {
	budget,
	costMetroStop,
	costTubeKm,
	getCity
} from '/imports/api/parameters.js';


export const createLegends = function(name, toAdd = true) {
	let createControl = function(template, position) {
		let Co = L.Control.extend({
			options: {
				position: position
			},

			onAdd: function(map) {
				const container = L.DomUtil.create('div', '');
				L.DomEvent.disableClickPropagation(container);
				Blaze.renderWithData(template, Template.body.data, container);
				return container;
			}
		});
		var t = new Co();
		if (toAdd)
			Template.body.data.map.addControl(t);
		return t;
	};

	switch (name) {
		case 'infoBuild':
			Template.body.data.infoBuildLegend = createControl(Template.selectorModeButtons, 'bottomleft', toAdd);
			break;
		case 'quantityButtons':
			Template.body.data.quantityButtons = createControl(Template.quantityButtons, 'bottomright', toAdd);
			break;
		case 'infoInfo':
			Template.body.data.infoInfoLegend = createControl(Template.infoInfo, 'topleft', toAdd);
			break;
		case 'legendHex':
			Template.body.data.legendHex = createControl(Template.legendHex, 'topright', toAdd);
			break;
		case 'legendBudget':
			Template.body.data.legendBudget = createControl(Template.legendBudget, 'topleft', toAdd);
			break;
		case 'legendAddLines':
			Template.body.data.legendAddLines = createControl(Template.addLinesButtons, 'bottomleft', toAdd);
			break;
		case 'timeButtons':
			Template.body.data.timeButtons = createControl(Template.timeRadioButtons, 'bottomleft', toAdd);
			break;
		case 'metroSpeed':
			Template.body.data.speedButtons = createControl(Template.metroSpeed, 'topleft', toAdd);
			break;


	}

};

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
		'color': color[color.length - 1],
		'html': '>' + shell[shell.length - 1]
	});
	return objColor;
}

Template.legendHex.helpers({
	'listColor' () {

		let feature = Template.quantityButtons.quantitySelectedRV.get();
		let mode =	Template.quantityButtons.modeSelectedRV.get();
		let shell =	returnShell(feature, mode);
		let selColor = color(feature, mode);
		return makeColorLegend(shell, selColor);

	},
	'title' () {
		let feature = Template.quantityButtons.quantitySelectedRV.get();
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



Template.infoInfo.helpers({
	'buttonSelected' (name) {
		//console.log(name);
		return Template.body.data.infoBuildRV.get() == name;
	}
});
