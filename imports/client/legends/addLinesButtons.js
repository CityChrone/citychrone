import { Template }  from 'meteor/templating';

import '/imports/client/legends/addLinesButtons.html';

import { computeNewHex } from '/imports/client/modify/updateArrays.js';
import { getCity } from '/imports/api/parameters.js';
import { newDragStop, mapOnClickLine ,stopOnClick,stopOnDragend,stopOnDblclick, addLine2DB} from '/imports/client/modify/addStop.js';
import { styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { markerEvent,mapClickAddStopEvent } from '/imports/client/modify/events.js';
import {styleMarkerClicked, styleMarkerUnClicked} from '/imports/client/modify/style.js';


Template.addLinesButtons.events({
	'click #buttonAddCompute'(e) {
		//adding metroLine
		if(!$('#addLine').hasClass('hidden')){ //addLine è visibile, devo iniziare ad aggiungere
			console.log(e);
			$('#buttonAddCompute').removeClass('active');
			$('#buttonAddCompute').removeClass('btn-default');
			$('#buttonAddCompute').addClass('btn-danger');

			let indexLine = _.indexOf(Template.body.data.listNumLines,0);
			//console.log(indexLine, Template.body.data.listNumLines);
			Template.body.data.nameLine = Template.body.data.listNameLines[indexLine];
			const city = getCity();
			addLine2DB(city, Template.body.data.nameLine, indexLine);

			markerEvent('off');
			mapClickAddStopEvent('on');

			$('.computeDone').toggleClass('hidden');
			$('#buttonAddCompute').removeClass('active');

		}else{
			markerEvent('on');
			mapClickAddStopEvent('off');

			$('#buttonAddCompute').removeClass('active');
			$('#buttonAddCompute').removeClass('btn-danger');
			$('#buttonAddCompute').addClass('btn-default');
			$('.computeDone').toggleClass('hidden');
			let lineAdded = Template.body.collection.metroLines.findOne({'lineName':Template.body.data.nameLine});
			let stopsLine = lineAdded.stops;
			let indexToRemove = lineAdded.indexLine;
			if(stopsLine.length <= 1){
				console.log('remove',Template.body.data.nameLine);
				Template.body.collection.metroLines.remove(lineAdded._id);
				Template.body.data.listNumLines[indexToRemove]--;

				console.log(Template.body.data.nameLine,Template.body.data.listNumLines);
				if(stopsLine.length == 1 && lineAdded.lineName.length <= 3 && !lineAdded.subline){
					let lea_id = stopsLine[0]._leaflet_id;
					console.log(lea_id, Template.body.data.StopsMarker, lea_id in Template.body.data.StopsMarker);
					if(lea_id in Template.body.data.StopsMarker){
						Template.body.data.map.removeLayer(Template.body.data.StopsMarker[lea_id]);
					 	delete Template.body.data.StopsMarker[lea_id];

					}
				}
			}
			$('#buttonAddCompute').removeClass('active');
			console.log('merker Clicked', Template.body.data.markerClicked);
			if(Template.body.data.markerClicked != null){
				Template.body.data.markerClicked.setStyle(styleMarkerUnClicked);
				Template.body.data.markerClicked = null;
			}
		}

	},
	'click #ComputeNewMap'() {
		if(!Template.body.data.dataLoaded.get()) //se non ho caricato i dati (o non ho finito il nuovo calcolo) non faccio nulla
			return;
		if(Template.body.data.newHexsComputed && !Template.body.data.mapEdited.get()) //se ho iniziato il calcolo o l'ho già finito
			return;

		var city = getCity();
		var newName;

		if (Template.body.data.mapEdited.get() && Template.body.template.scenario) {
			Template.body.template.scenario.currentScenarioId = null;
			Template.body.template.scenario.currentScenario = null;
			var defName = "Scenario " + moment().format("DD/MM/YYYY HH:mm:ss");
			newName = window.prompt("Give a name to this scenario", defName);
			if (newName === "") {
				newName = defName;
			} else if (!newName)
				return;
		}

		if(!$('#endMetro').hasClass('hidden')){
			$('#endMetro').trigger('click'); //finisco di aggiungere la linea
		}

		for(let hexId in Template.body.data.listHex){
			let hexagons = Template.body.data.listHex[hexId];
			hexagons.hex.properties.vAvgNew = -1;
			hexagons.hex.properties.accessNew = {};
		}

		$('#buttonInfo').trigger('click');
		if($('#velNewHex').hasClass('active')){
			Template.body.data.geoJson.setStyle(styleHex);
		}else{
			$('#velNewHex').trigger('click');
		}

		if (Template.body.data.mapEdited.get() && Template.body.template.scenario) {
			Template.body.template.scenario.createScenario(newName);
		}

		Template.body.data.dataLoaded.set(false); //verrà settato a true alla fine del calcolo
		Meteor.setTimeout(computeNewHex, 100);
		$('#ComputeNewMap').removeClass('active');


	},
	'click #reload'(){
		 location.reload();
	}
});
Template.addLinesButtons.helpers({
	'dataLoadedGet'(){
		return !Template.body.data.dataLoaded.get();
	},
	'dataLoadedDisabled'(){
		if(!Template.body.data.dataLoaded.get())
			return 'disabled';
	},
	'clickOnMap'(){
		return !Template.body.data.map.hasEventListeners('click');
	},
	'computeIcon'() {
		if (Template.body.data.mapEdited.get()) {
			return '  glyphicon glyphicon-upload ';
		} else {
			return ' glyphicon-cog	';
		}
	}

});
