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

let text2field = {
	'Velocity' : 'newVels',
	'Daily Pop' : 'newPotPop',
	'Isochrones': 't'
};
let invertKeys2Value = function(myObj){
	let newObj = {}
	_.forEach(myObj, function(v,key){
		newObj[v] = key;
	});
	return newObj
}
let field2text = invertKeys2Value(text2field)

let eventQuantitySelected = function(e){
	let target = text2field[e.target.value];
	//console.log('quantity Selòecotr', target)
	if(target == 't'){
		let point = Template.map.data.centerCity || Template.city.collection.points.findOne({}, {sort : {'dTerm':1}})
		clickGeojson(point)
		/*let scenario = {};
		let startTime = Template.timeSelector.timeSelectedRV.get();
		let scenarioID = Template.city.RV.currentScenarioId.get();
		Meteor.call('isochrone', [point, scenarioID, startTime], (error, result) => {
			let modifier = 'moments.'+ startTime.toString() + '.t'
			let toSet = {}
			toSet[modifier] = result
			scenarioDB.update({'_id':scenarioID}, {'$set':toSet}, (err)=>{
				if(err){ console.log(err)
				}
				else{
					let scenarioUpdated = scenarioDB.findOne({'_id':scenarioID})
					//console.log('return isochrone server side', result, scenarioID, scenarioUpdated, err);
					Template.quantitySelector.quantitySelectedRV.set(target);
				}
				return true;
			});
		});*/
		//computeIsochrone(point, scenario)
	}else{
		Template.quantitySelector.quantitySelectedRV.set(target);
	}
}

Template.quantitySelector.events({
});

Template.quantitySelector.helpers({
	'nameQuantity'(field){
		console.log(field, field2text[field])
		return field2text[field]
	}
});


Template.quantitySelector.onRendered(function() {
		
	$('#quantityPicker').on('changed.bs.select', function (e) {
		console.log('evemnd picker', e)	
		eventQuantitySelected(e);
	});
});
