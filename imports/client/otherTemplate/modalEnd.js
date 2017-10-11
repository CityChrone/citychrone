import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/otherTemplate/modalEnd.html';


Template.modalEnd.events({
});


Template.modalEnd.helpers({
	'scenarioInfo'(quantity){
		//console.log('modal end', quantity)
		let templateRV = {}
		    if(Router.current().route.getName() == "newScenario.:city"){
		        templateRV = Template.newScenario.RV;
		    }else{
		        templateRV = Template.city.RV
		    }

		let scenario = templateRV.currentScenario.get();
		if(quantity == 'sumVelocityScore' || quantity == 'avgSocialityScore'){ 
			let city = Router.current().params.city;
			let scenarioDef = scenarioDB.findOne({'default':true, 'city':city});
			//console.log(quantity, this, scenarioDef);
			if(scenarioDef)
				return (this.scores[quantity] - scenarioDef.scores[quantity]).toFixed(0);
			else
				return 0;
		}
		if(quantity == 'name' || quantity == 'author') return scenario[quantity];
		if(quantity == 'pos'){
			let pos = 0;
			pos = scenarioDB.find({'city':scenario.city, 'scores.scoreVelocity': {$gt: scenario.scores.scoreVelocity}}, 
				{ 
					sort: {'scores.scoreVelocity': -1, creationDate: -1 }                                                                                                                   // 39
			}).count()
			return pos + 1;
		} 
		return '--';
	},
	'currentScenario'(){
		return this;
	},
	'shareData'(){
        let scenario = this;
        let scenarioId = scenario._id;
		let description = "\
    	New public transport scenario created for the city of " + this.city ;
    	description += " -- Can you do better? view it, improve it!";
    	let url = 'http://map.citychrone.org/city/' + this.city + '?id=' + this._id; 
    	return { 
    	title: 'CityChrone - science of city, citizen for science - New Public Transport scenario of ' + this.city + ' @citychrone',
    	url: url,
    	description : description,
    	 text : " @citychrone",
    	thumbnail:'http://map.citychrone.org/images/citychroneSharing.png',
    	image:'http://map.citychrone.org/images/citychroneSharing.png'
    	 }
  	},
	'isDefault'(){
		return this.default;
	},
	'firstTime'(){
		let scenario = this;
		if(scenario.firstTime){
			console.log('firstTime')
			$('#scenarioModal').modal('show');
			Meteor.call('updateScenario',{'$set':{'firstTime':false}}, scenario._id)
			return true
		}
		else{
			return false
		}
	}
});

Template.modalEnd.onCreated(()=>{

});

Template.modalEnd.onRendered(function(){	
	$('.tw-share').attr('target','_blank');
    //$('#scenarioModal').modal('show');
	//$('#scenarioModal').on('hide.bs.modal', function(e){
		//console.log("endModal")
		//Blaze.remove(currentView);
	//				});

	let o = $('#shareButtonScenario').children().children().append('share it')
	//console.log(o)

});
