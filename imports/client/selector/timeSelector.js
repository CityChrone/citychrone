import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import '/imports/client/selector/timeSelector.html';
import { clickGeojsonIso } from '/imports/client/map/geojson/hexsGeojson.js'

Template.timeSelector.onCreated(function(){
	Template.timeSelector.timeSelectedRV = new ReactiveVar(false);
	Template.timeSelector.pointIsochrone = [0,0];
	/*$(function() {

  $('.selectpicker').on('change', function(){
    var selected = $(this).find("option:selected").val();
    alert(selected);
  });
  
});*/

})

Template.timeSelector.events({
	'change .timepicker'(e){
		var timeSelected = $(e.target).find("option:selected").val();
		//console.log(timeSelected, Template.quantitySelector.quantitySelectedRV.get())

		if(timeSelected == "average"){
			Template.timeSelector.timeSelectedRV.set("avg");
		}
		else {
			let h = parseInt(timeSelected.slice(0,2))
			let s = h*3600
			//console.log(s.toString(), parseInt(timeSelected.slice(0,2)))
			Template.timeSelector.timeSelectedRV.set(s.toString());
		}
		if(Template.quantitySelector.quantitySelectedRV.get() == 't'){
			//$('.quantityPicker').val('t').trigger('change');
			let eIsochrone = {'target':{'value':"Isochrones"}}
			clickGeojsonIso(Template.timeSelector.pointIsochrone)
			//$('.quantityPicker').selectpicker('val', 't');
			//console.log("tt isochrone")
		}

	} 
});

Template.timeSelector.helpers({
	'getTimes'(){
		//$('.selectpicker').selectpicker('render');
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV;
	    }
		//console.log(templateRV, Router.current().route.getName(), Template.city.RV)
		if(templateRV){
			let scenarioID = templateRV.currentScenario.get()._id
			let scenario = scenarioDB.findOne({'_id':scenarioID})
			if(scenario.moments){
				let times = Object.keys(scenario.moments);
				//console.log(times)
				let timesRet = times.map((time)=>{
					if(time == "avg"){
						return {'time':"average"};
					}
					let timeFormat = moment("1900-01-01 00:00:00").add(time, 'seconds').format("HH:mm")
					return {'time':timeFormat};
				})
				if(Template.quantitySelector.quantitySelectedRV.get() == "t")
					timesRet = timesRet.slice(0,-1)
				//console.log(timesRet);
				return timesRet;
			}
		}
	},
	'render'(){
		//console.log('render', )
		//Template.instance().$('.selectpicker').selectpicker('refresh');
		let func = function(){
			 $('.timepicker').selectpicker('refresh');
			 $('.timepicker').selectpicker('render')
		//console.log('called render func')
			return true
		}
		Meteor.setTimeout(func, 100)
	},
	'isScenario'(){

	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		//console.log(templateRV)
		let scenarioID = templateRV.currentScenario.get()._id
		//console.log(scenarioDB.find({'_id':scenarioID}).count(), scenarioID, scenarioDB.find({'_id':scenarioID}).count() != 0)
		return scenarioDB.find({'_id':scenarioID}).count() != 0;
	},
	'isochroneAvg'(){
		//console.log(this)
		if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
	    //console.log(templateRV.currentScenario.get(), templateRV.currentScenario.get())

	    //if('selectpicker' in $('#quantityPicker'))
	    
	    let quantity = Template.quantitySelector.quantitySelectedRV.get() == "t";
	    let time = this.time == "average";
	    let dis = quantity && time ? "disabled" : "";
	    //console.log(quantity, time, Template.quantitySelector.quantitySelectedRV.get(), this.time, dis)
	    Meteor.setTimeout(function(){$('.timepicker').selectpicker('refresh')}, 500);
	    return dis;

	}

});

Template.timeSelector.onRendered(function() {
	//this.$('.timepicker').selectpicker('render');

});
