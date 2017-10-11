import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import turf from 'turf';
import {stopMarker, radiusCircle, styleMarkerClicked, styleMarkerUnClicked} from '/imports/client/map/markers/stopMarker.js';
import {polyMetro} from '/imports/client/map/metroLines/line.js';
import {markerEvent, mapClickAddStopEvent} from '/imports/client/map/events.js';
import '/imports/client/map/metroLines/metroLinesDraw.html';



Template.metroLinesDraw.helpers({
});

Template.metroLinesDraw.events({});


Template.metroLinesDraw.onCreated(function(){

	//console.log("metroLinesDraw created")
	
	//COLLECTION
	Template.metroLinesDraw.collection = {}
	Template.metroLinesDraw.collection.metroLines = new Mongo.Collection(null);
	Template.metroLinesDraw.collection.stops = new Mongo.Collection(null);
	Template.metroLinesDraw.collection.lines = new Mongo.Collection(null);

	//RV
	Template.metroLinesDraw.RV = {}
	//Template.metroLinesDraw.RV.scenarioComputed = new ReactiveVar(true);
	Template.metroLinesDraw.RV.mapEdited = new ReactiveVar(false); //se è stata modificata dall'utente dall'ultimo salvataggio


	//DATA
	Template.metroLinesDraw.data = {}
	Template.metroLinesDraw.data.polylineMetro = {}



	Template.metroLinesDraw.data.numMaxMetro = 1000;
	Template.metroLinesDraw.data.listNameLines = _.range(1, Template.metroLinesDraw.data.numMaxMetro+1).map((val)=>{return val.toString()})
	Template.metroLinesDraw.data.listNumLines = Array(Template.metroLinesDraw.data.numMaxMetro).fill(0); //number of metros.. (to reset when ranking?)
	Template.metroLinesDraw.data.nameLine = null; //Name lined selected .. (to reset when ranking?)
	//Color New Metro
 	Template.metroLinesDraw.data.nameLine = "";
	Template.metroLinesDraw.data.StopsMarker = {}; //List of marker key-id
	Template.metroLinesDraw.data.newHexsComputed = false;//check in we have to recompute the new Hex
	Template.metroLinesDraw.data.markerClicked = false;
	//Template.metroLinesDraw.data.budget = budget;

	//FUNCTION
	Template.metroLinesDraw.function = {}
    Template.metroLinesDraw.function.colorNewMetro = function(num){

 		let color = ['#CD3C00','#0A09FC','#5CBA4B','#984ea3','#ffff33','#a65628','#f781bf','#999999', '#e41a1c'];
 		return color[num % color.length];
 	};

 	Template.metroLinesDraw.function.addLines = function(lines){
 		Template.metroLinesDraw.RV.mapEdited.set(false);
		Template.metroLinesDraw.collection.metroLines.remove({'temp':true},()=>{
			//console.log(lines)
			lines.forEach((line)=>{
				addLine2DB(line.lineName, line.indexLine, line.stops, line.subline )
			});
		});
 	}


});

Template.metroLinesDraw.onRendered(function(){
	let city = Router.current().params.city;
	Template.metroLinesDraw.data.city = city;

	Meteor.call('giveDataBuildScenario',  city, ['metroLines'], function(err, res){
		observeNewLineChanges(); //observe add new lines when new lines added
		//console.log(res)
	   	res['metroLines'].forEach(function(line, index){
	      if (line.type == 'metro') {
	            line.indexLine = _.indexOf(Template.metroLinesDraw.data.listNumLines, 0);
	        	addLine2DB(line.lineName, line.indexLine, line.stops, line.subline, line.color, line.temp);
	      }
	    
	    });
  	});

  	Template.map.data.map.on('zoomend',function(e){
		let zoom = Template.map.data.map.getZoom();
		let radius = radiusCircle(zoom);
		
		for(let _id in Template.metroLinesDraw.data.StopsMarker){
			let layer = Template.metroLinesDraw.data.StopsMarker[_id];
			layer.setRadius(radius);
			layer.bringToFront()
		}
	});
});


