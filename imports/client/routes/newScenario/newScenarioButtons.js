import { Template }  from 'meteor/templating';
import '/imports/client/routes/newScenario/computeScenario.js'
import '/imports/client/routes/newScenario/newScenarioButtons.html';

/*
import { computeNewHex } from '/imports/client/modify/updateArrays.js';
import { getCity } from '/imports/api/parameters.js';
import { newDragStop, mapOnClickLine ,stopOnClick,stopOnDragend,stopOnDblclick, addLine2DB} from '/imports/client/modify/addStop.js';
import { styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { markerEvent,mapClickAddStopEvent } from '/imports/client/modify/events.js';
import {styleMarkerClicked, styleMarkerUnClicked} from '/imports/client/modify/style.js';
*/
import '/imports/client/routes/newScenario/budget.js';
import {addNewLine, stopAddingStops} from '/imports/client/map/metroLines/metroLinesDraw.js';

Template.newScenarioButtons.onCreated(function(){
	
	Template.newScenarioButtons.data = {}
	//Template.newScenarioButtons.data.nameLine = "";

})

Template.newScenarioButtons.events({
	'click #buttonAddCompute'(e) {
		//adding metroLine
		if(!$('#addLine').hasClass('hidden')){ //addLine è visibile, devo iniziare ad aggiungere
			//console.log(e);
			$('#buttonAddCompute').removeClass('active');
			$('#buttonAddCompute').removeClass('btn-default');
			$('#buttonAddCompute').addClass('btn-danger');

			addNewLine()

			$('.computeDone').toggleClass('hidden');
			$('#buttonAddCompute').removeClass('active');

		}else{
			stopAddingStops();
			$('#buttonAddCompute').removeClass('active');
			$('#buttonAddCompute').removeClass('btn-danger');
			$('#buttonAddCompute').addClass('btn-default');
			$('.computeDone').toggleClass('hidden');
			$('#buttonAddCompute').removeClass('active');
			//console.log('merker Clicked', Template.body.data.markerClicked);
		}

	},
	'click #ComputeNewMap'() {
		if(!Template.body.data.dataLoaded.get()) //se non ho caricato i dati (o non ho finito il nuovo calcolo) non faccio nulla
			return;
		if(Template.body.data.newHexsComputed && !Template.body.data.mapEdited.get()) //se ho iniziato il calcolo o l'ho già finito
			return;

		let city = Router.current().params.city;
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
Template.newScenarioButtons.helpers({
	'dataLoadedGet'(){
		return !Template.newScenario.RV.dataLoaded.get();
	},
	'dataLoadedDisabled'(){
		if(!Template.newScenario.RV.dataLoaded.get())
			return 'disabled';
	},
	'clickOnMap'(){
		return !Template.map.data.map.hasEventListeners('click');
	},
	'computeIcon'() {
		//if (Template.body.data.mapEdited.get()) {
			return '  glyphicon glyphicon-upload ';
		//} else {
			//return ' glyphicon-cog	';
		//}
	}

});
