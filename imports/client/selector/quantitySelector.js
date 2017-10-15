import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/quantitySelector.html'
import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import '/imports/client/explanation/quantityDescription.js';
import { clickGeojson } from '/imports/client/map/geojson/hexsGeojson.js';

Template.quantitySelector.onCreated(function(){
	Template.quantitySelector.quantitySelectedRV = new ReactiveVar('velocityScore')
	Template.quantitySelector.quantityDiffSelectedRV = new ReactiveVar(false)

});

export let text2field = {
	'Velocity Score' : 'velocityScore',
	'Sociality Score' : 'socialityScore',
	'Isochrones': 't',
	'Velocity Score - Diff' : 'velocityScoreDiff',
	'Sociality Score - Diff' : 'socialityScoreDiff',
	'No Layer' : 'noLayer'
};
let invertKeys2Value = function(myObj){
	let newObj = {}
	_.forEach(myObj, function(v,key){
		newObj[v] = key;
	});
	return newObj
}
export let field2text = invertKeys2Value(text2field)

let eventQuantitySelected = function(e){
	let target = text2field[e.target.value];
	//console.log('quantity Selòecotr', target)
	if(target == 't'){
		let point = Template.map.data.centerCity || Template.city.collection.points.findOne({}, {sort : {'dTerm':1}})
		clickGeojson(point)
	}else{
		Template.quantitySelector.quantitySelectedRV.set(target);
	}
}

Template.quantitySelector.events({
});

Template.quantitySelector.helpers({
	'nameQuantity'(field){
		//console.log(field, field2text[field])
		return field2text[field]
	},
	'disabled'(quantity){
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
    	console.log(quantity, templateRV, Template.timeSelector.timeSelectedRV)
    	if(templateRV && Template.timeSelector.timeSelectedRV){

    		let scenario = templateRV.currentScenario.get();
			let time = Template.timeSelector.timeSelectedRV.get()
			if((quantity in currentScenario.moments[time])) return "";
		}
		return "disabled";
	},
	'listQuantities'(){
		let listQuantities = [];
	},
	'title'(){
		//let returned = scenarioDB.findOne({'_id':Template.city.RV.currentScenario.get()})
		//console.log(returned, Template.city.RV.currentScenarioId.get())
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		return templateRV.currentScenario.get().name;
	},
	'isNewScenario'(){
		return Router.current().route.getName() == "newScenario.:city"
	},
	'notDefault'(){
		if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
	    //console.log(templateRV.currentScenario.get(), templateRV.currentScenario.get())

	    //if('selectpicker' in $('#quantityPicker'))
	    
	    Meteor.setTimeout(function(){$('#quantityPicker').selectpicker('refresh')}, 500);
	    let dis = templateRV.currentScenario.get().default ? 'disabled' : '';
	    return dis;

	}
});


Template.quantitySelector.onRendered(function() {
	this.$('#quantityPicker').selectpicker('render');

	$('#quantityPicker').on('changed.bs.select', function (e) {
		//console.log('evemnd picker', e)	
		eventQuantitySelected(e);
	});
});
