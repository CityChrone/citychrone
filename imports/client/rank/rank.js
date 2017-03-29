import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';

import { ranking } from '/imports/api/DBs/rankDB.js';
import {getCity, budget} from '/imports/api/parameters.js';

import '/imports/client/rank/rankTooltip.js';
import {computeScore} from '/imports/client/budget/computeScore.js'
import { costLines } from '/imports/client/budget/metroCost.js';
import {addMarkerStop, addSubLine, addLine2DB} from '/imports/client/modify/addStop.js';
import { styleHex } from '/imports/client/info/hexagons/colorHex.js';

var city = getCity();

import './rank.html';

Template.rank.events({});

Template.rank.helpers({
	'scroll'(){
	},
	'toInsert'(){
		return Template.body.template.rank.toInsert.get() && Template.body.data.newHexsComputed && Template.body.data.dataLoaded.get();
	},
	'insertRank'(){
		if(Template.body.template.rank.toInsert.get()){
			Template.body.template.rank.toInsert.set(false);
	 		console.log('insert result', Template.body.data.vAvgNewList);
			let velocity = computeScore(Template.body.data.vAvgNewList);
			this._id =  new Mongo.ObjectID();
			let budgetTemp = budget - costLines(Template.body.collection.metroLines);
			let sumVOldTot = Template.body.data.vAvgTot *  Template.body.data.vAvgNewList.length;
			let sumVTot = velocity * Template.body.data.vAvgNewList.length;
			let listNewVel = {}
			for(let hexId in Template.body.data.listHex){
				let hexagons = Template.body.data.listHex[hexId];
				listNewVel[hexId] = hexagons.hex.properties.vAvgNew
			}
			let objToInsert = {
				'name' : '',
				'date'  : new Date(),
				'velocity' : velocity,
				'score' : sumVTot - sumVOldTot,
				'budget' : budgetTemp,
				'lines' : Template.body.collection.metroLines.find({'city':city, 'temp':true}).fetch(),
				'efficency' : ((sumVTot - sumVOldTot) / (costLines(Template.body.collection.metroLines))),
				'city' : city,
				'_id' : this._id,
				'newVels' : listNewVel,
				'new' : true
			};
			Meteor.call('insertNewRank',objToInsert );
		   	Template.body.template.rank.nameInserted.set(this._id);
		   	//console.log(objToInsert)
		}
	},
	'computationFinished'(){
		//console.log('comp finished', Template.body.data.dataLoaded.get(), Template.body.data.newHexsComputed);
		if(Template.body.data.dataLoaded.get()){
			if(Template.body.data.newHexsComputed){
				if(Template.body.template.rank.nameInserted.get() != null){
					//console.log('comp finished', Template.body.data.dataLoaded, Template.body.data.newHexsComputed);
					return true;
				}
			}
		}else{
			return false;
		}
	},
	'getScoreList'(){
		let listRank = ranking.find({city:city}, {sort:{score:-1}}).fetch();
		for(let i = 0; i < listRank.length; i++){
			listRank[i].position = i + 1;
		}
		//console.log(listRank)
		return listRank;
	}
});

