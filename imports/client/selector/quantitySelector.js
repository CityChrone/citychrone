import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import '/imports/client/selector/quantitySelector.html'
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';

Template.quantitySelector.onCreated(function(){
	Template.quantitySelector.quantitySelectedRV = new ReactiveVar('newVels')
	Template.quantitySelector.quantityDiffSelectedRV = new ReactiveVar(false)

})

Template.quantitySelector.events({
	'click .quantityButton' (e) {
		if (!$(e.target).hasClass('active')) {
			$('.quantityButton').removeClass('active');
			$(e.target).addClass('active');
			let target = e.target.id;
			console.log(target)
			if(target == 't'){
				let point = Template.city.collection.points.findOne({}, {sort : {'dTerm':1}})
				let scenario = {};
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
				});
				//computeIsochrone(point, scenario)
			}else{
				Template.quantitySelector.quantitySelectedRV.set(target);
			}
		}
	},
});

Template.quantitySelector.onRendered(function() {
});
