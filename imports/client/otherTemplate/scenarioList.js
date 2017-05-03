import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import '/imports/client/otherTemplate/scenarioList.html';




Template.scenarioList.events({});


Template.scenarioList.helpers({
	'getScenarioList'(){
		let city = Router.current().params.city;
		console.log( scenarioDB.find({'city':city}, {sort:{'scores.scoreVelocity':-1, creationDate: -1}}).fetch());
		return scenarioDB.find({'city':city, default:false}, {sort:{'scores.scoreVelocity':-1, creationDate: -1}});
	},
});

Template.scenarioList.onCreated(()=>{
	Template.scenarioList.RV = {};
});

Template.scenarioList.onRendered(function(){	
	let currentView = this.view;
	$('#scenarioModal').modal('show');
	$('#scenarioModal').on('hide.bs.modal', function(e){
		console.log(currentView)
		Blaze.remove(currentView);


	});

});

Template.scenarioListRow.helpers({
	'niceDate'(date){
		if (!date)
			return '---';
		//console.log(date);
		var monthNames = [
		  "January", "February", "March",
		  "April", "May", "June", "July",
		  "August", "September", "October",
		  "November", "December"
		];

		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		return day + ' ' + monthNames[monthIndex] + ' ' + year;
	},
	'toFixed'(val, fix){
		if (val === undefined || fix === undefined)
			return '---';
		return val.toFixed(fix);
	},
	'MtoEuro'(val){
		if (val === undefined)
			return '---';
		return (val*1000000).toFixed(0);
	},
	'success'(_id){
		//console.log(_id, Template.body.template.scenario.nameInserted.get() );
		// if(EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id) ){
		// 	return "success";
		// }
	},
	'giveID'(id){
		if (id === undefined)
			return '---';
		//console.log(id, eval(id), id.toString(), eval(id).valueOf());
		return eval(id).valueOf();
	},
	'budget'(quantity){
		let scenarioDef = scenarioDB.findOne({'default':true});
		console.log(quantity, this, scenarioDef);
		return this.scores[quantity] - scenarioDef.scores[quantity]
	},
	'checkID'(_id){
		// if(Template.body.template.scenario.nameInserted.get()){
		// let newId = Template.body.template.scenario.nameInserted.get();
		// //console.log(_id.valueOf(), newId.valueOf(),EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id))
		// return EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id);
		// 	}
		},
	'scoreOncost'(score, cost, fixed){
		if (score === undefined || cost === undefined || fixed === undefined)
			return '---';
		return  (score/cost).toFixed(fixed);
	}
});

