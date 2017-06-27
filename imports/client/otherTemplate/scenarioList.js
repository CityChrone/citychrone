import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import * as metroLinesDraw from  '/imports/client/map/metroLines/metroLinesDraw.js';
import '/imports/client/otherTemplate/scenarioList.html';


Template.scenarioList.events({
	'click .showScenario'(e){
		let id = $(e.target).attr("id")
		console.log(id);

		Meteor.call("giveScenario", id, function(err, risp){
			//console.log(risp, Template.computeScenario.collection.stops.find({temp:true}).count());
			//Template.computeScenario.collection.stops.remove({temp:true});
			//console.log(risp, Template.computeScenario.collection.stops.find({temp:true}).count());
		    let templateRV = {}
		    if(Router.current().route.getName() == "newScenario.:city"){
		        templateRV = Template.newScenario.RV;
		    }else{
		        templateRV = Template.city.RV
		    }
			templateRV.currentScenario.set(risp);
			templateRV.currentScenarioId.set(risp._id);
			console.log(Template.metroLinesDraw)
			Template.metroLinesDraw.function.addLines(risp.lines)
			$('#scenarioModal').modal('hide');

		});
	}
});


Template.scenarioList.helpers({
	'getScenarioList'(){
		let city = Router.current().params.city;
		return scenarioDB.find({'city':city, default:false}, {sort:{'scores.scoreVelocity':-1, creationDate: -1}});
	},
	'scenarioDef'(){
		let city = Router.current().params.city;
		return scenarioDB.findOne({'city':city, default:true}, {sort:{creationDate: -1}});
	}
});

Template.scenarioList.onCreated(()=>{
	Template.scenarioList.RV = {};
	Template.scenarioList.data = {};
	Template.scenarioList.data.pos = 0;
});

Template.scenarioList.onRendered(function(){	
	let currentView = this.view;
	$('#scenarioModal').modal('show');
	$('#scenarioModal').on('hide.bs.modal', function(e){
		Blaze.remove(currentView);
	});

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
		let city = Router.current().params.city;
		let scenarioDef = scenarioDB.findOne({'default':true, 'city':city});
		//console.log(quantity, this, scenarioDef);
		return (this.scores[quantity] - scenarioDef.scores[quantity]).toFixed(0);
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
		if(_id._str == templateRV.currentScenario.get()._id._str) return "success";

	},
	'pos'(){
		Template.scenarioList.data.pos += 1
		return Template.scenarioList.data.pos;
	}

});

