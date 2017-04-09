import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './timeRadioButtons.html';
//import { runCSA, CSAPoint } from '/imports/api/CSA-algorithm/CSA-loop.js';
//import { vel } from '../../api/velocityDb.js';
import { colorShell, colorDiff,styleVelNew, styleVel, styleDiff, styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { hexagon } from '/imports/client/info/hexagons/hex.js';

import { addLine, mapOnClickLine } from '/imports/client/legends/addLinesButtons.js';
import {stopOnClick,stopOnDragend,stopOnDblclick, fireClickMap} from '/imports/client/modify/addStop.js';
import { markerBuild, markerEvent,mapClickAddStopEvent } from '/imports/client/modify/events.js';
import { zeroTime, budget, HexArea, getCity ,timesOfDay, maxDuration } from '/imports/api/parameters.js';

import {loadNewTime} from '/imports/client/scenario/scenario.js';



Template.timeRadioButtons.helpers({

	'getTimes'(){
		return timesOfDay;
	}
});

Template.timeRadioButtons.events({
	'click .timeBtn'(e) {
		var time = parseInt($(e.target).attr("data-time"));
		Template.body.data.timeOfDay.set(time);

	}

});



Template.timeButton.helpers({
	'isActive'(){
		if (this != Template.body.data.timeOfDay.get())
			return '';

		if (Template.body.data.allSetAndReady.get())
			//loadNewTime(Template.body.data.timeOfDay.get());
			/*
			ATTENZIONE: il caricamento dei tempi dallo scenario di default dipende
			da queste due variabili reattive: allSetAndReady è settata dopo il caricamento degli zip,
			timeOfDay è settato valido dopo il caricamento dello scenario di default dal server
			*/
		return ' active ';
	},
	'time'(){
		//console.log("get time " + this);
		return this;
	},
	'hour'(){
		//console.log("get hour " + this);
		return this / 3600;
	}

});
