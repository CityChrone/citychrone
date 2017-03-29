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

import {
	colorDiff,
	maxValueDiff,
	colorAccessDiff,
	shell,
	shellDiff,
	shellDiffAccess,
	mycolor,
	shellIso,
	colorIso,
	colorShell,
	styleVelNew,
	styleVel,
	styleDiff,
	styleHex,
	shellAccess,
	colorAccess
} from '/imports/client/info/hexagons/colorHex.js';
import {
	budget,
	costMetroStop,
	costTubeKm,
	getCity
} from '/imports/api/parameters.js';

import {
	costLines
} from '/imports/client/budget/metroCost.js';

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
	objColor = [];
	
	for (let i = 0; i < shell.length - 1; i++) {
		objColor.push({
			'color': color[i + 1],
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
		//console.log(Template.body.data.legendHexRV);

		let feature = Template.quantityButtons.modeSelectedRV.get();
		let mode =	Template.quantityButtons.modeSelectedRV.get();

		let objColor = [],
			shellTemp;


		switch (feature) {
			case "btnVelocity":
				switch (mode) {
					case 'Current':
						objColor = makeColorLegend(shell, mycolor);
						break;
					case 'diff':
						objColor = makeColorLegend(shellDiff, colorDiff);
						break;

				}
				return objColor;
			case 'btnIsochrones':
				switch (mode) {
					case 'Current':
						objColor = makeColorLegend(shellIso, colorIso);
						break;
					case 'diff':
						objColor = makeColorLegend(shellDiff, colorDiff);
						break;

				}
				return objColor;
			case 'btnAccessibility':
				switch (mode) {
					case 'Current':
						objColor = makeColorLegend(shellAccess, colorAccess);
						break;
					case 'diff':
						objColor = makeColorLegend(shellDiff, colorDiff);
						break;

				}
				return objColor;
			case 'btnPotPop':
				switch (mode) {
					case 'Current':
						objColor = makeColorLegend(shellIso, colorIso);
						break;
					case 'diff':
						objColor = makeColorLegend(shellDiffAccess, colorAccessDiff);
						break;

				}
				return objColor;
		}

	},
	'title' () {
		let feature = Template.quantityButtons.modeSelectedRV.get();
		//let mode =	Template.quantityButtons.modeSelectedRV.get();

		switch (feature) {
			case 'btnVelocity':
				return {
					title: 'access-velocity',
					'unity': '[km/h]'
				};
			case 'btnAccessibility':
				return {
					title: 'accessibility',
					'unity': ''
				};
			case 'btnPotPop':
				return {
					title: 'potential population',
					'unity': '[Thousand]'
				};
			case 'btnAccessibility':
				return {
					title: 'btnIsochrones',
					'unity': 'tima'
				};
		}
	}
});

Template.legendBudget.helpers({
	'budget' () {
		return costLines(Template.body.collection.metroLines).toFixed(0);
	},
	'notBudget' () {
		allertNoBadget();
	}
});


export const allertNoBadget = function() {
	var bootstrap_alert = function() {};
	bootstrap_alert.warning = function(message) {
		if (message == '') {
			$('#alertBudget').html('');
		} else {
			$('#alertBudget').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>' + message + '</span></div>');
		}
	};
	bootstrap_alert.warning('Not enough budget!');
	window.setTimeout(function() {
		bootstrap_alert.warning('');
	}, 1000);
};


Template.infoInfo.helpers({
	'buttonSelected' (name) {
		//console.log(name);
		return Template.body.data.infoBuildRV.get() == name;
	}
});
