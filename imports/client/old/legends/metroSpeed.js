import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './metroSpeed.html';
// import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';
import { colorShell, colorDiff,styleVelNew, styleVel, styleDiff, styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { hexagon } from '/imports/client/info/hexagons/hex.js';
import { addLine, mapOnClickLine } from '/imports/client/legends/addLinesButtons.js';
import {stopOnClick,stopOnDragend,stopOnDblclick, fireClickMap} from '/imports/client/modify/addStop.js';
import { markerBuild, markerEvent,mapClickAddStopEvent } from '/imports/client/modify/events.js';
import { zeroTime, budget, HexArea, getCity ,timesOfDay, maxDuration } from '/imports/api/parameters.js';



Template.metroSpeed.helpers({

	'getMetros'(){
		return Template.body.collection.metroLines.find({type: 'metro'}, {sort :{'indexLine' : 1, 'name' : 1, 'lineName':1}});
	},
	'getSpeeds'(){
		return metroSpeeds;
	},
	'getFrequencies'(){
		return metroFrequencies;
	},
	'isMetroChosen'(){
		return Template.body.data.currentMetroForSpeed.get() != '';
	}

});

Template.metroSpeed.events({
	'click .metroChooseBtn'(e) {
		var name = $(e.target).attr("data-name");
		Template.body.data.currentMetroForSpeed.set(name);

	},
	'click .metroSpeedBtn'(e) {
		var name = $(e.target).attr("data-name");
		var mName = Template.body.data.currentMetroForSpeed.get();
		if (!mName)
			return;

		//Template.body.data.currentMetroForSpeed.set(name);
		// var currentMetro = Template.body.collection.metroLines.findOne({lineName: mName}, {sort :{'lineName':1}});
		// if (!currentMetro)
		// 	return;
		Template.body.collection.metroLines.update(
					{'lineName'  : mName},
					{'$set':{ 'speedName' :  name} } 	, function (err, doc) {
		});

	},
	'click .metroFreqBtn'(e) {
		var name = $(e.target).attr("data-name");
		var mName = Template.body.data.currentMetroForSpeed.get();
		if (!mName)
			return;

		//Template.body.data.currentMetroForSpeed.set(name);
		// var currentMetro = Template.body.collection.metroLines.findOne({lineName: mName}, {sort :{'lineName':1}});
		// if (!currentMetro)
		// 	return;
		Template.body.collection.metroLines.update(
					{'lineName'  : mName},
					{'$set':{ 'frequencyName' :  name} } 	, function (err, doc) {
		});


	}
});


Template.metroChooseButton.helpers({
	'isActive'(){
		if (this.lineName != Template.body.data.currentMetroForSpeed.get())
			return '';

		return ' active ';
	}
});


Template.metroSpeedButton.helpers({
	'isActive'(){
		var mName = Template.body.data.currentMetroForSpeed.get();
		if (!mName)
			return '';

		var currentMetro = Template.body.collection.metroLines.findOne({lineName: mName}, {sort :{'lineName':1}});
		if (!currentMetro)
			return '';

		if (this.name != currentMetro.speedName)
			return '';

		return ' active ';
	}

});



Template.metroFreqButton.helpers({
	'isActive'(){
		var mName = Template.body.data.currentMetroForSpeed.get();
		if (!mName)
			return '';

		var currentMetro = Template.body.collection.metroLines.findOne({lineName: mName}, {sort :{'lineName':1}});
		if (!currentMetro)
			return '';

		if (this.name != currentMetro.frequencyName)
			return '';

		return ' active ';
	}

});