export const stopAddingStops = function(){
	markerEvent(Template.metroLinesDraw.data.StopsMarker,'on');
	mapClickAddStopEvent(Template.map.data.map, 'off');
	let lineAdded = Template.metroLinesDraw.collection.metroLines.findOne({'lineName':Template.metroLinesDraw.data.nameLine});
	let stopsLine = lineAdded.stops;
	let indexToRemove = lineAdded.indexLine;
	if(stopsLine.length <= 1){
		//console.log('remove',Template.metroLinesDraw.data.nameLine);
		Template.metroLinesDraw.collection.metroLines.remove(lineAdded._id);
		Template.metroLinesDraw.data.listNumLines[indexToRemove]--;

		//console.log(Template.metroLinesDraw.data.nameLine,Template.metroLinesDraw.data.listNumLines);
		if(stopsLine.length == 1 && lineAdded.lineName.length <= 3 && !lineAdded.subline){
			let lea_id = stopsLine[0]._leaflet_id;
			//console.log(lea_id, Template.metroLinesDraw.data.StopsMarker, lea_id in Template.metroLinesDraw.data.StopsMarker);
			if(lea_id in Template.metroLinesDraw.data.StopsMarker){
				Template.map.data.map.removeLayer(Template.metroLinesDraw.data.StopsMarker[lea_id]);
			 	delete Template.metroLinesDraw.data.StopsMarker[lea_id];
			}
		}
	}
	if(Template.metroLinesDraw.data.markerClicked){
		Template.metroLinesDraw.data.markerClicked.setStyle(styleMarkerUnClicked);
		Template.metroLinesDraw.data.markerClicked = null;
	}
}

export const addNewLine = function(){
	let indexLine = _.indexOf(Template.metroLinesDraw.data.listNumLines,0);
	Template.metroLinesDraw.data.nameLine = Template.metroLinesDraw.data.listNameLines[indexLine];
	//console.log(indexLine, Template.metroLinesDraw.data.nameLine, Template.metroLinesDraw.data.listNumLines);
	addLine2DB(Template.metroLinesDraw.data.nameLine, indexLine);

	markerEvent(Template.metroLinesDraw.data.StopsMarker,'off');
	mapClickAddStopEvent(Template.map.data.map, 'on');
}


export const addLine2DB = function(lineName, indexLine, stops = [], subline = false, color = null, temp = true){
	Template.metroLinesDraw.data.listNumLines[indexLine]++;
	let colorMetro = color || Template.metroLinesDraw.function.colorNewMetro(indexLine);
	let poly = polyMetro([],colorMetro, temp).addTo(Template.map.data.map);
	let city = Template.metroLinesDraw.data.city;
 	Template.metroLinesDraw.data.polylineMetro[poly._leaflet_id] = poly;
	//Template.body.data.mapEdited.set(true); 
	Template.metroLinesDraw.collection.metroLines.insert({
		city : city,
		lineName : lineName ,
		name : lineName,
		color : colorMetro,
		stops : stops,
		shape : [],
		type : 'metro',
		temp : temp,
		indexLine : indexLine,
		subline : subline,
		'bezier_id': poly._leaflet_id,
	});

};

export const addNewSubLine = function(marker){
	let indexLine = marker.indexLine;
	let latlng = [marker._latlng.lat, marker._latlng.lng]
	let color = marker.colorLine
	addSubLine(latlng, marker._leaflet_id, indexLine, color);
	//console.log(Template.body.data.nameLine);
	//event map add stop on click
	//markerEvent('off', [Template.body.data.clickE, 'dblclick']);
	markerEvent(Template.metroLinesDraw.data.StopsMarker,'off');
	mapClickAddStopEvent(Template.map.data.map, 'on');

	$('.computeDone').toggleClass('hidden');
	$('#buttonAddCompute').removeClass('btn-success');
	$('#buttonAddCompute').addClass('btn-danger');
	Template.metroLinesDraw.data.markerClicked = marker;
	marker.setStyle(styleMarkerClicked);
	//return true;
};


export const addSubLine = function(latlng, _leaflet_id, indexLine, color){

	let subIndex = Template.metroLinesDraw.data.listNumLines[indexLine];
	Template.metroLinesDraw.data.nameLine = Template.metroLinesDraw.data.listNameLines[indexLine]+(subIndex).toString();
	let stopsList = [
		{
			'latlng':latlng,
			'_leaflet_id' : _leaflet_id
		}];
	addLine2DB(Template.metroLinesDraw.data.nameLine, indexLine, stopsList, true, color);
	return Template.metroLinesDraw.data.nameLine;
};

export const removeStop = function(marker){
	marker.remove();
	let lines = Template.metroLinesDraw.collection.metroLines.find({'stops._leaflet_id'  : marker._leaflet_id});
	lines.forEach(function(line){
		let positionToChange = 0;

		for(let index = 0; index< line.stops.length; index++){
			if(line.stops[index]._leaflet_id == marker._leaflet_id){
				positionToChange=index;
				break;
			}
		}
		if(line.stops.length == 2 && (line.lineName.length > 3 || line.subline)){
			res = Template.metroLinesDraw.collection.metroLines.remove(
				{'_id'  : line._id});
			//console.log('line',line, 'res', res)

		}else{
			line.stops.splice(positionToChange,1);
			Template.metroLinesDraw.collection.metroLines.update(
				{'_id'  : line._id},//lineName : markerTarget['lineName']},
				{
					$set:{
						stops : line.stops,
					}
				}
			);
		}
	});
	delete Template.metroLinesDraw.data.StopsMarker[marker['_leaflet_id']];
	Template.metroLinesDraw.data.newHexsComputed = false;
	return true;
};

