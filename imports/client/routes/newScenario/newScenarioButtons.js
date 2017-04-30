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
