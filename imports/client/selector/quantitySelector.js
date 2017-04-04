import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import '/imports/client/selector/quantitySelector.html'
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';


Template.quantitySelector.onCreated(function(){
	Template.quantitySelector.quantitySelectedRV = new ReactiveVar('newVels')

})

Template.quantitySelector.events({
	'click .quantityButton' (e) {
		if (!$(e.target).hasClass('active')) {
			$('.quantityButton').removeClass('active');
			$(e.target).addClass('active');
			let target = e.target.id;
			console.log(target)
			if(target == 't'){
				let point = Template.body.collection.points.findOne({}, {sort : {'dTerm':1}})
				let scenario = {};
				let startTime = Template.body.data.timeOfDay.get();
				let scenarioID = Template.scenario.RV.currentScenarioIdRV.get();
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
							Template.quantityButtons.quantitySelectedRV.set(target);
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
