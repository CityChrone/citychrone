import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import '/imports/client/selector/quantitySelector.html'
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import '/imports/client/explanation/quantityDescription.js';
import { clickGeojson } from '/imports/client/map/geojson/hexsGeojson.js';

Template.quantitySelector.onCreated(function(){
	Template.quantitySelector.quantitySelectedRV = new ReactiveVar('newVels')
	Template.quantitySelector.quantityDiffSelectedRV = new ReactiveVar(false)

});

export let text2field = {
	'Velocity' : 'newVels',
	'Daily Pop' : 'newPotPop',
	'Isochrones': 't',
	'Velocity - Diff' : 'newVelsDiff',
	'Daily Pop - Diff' : 'newPotPopDiff',
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
    	let templateRV = Template.city.RV || Template.newScenario.RV;
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
	}
});


Template.quantitySelector.onRendered(function() {
	this.$('#quantityPicker').selectpicker('render');

	$('#quantityPicker').on('changed.bs.select', function (e) {
		console.log('evemnd picker', e)	
		eventQuantitySelected(e);
	});
});