Template.rank.onCreated(function(){
	//console.log('rank template created');
	Template.body.template.rank = {};
	Template.body.template.rank.nameInserted = new ReactiveVar(null);
	Template.body.template.rank.toInsert = new ReactiveVar(false);

	//this.data = {};
	//this.data['ciccio'] = 'pippo';
	//console.log(this);
});
Template.rank.onRendered(function(){
	/*$('#rankModal').on('shown.bs.modal', function (e) {
		//let idStr = Template.body.template.rank.nameInserted.get().valueOf();
		console.log('scroll', $("#251e7d019ea904112f30d7b3"))
		console.log('scroll', $("#251e7d019ea904112f30d7b3").offset().top,$('#rankModal'));
		let sectionOffset = $('#' + "251e7d019ea904112f30d7b3").offset();
		$('#rankModal').animate({
    		scrollTop: sectionOffset.top - 30
  		}, "slow");
		//setTimeout($('html, body').animate({scrollTop: $("tr .success").offset().top}, 500),1000)
	});
*/
	$('#rankModal').on('shown.bs.modal', function (e) {
		if(Template.body.template.rank.nameInserted.get()){
		let idStr = Template.body.template.rank.nameInserted.get().valueOf();
		let sectionOffset = $('#' + idStr).offset();
		$('#rankModal').animate({
    		scrollTop: sectionOffset.top - 30
  		}, "slow");
	}
	});

});

 let addLinesFromRank = function(line, ext = false){
	//$('#buttonBuild').trigger('click');

	let stopsStops = line['stops'].slice();
	//console.log('line Stop list ', line, stopsStops);
	line['stops']=[];
	line['shape']=[];
	if(line.lineName.length > 3){
		let indexLine = line.indexLine;
		console.log('subline Rank', line.indexLine, line)
		firstStopLine = Template.body.collection.metroLines.findOne({'stops.latlng' : stopsStops[0].latlng});
		if(firstStopLine == 0){ console.log('error stop not founded');}
		let firstStop = {}
		firstStopLine.stops.forEach(function(stop){
			//console.log(stop.latlng, stopsStops[0].latlng)
			if(stop.latlng[0] == stopsStops[0].latlng[0] && stop.latlng[1] == stopsStops[0].latlng[1]){
				//console.log('setted Firsr Stop', stop, stopsStops[0].latlng);
				firstStop = {'latlng': stopsStops[0].latlng, '_leaflet_id':stop._leaflet_id};
			}
		})
		nameLine = addSubLine(firstStop.latlng, firstStop._leaflet_id, indexLine, line.city);

		line['stops']= [{'latlng': firstStop.latlng, '_leaflet_id':firstStop._leaflet_id}];
		//console.log('firstStop', firstStopLine, line['stops'], firstStop);

		stopsStops.slice(1,).forEach((stop,index)=>{
			//console.log(stop);
			addMarkerStop(stop.latlng, nameLine);
		});
	}else{
		let indexLine = line.indexLine;
		Template.body.data.listNumLines[indexLine]++;
		nameLine = Template.body.data.listNameLines[indexLine];
		console.log(line)
		addLine2DB(line.city, nameLine, indexLine, []);

		//console.log('insertLine2', line);
		stopsStops.forEach((stop,index)=>{
			addMarkerStop(stop.latlng, line.lineName);
		});
	}
}



Template.rankList.events({
	'click .seeResultRank'(e){

		let _id = $(e.target).parent().parent().attr('id');
		let objId = new Mongo.ObjectID(_id)
		let selRank = ranking.findOne({'_id':objId}, {sort:{'_id':1}} );
		//REmove temp marker
		let MarkerDel = []
		for(nameMarker in Template.body.data.StopsMarker){
			let marker = Template.body.data.StopsMarker[nameMarker]
			if(marker.temp){
				Template.body.data.map.removeLayer(marker);
				MarkerDel.push(nameMarker)
			}
		}
		MarkerDel.forEach((markerId)=>{
			delete Template.body.data.StopsMarker[markerId]
		});
		let MarkerDelInfo = []
		for(nameMarkerInfo in Template.body.data.StopsMarkerInfo){
			let markerInfo = Template.body.data.StopsMarkerInfo[nameMarkerInfo]
			if(markerInfo.temp){
				Template.body.data.map.removeLayer(markerInfo);
				MarkerDelInfo.push(markerInfo)
			}
		}
		MarkerDelInfo.forEach((markerId)=>{
			delete Template.body.data.StopsMarkerInfo[markerId]
		});
		//end remove marker

		//reset number Line
		Template.body.data.listNumLines = Template.body.data.listNumLinesDef.slice()
		Template.body.data.nameLine = null;
		//Remove metro Line temp
		Template.body.collection.metroLines.remove({city:city,temp:true},(err,num)=>{
			selRank.lines.forEach((line)=>{
				console.log('line', line, num)
				if(line.temp){
					delete line.bezier_id;
					addLinesFromRank(line);
				}
			});
			$("#buttonBuild").trigger('click');
			$('#rankModal').modal('hide');
			Template.body.data.newHexsComputed = false;

		});
	}
});


Template.rankList.helpers({
	'niceDate'(date){
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
		return val.toFixed(fix);
	},
	'MtoEuro'(val){
		return (val*1000000).toFixed(0);
	},
	'success'(_id){
		//console.log(_id, Template.body.template.rank.nameInserted.get() );
		if(EJSON.equals(Template.body.template.rank.nameInserted.get(), _id) ){
			return "success";
		}
	},
	'giveID'(id){
		//console.log(id, eval(id), id.toString(), eval(id).valueOf());
		return eval(id).valueOf();
	},
	'checkID'(_id){
		if(Template.body.template.rank.nameInserted.get()){
		let newId = Template.body.template.rank.nameInserted.get();
		//console.log(_id.valueOf(), newId.valueOf(),EJSON.equals(Template.body.template.rank.nameInserted.get(), _id))
		return EJSON.equals(Template.body.template.rank.nameInserted.get(), _id);
			}
		},
	'scoreOncost'(score,cost, fixed){
		return  (score/cost).toFixed(fixed);
	}
});
