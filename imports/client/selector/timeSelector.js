import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import '/imports/client/selector/timeSelector.html';
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';


Template.timeSelector.onCreated(function(){
	Template.timeSelector.timeSelectedRV = new ReactiveVar(false);
})

Template.timeSelector.events({
	'change .selectpicker'(e){
	//	console.log('selectpicker event', e);
	} 
});

Template.timeSelector.helpers({
	'getTimes'(){
		//$('.selectpicker').selectpicker('render');
		let templateRV = Template.city.RV || Template.newScenario.RV;
		//console.log(templateRV)
		let scenarioID = templateRV.currentScenario.get()._id
		let scenario = scenarioDB.findOne({'_id':scenarioID})
		let times = Object.keys(scenario.moments);
		let timesRet = times.map((time)=>{
			let timeFormat = moment("1900-01-01 00:00:00").add(time, 'seconds').format("HH:mm")
			return {'time':timeFormat};})
		//console.log(times, timesRet[0]);
		//$('.selectpicker').selectpicker('refresh');
		return timesRet;
	},
	'render'(){
		//console.log('render')
		let func = function(){
			$('.selectpicker').selectpicker('refresh');
		//console.log('called render func')
			return true
		}
		Meteor.setTimeout(func, 100)
	},
	'isScenario'(){

		let templateRV = Template.city.RV || Template.newScenario.RV;
		//console.log(templateRV)
		let scenarioID = templateRV.currentScenario.get()._id
		//console.log(scenarioDB.find({'_id':scenarioID}).count(), scenarioID, scenarioDB.find({'_id':scenarioID}).count() != 0)
		return scenarioDB.find({'_id':scenarioID}).count() != 0;
	},
});

Template.timeSelector.onRendered(function() {
	this.$('.selectpicker').selectpicker('render');

});
