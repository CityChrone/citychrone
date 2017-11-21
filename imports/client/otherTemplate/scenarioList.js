import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import * as metroLinesDraw from  '/imports/client/map/metroLines/metroLinesDraw.js';
import '/imports/client/otherTemplate/scenarioList.html';

const showScenario = function(id){
	Meteor.call("giveScenario", id, function(err, risp){
		//console.log(risp)
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
	    if(risp._id.toString() != templateRV.currentScenario.get()._id.toString()){
			templateRV.currentScenario.set(risp);
			templateRV.currentScenarioId.set(risp._id);
			//console.log(Template.metroLinesDraw)
			Template.metroLinesDraw.function.addLines(risp.lines)
		}
		$('#scenarioModal').modal('hide');
	});
};

Template.scenarioList.events({
	'click .showScenario'(e){
		let id = $(e.target).parent().attr("id")
		showScenario(id)
	},
	'click .showScenarioDef'(e){
		let id = $(e.target).attr("id")
		showScenario(id);
	}
});


Template.scenarioList.helpers({
	'scenarioLoaded'(){
		
		return Template.scenarioList.RV.scenarioLoaded.get();
	},
	'getScenarioList'(){
		let city = Router.current().params.city;
		Template.scenarioList.data.pos = 0;
		return scenarioDB.find({'city':city, default:false}, {sort:{'scores.avgVelocityScore':-1, creationDate: -1}});
	},
	'scenarioDef'(){
		let city = Router.current().params.city;
		console.log()
		return scenarioDB.findOne({'city':city, default:true}, {sort:{creationDate: -1}});
	},
	'GiveCurrentScenario'(){
		let templateRV = {}
		    if(Router.current().route.getName() == "newScenario.:city"){
		        templateRV = Template.newScenario.RV;
		    }else{
		        templateRV = Template.city.RV
		    }

		return templateRV.currentScenario.get()
	},

});

Template.scenarioList.onCreated(()=>{
	let city = Router.current().params.city;

	Template.scenarioList.data = {};
	Template.scenarioList.data.pos = 0;

	Template.scenarioList.RV = {};
	Template.scenarioList.RV.scenarioLoaded = new ReactiveVar(false);

	Meteor.subscribe('scenario', city, function(){
		Template.scenarioList.RV.scenarioLoaded.set(true);
		console.log('settet true load scenario', Template.scenarioList.RV.scenarioLoaded.get())
	});

});

Template.scenarioList.onRendered(function(){	
	let currentView = this.view;

	/*$('#scenarioModal').on('hide.bs.modal', function(e){
		Blaze.remove(currentView);
	});*/

});

//********* scenarioListRow *********++

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
	'score'(quantity){
		//console.log(quantity)
		if(quantity == 'avgVelocityScore') return this.scores[quantity].toFixed(3);
		if(quantity == 'avgSocialityScore') return this.scores[quantity].toFixed(0);
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
	},
	'isScenarioDef'(def){
		if(def) return 'success';
	},
	'isCurrent'(_id){
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		//console.log(_id, templateRV.currentScenario.get()._id)
		if(templateRV.currentScenario.get()){
			if(_id._str == templateRV.currentScenario.get()._id._str) return "success";
		}
	},
	'pos'(id){
		let scenario = this;
		let sort = {'scores.avgVelocityScore':-1, creationDate: -1};
		let pos = scenarioDB.find({'city':scenario.city, 'scores.avgVelocityScore':{'$gt':scenario.scores.avgVelocityScore}}).count() + 1;
		//console.log(this, pos, )
		return pos;
	},
});

Template.scenarioDefButton.helpers({
	'giveID'(id){
		if (id === undefined)
			return '---';
		//console.log(eval(id).valueOf());
		return eval(id).valueOf();
	},
	'isCurrent'(_id){
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		//console.log(_id, templateRV.currentScenario.get()._id)
		if(_id._str == templateRV.currentScenario.get()._id._str) return "success";

	},
});


