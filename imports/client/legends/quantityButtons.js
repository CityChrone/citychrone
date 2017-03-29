import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';
import {
	colorShell,
	colorDiff,
	styleVelNew,
	styleVel,
	styleDiff,
	styleHex
} from '/imports/client/info/hexagons/colorHex.js';
import {
	hexagon
} from '/imports/client/info/hexagons/hex.js';
import {
	addLine,
	mapOnClickLine
} from '/imports/client/legends/addLinesButtons.js';
import {
	stopOnClick,
	stopOnDragend,
	stopOnDblclick,
	fireClickMap
} from '/imports/client/modify/addStop.js';
import {
	markerBuild,
	markerEvent,
	mapClickEvent
} from '/imports/client/modify/events.js';
import {
	findFieldtoUpdate,
	updateGeojson,
	addGeojson
} from '/imports/client/info/hexagons/unionHexs.js';
import { computeIsochrone } from '/imports/client/modify/updateArrays.js';
import { loadNewTime } from '/imports/client/scenario/scenario.js';
import '/imports/client/legends/quantityButtons.html';


let functionButtonHex = function(mycase) {
	Template.body.data.geoJson.setStyle(styleHex);
};

Template.quantityButtons.onCreated(function(){
	Template.quantityButtons.modeSelectedRV = new ReactiveVar('btnCurrent')
	Template.quantityButtons.quantitySelectedRV = new ReactiveVar('btnVelocity')

})

Template.quantityButtons.events({
	'click .modeButton' (e) {
		if (!$(e.target).hasClass('active')) {
			$('.modeButton').removeClass('active');
			$(e.target).addClass('active');
			let target = e.target.id;
			Template.quantityButtons.modeSelectedRV.set(target);
			//if (Template.body.data.map.hasLayer(Template.body.data.geoJson)) {
			//}
			console.log('click hexShow', target)
			//loadNewTime(Template.body.data.timeOfDay.get())
			//addGeojson();
		}
		// else {

			//if($('#stationButton').hasClass('active')){
			// $(e.target).removeClass('active');
			// Template.body.data.legendHexRV.set(false);
			// Template.body.data.map.removeLayer(Template.body.data.geoJson);
		// }
	},

	'click .quantityButton' (e) {
		if (!$(e.target).hasClass('active')) {
			$('.quantityButton').removeClass('active');
			$(e.target).addClass('active');
			let target = e.target.id;
			Template.body.data.quantitySelectedRV.set(target);
			console.log(target)
			/*if(target == 'btnIsochrones'){
				let point = Template.body.collection.points.findOne({}, {sort : {'dTerm':1}})
				let scenario = {}
				switch(Template.body.data.buttonsHex) {
					case 'velHex':
						scenario = Template.body.data.defaultScenario;
						break;
					case 'velNewHex':
						scenario = Template.body.data.defaultScenario;
						break;
				}
				computeIsochrone(point, scenario)
			}else{
				loadNewTime(Template.body.data.timeOfDay.get())
			}*/
		}
	},
});

Template.quantityButtons.onRendered(function() {
	//Template.body.data.geoJson.addTo(Template.body.data.map);
	Template.body.data.geoJson.setStyle(styleHex);
});
