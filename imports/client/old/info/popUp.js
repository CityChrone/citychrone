import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import './popUp.html';

import {CSAPoint} from '/imports/api/CSA-algorithm/CSA-loop.js';
import { zeroTime, timesOfDay, maxDuration , getCity, HexArea } from '/imports/api/parameters.js';
import { hexagon} from '/imports/client/info/hexagons/hex.js';
import {isoColor, isoColorNew, color, computeAvgAccessibility}  from '/imports/client/info/hexagons/colorHex.js';
import { updateArrays } from '/imports/client/modify/updateArrays.js';
import { RadarChart } from './RadarChart.js';
import { venuesToName, venuesByType } from '/imports/api/DBs/velocityDb.js';


Template.popUp.events({
});

Template.popUp.helpers({
	'isFeature'(feature) {
		//console.log(this);
		return Template.quantityButtons.quantitySelectedRV.get() == feature;
	},
	'isFeatures'(feature1, feature2) {
		//console.log(this);
		let feaSel = Template.quantityButtons.quantitySelectedRV.get()
		return  (feaSel == feature1 ||  feaSel == feature2 );
	},

	'avgAccessibility'() {
		console.log(this.properties);
		$("#accessPopupChart").html('');

		if (Template.body.data.legendFeature.get() != "btnAccessibility") {
			Template.body.data.popup.update();
			return 'N/A';
		}
		
		var access = Template.body.data.legendHexRV.get() == 'velHex' ? this.properties.accessOld : this.properties.accessNew;
		var maxAccess = _.get(Template, "body.data.defaultScenario.newAccessMax");
		if (!maxAccess || !access)
			return 'N/A';

		var avg = 0.0,
			count = 0, d = [], pes;
		for (var n in maxAccess) {
			if (maxAccess[n]) {
				pes = (access[n] || 0) / maxAccess[n];
				avg += pes;
				d.push({
					axis : venuesByType[n],
					value : parseFloat(pes.toFixed(2))
				});
				count++;
			}
		}
		if (!count)
			return 'N/A';

		window.setTimeout(function(a,b,c) {
			RadarChart.draw(a,b,c);
			//Template.body.data.popup.update();
		}, 200, "#accessPopupChart", [d], {
      w: 200,
      h: 200,
      maxValue: 1.6,
      levels: 6,
      TranslateX: 90,
      TranslateY: 30,
      ExtraWidthX: 240
    });

		window.setTimeout(function(){

			 //$("#accessDivContainer").css("width", "auto");
			 $(".leaflet-popup-content").css("width", "auto");
			 //$("#accessDivContainer").css("height", 300);
		}, 100);

		return (avg * 100 / count).toFixed(0);

	},
	'labelColor'(feature, val) {
		//console.log(this);
		let mode =	Template.quantityButtons.modeSelectedRV.get();
		let selColor = color(feature, mode);
		return "background-color:"+ selColor(val)+';';
	},
	'toString'(feature, val){
		//console.log(val)
		$("#accessPopupChart").html('');
		switch(feature){
			case 'newVels':
				let valFixed = parseFloat(val).toFixed(2);
				if(val > 0){ return valFixed.toString() + ' km/h';}
				else { return 'Not Av.';}
				break;
			case 'newPotPop':		
				valFixed = parseFloat(val/1000).toFixed(0);
				if(val > 0){ return valFixed.toString() + 'K';}
				else { return 'Not Av.';}
				break;

		}
	},
	'dataLoadedGet'(){
		return !Template.body.data.dataLoaded.get();
	},
	'dataLoadedDisabled'(){
		if(!Template.body.data.dataLoaded.get())
			return 'disabled';
	},
	'hasTime'(val){
		console.log(val);
		if(val) return true;
		else return false;
	}
});
