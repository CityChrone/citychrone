import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import '/imports/client/selector/timeSelector.html'
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';


Template.timeSelector.onCreated(function(){

})

Template.timeSelector.events({
});

Template.timeSelector.helpers({
	'getTimes'(){
		return ['0800', '1200']
	}
});

Template.timeSelector.onRendered(function() {
	this.$('.selectpicker').selectpicker();

});