export const observeNewLineChanges = function(){
	return Template.metroLinesDraw.collection.metroLines.find().observe({
		added : function(newDoc) {
			newL = newDoc.stops.length;

			let line = newDoc
			let layer = {};
			let lineStop = newDoc.stops.map(function(stop){return stop.latlng;});
			//console.log("ADDED!!!", newDoc, lineStop)

	 		if(line.type == 'metro'){
	 			//create of polyline for the metro (only style)
	 			//layer = polyMetro(lineStop,line['color']).addTo(Template.map.data.map);
	 			let StopsMarker = Template.metroLinesDraw.data.StopsMarker;
				newDoc.stops.forEach((stop, index) => {
	 				if( !('_leaflet_id' in stop)){
		 				let marker = stopMarker(stop.latlng, line['color'],line.temp ).addTo(Template.map.data.map);
		 				marker['indexLine'] = line.indexLine;// || _.indexOf(Template.body.data.listNameLines, line.lineName.slice(0,3));
						marker['lineName'] = line.lineName;
						marker['temp'] = line.temp;
						marker.addTo(Template.map.data.map);
		 				line.stops[index]['_leaflet_id'] = marker['_leaflet_id']
		 				Template.metroLinesDraw.data.StopsMarker[marker['_leaflet_id']] = marker;
		 				marker.bringToFront()
		 			}else if(!(stop['_leaflet_id'] in StopsMarker)){
		 				//console.log(stop)
		 				let marker = stopMarker(stop.latlng,line['color'],line.temp).addTo(Template.map.data.map);
		 				marker['indexLine'] = line.indexLine;// || _.indexOf(Template.body.data.listNameLines, line.lineName.slice(0,3));
						marker['lineName'] = line.lineName;
						marker['temp'] = line.temp;
						marker.addTo(Template.map.data.map);
		 				line.stops[index]['_leaflet_id'] = marker['_leaflet_id']
		 				Template.metroLinesDraw.data.StopsMarker[marker['_leaflet_id']] = marker;
		 				marker.bringToFront()
		 			}
	 			});
	 			Template.metroLinesDraw.collection.metroLines.update(
							{'_id'  : line._id},
							{'$set':{ 'stops' :  line.stops} }
				, (err, doc)=>{
					//console.log('update', err, doc, Template.body.collection.metroLines.findOne({'_id'  : line._id}));
				});

	 		}else{
	 			//add non metro lines
	 			layer = polyMetro(listStopsInv,line['color'], line.temp).addTo(Template.map.data.map);

	 		}
		},
		changed : function(newDoc, oldDoc) {
			//Template.body.data.mapEdited.set(true);
			let lineStop = newDoc.stops.map(function(stop){return stop.latlng;});
			//console.log('changed',newDoc)
			if(lineStop.length > 2){
				let smoothPolyLine = turf.bezier(turf.lineString(lineStop),10000, 0.4);
				Template.metroLinesDraw.data.polylineMetro[newDoc.bezier_id].setLatLngs(smoothPolyLine.geometry.coordinates);
			}
			else if(lineStop.length == 2){
				Template.metroLinesDraw.data.polylineMetro[newDoc.bezier_id].setLatLngs(lineStop);
			}else if(lineStop.length == 1){
				if(newDoc.bezier_id in Template.metroLinesDraw.data.polylineMetro){
					Template.metroLinesDraw.data.polylineMetro[newDoc.bezier_id].setLatLngs(lineStop);
				}
			}
		},
		removed : function(line) {
			//Template.metroLinesDraw.data.mapEdited.set(true);
			//console.log(line)
			if(line.bezier_id in Template.metroLinesDraw.data.polylineMetro){
				//console.log('removed',doc.bezier_id)
				Template.metroLinesDraw.data.polylineMetro[line.bezier_id].remove();
				delete Template.metroLinesDraw.data.polylineMetro[line.bezier_id];

			}
			line.stops.forEach((stop)=>{
				if(stop['_leaflet_id'] in Template.metroLinesDraw.data.StopsMarker){
					let marker = Template.metroLinesDraw.data.StopsMarker[stop['_leaflet_id']]
					if(marker.temp) {
						marker.remove();
						delete Template.metroLinesDraw.data.StopsMarker[stop['_leaflet_id']];
					}
				}
			})
		}
	});
};

