import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Blaze } from 'meteor/blaze';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js'
import '/imports/client/routes/newScenario/saveScenario.html';

Template.saveScenario.helpers({
});

Template.saveScenario.events({
});


Template.saveScenario.onCreated(function(){});

Template.saveScenario.onRendered(function(){
	console.log("rendered new scenario!!", this, this.view, this.view.template);
	let currentView = this.view;
	$('.modal').modal('show');
	$('.modal').on('hide.bs.modal', function(e){
		//console.log('hide modal', e);
		//console.log("title", $("#titleScenario").val(), "author", $("#authorScenario").val());
		let currentScenario = Template.newScenario.RV.currentScenario.get();
		currentScenario.name = $("#titleScenario").val();
		currentScenario.author = $("#authorScenario").val();
		Template.newScenario.RV.currentScenario.set(currentScenario);
		Meteor.call("updateNameAuthorScenario", currentScenario.name, currentScenario.author, currentScenario._id);
		Blaze.remove(currentView);


	});
});

