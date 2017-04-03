import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './selectorModeButtons.html';
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';
import { colorShell, colorDiff,styleVelNew, styleVel, styleDiff, styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { hexagon } from '/imports/client/info/hexagons/hex.js';
import { addLine, mapOnClickLine } from '/imports/client/legends/addLinesButtons.js';
import {stopOnClick,stopOnDragend,stopOnDblclick, fireClickMap} from '/imports/client/modify/addStop.js';
import { markerBuild, markerEvent,mapClickAddStopEvent } from '/imports/client/modify/events.js';


Template.selectorModeButtons.helpers({
	'dataLoadedGet'(){
		return true;//!Template.body.data.scenarioComputed.get();
	},
	'dataLoadedDisabled'(){
		if(!Template.body.data.scenarioComputed.get())
			return 'disabled';
	},
	'isCreateNewScenario'(){
		return Template.body.data.isCreateNewScenario.get();
	}
});

Template.selectorModeButtons.events({
	'click #buttonBuild'(e) {
		if(Template.body.data.scenarioComputed.get()){
			//Template.body.data.map.dragging.enable();

		 	if(!$('#buttonBuild').hasClass('active')){
				markerBuild('on');
				markerEvent('on');
				Template.body.data.legendAddLines.addTo(Template.body.data.map);
				Template.body.data.speedButtons.addTo(Template.body.data.map);
				//Template.body.data.infoInfoLegend.remove();
				$('#buttonBuild').addClass('active');
	    	$('#buttonInfo').removeClass('active');
	    	Template.body.data.infoBuildRV.set('build');
			}
		}
	},
	'click #buttonInfo'() {
  	if(!$('#buttonInfo').hasClass('active')){
  		Template.body.data.StopsMarkerInfo = {};
  		//Template.body.data.map.dragging.disable();

			markerBuild('off');
			//markerEvent('off');
			mapClickAddStopEvent('off');

		 	$('#buttonBuild').removeClass('active');
	    $('#buttonInfo').addClass('active');

			Template.body.data.legendAddLines.remove();
			Template.body.data.speedButtons.remove();
			//Template.body.data.infoInfoLegend.addTo(Template.body.data.map);
			Template.body.data.infoBuildRV.set('info');
			if(!Template.body.data.map.hasLayer(Template.body.data.geoJson)){
				Template.body.data.buttonsHex = 'velHex';
				Template.body.data.buttonsFeature = 'btnVelocity';
				Template.body.data.geoJson.addTo(Template.body.data.map);
				$('#velHex').addClass('active');
			}
		}
	},
	'click #buttonRank'(e) {
		//console.log(e);
		$('#rankModal').modal('show');
	},
	'click #buttonScenario'(e) {
		//console.log(e);
		$('#scenarioModal').modal('show');
	},
});
