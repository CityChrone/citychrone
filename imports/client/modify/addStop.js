import 'leaflet';
import { Template } from 'meteor/templating';
import turf from 'turf';
import { getCity } from '/imports/api/parameters.js';
import {polyMetro, stopMarker, styleMarkerClicked, styleMarker, styleMarkerUnClicked} from '/imports/client/modify/style.js';
import {CheckCostAddStop, CheckCostDragStop} from '/imports/client/legends/budget.js';
import {allertNoBadget} from '/imports/client/legends/legends.js';
import {markerEvent, mapClickAddStopEvent} from '/imports/client/modify/events.js';
import { popUpMarker } from '/imports/client/modify/popUpMarker.js';



export const mapClickAddStop = function(e){
	//console.log('click!!', e);
	L.DomEvent.stopPropagation(e);
	let latlng = [e.latlng.lat, e.latlng.lng];
	let stopTemp = {'latlng':latlng};
	let lineName = Template.body.data.nameLine;
	let check = CheckCostAddStop(Template.body.collection.metroLines,stopTemp,lineName);
	if(check){
		if(Template.body.data.markerClicked != null){
			Template.body.data.markerClicked.setStyle(styleMarkerUnClicked);
		}

		let marker = addMarkerStop(latlng, lineName);
		Template.body.data.markerClicked = marker;
		marker.setStyle(styleMarkerClicked);
		Template.body.data.mapEdited.set(true);
	}else{
		allertNoBadget();
	}
};

export const addMarkerStop = function(latlng, lineName){
	let line = Template.body.collection.metroLines.findOne({'lineName': lineName});
	console.log(line, lineName);
	Template.body.data.mapEdited.set(true);
  let marker = giveDragMarkerStop(latlng, lineName, line['color'], line['indexLine']);
	marker.addTo(Template.body.data.map);
	Template.body.data.StopsMarker[marker['_leaflet_id']] = marker;
	var city = getCity();
	Template.body.collection.metroLines
	.update({'city':city, 'lineName': lineName},
	{'$push':{
		'stops':{
			'latlng' : latlng,
			'_leaflet_id' : marker._leaflet_id
		}
	}});
	return marker
}

export const giveDragMarkerStop = function(latlng, lineName, colorLine, indexLine){
	let markerStop = stopMarker(latlng,colorLine, true);
	markerStop['temp'] = true;
	markerStop['indexLine'] = indexLine;
	markerStop['lineName'] = lineName;
	markerStop.on('dragend', stopOnDragend);
	//Template.body.data.mapEdited.set(true);
	return markerStop;
};


export const stopOnDblclick = function(e){
	e.target.remove();
	Template.body.data.mapEdited.set(true);
	let markerTarget = e.target;
	let lines = Template.body.collection.metroLines.find({'stops._leaflet_id'  : markerTarget._leaflet_id});
	lines.forEach(function(line){
		let positionToChange = 0;

		for(let index = 0; index< line.stops.length; index++){
			if(line.stops[index]._leaflet_id == markerTarget._leaflet_id){
				positionToChange=index;
				break;
			}
		}
		if(line.stops.length == 2 && (line.lineName.length > 3 || line.subline)){
			res = Template.body.collection.metroLines.remove(
				{'_id'  : line._id});
			//console.log('line',line, 'res', res)

		}else{
			line.stops.splice(positionToChange,1);
			Template.body.collection.metroLines.update(
				{'_id'  : line._id},//lineName : markerTarget['lineName']},
				{
					$set:{
						stops : line.stops,
					}
				}
			);
		}
	});
	delete Template.body.data.StopsMarker[markerTarget['_leaflet_id']];
	Template.body.data.newHexsComputed = false;
	return false;
};

export const stopOnDragend = function(e){
	L.DomEvent.stopPropagation(e);
	Template.body.data.mapEdited.set(true);
	let markerTarget = e.target;
	let lines = Template.body.collection.metroLines.find({'stops._leaflet_id' : markerTarget._leaflet_id});

	console.log('dragENd!!', e, lines.fetch() );
	let stopTemp = {'latlng':[markerTarget._latlng.lat, markerTarget._latlng.lng]};
	let check = CheckCostDragStop(Template.body.collection.metroLines, markerTarget);
	//console.log(check, 'check', lines.fetch(), markerTarget, Template.body.collection.metroLines.find({city:city,temp:true}).fetch() );
	if(check){
		lines.forEach(function(lineToChange){
			let positionToChange = _.findIndex(lineToChange.stops, function(stop){ return stop._leaflet_id == markerTarget._leaflet_id;});
			let listStopUpdate = 'stops.' + positionToChange.toString()+'.latlng';
			let stopTemp = {
			'latlng':[markerTarget._latlng.lat, markerTarget._latlng.lng],
			'_leaflet_id':markerTarget._leaflet_id
			};
			lineToChange.stops.splice(positionToChange,1, stopTemp);
			let upRes = Template.body.collection.metroLines.update(
			{'_id'  : lineToChange._id},//lineName : markerTarget['lineName']},
			{
				$set:{
					'stops' : lineToChange.stops
					}
			}
		);

		var city = getCity();
		console.log(positionToChange, [e.target._latlng.lat, e.target._latlng.lng], listStopUpdate,upRes, Template.body.collection.metroLines.find({city:city,temp:true}).fetch())
		//Template.body.data.arraysComputed = false;
		Template.body.data.newHexsComputed = false;
	});
	}else{
		listStops = Template.body.collection.metroLines.findOne(
			{'stops._leaflet_id'  : markerTarget._leaflet_id}//lineName : markerTarget['lineName']},
			).stops;
		let latlng = [];
		for(let i in listStops){
			if(listStops[i]._leaflet_id == markerTarget._leaflet_id){
				latlng = listStops[i].latlng;
				break;
			}
		}
		markerTarget.setLatLng(latlng);
		allertNoBadget();
	}
	return false;
};

export const stopOnCLickPopUp = function(e){
	//console.log('soptOnCLickMAker')
	let marker = e.target;
	if(Template.body.data.blazePopUpMarker != -1){
		Blaze.remove(Template.body.data.blazePopUpMarker[1]);
	}
	const container = L.DomUtil.create('div', 'markerPopup');
	L.DomEvent.disableClickPropagation(container);
	Template.body.data.blazePopUpMarker=[marker];
	Template.body.data.blazePopUpMarker.push(Blaze.renderWithData(Template.popUpMarker, marker, container));
	Template.body.data.popupMarker.setContent(container);
	Template.body.data.popupMarker.setLatLng(e.latlng);
	Template.body.data.popupMarker.openOn(Template.body.data.map);
};

export const addLine2DB = function(city, lineName, indexLine, stopsList = [], speed="Med", freq="Med", subline = false){
	Template.body.data.listNumLines[indexLine]++;
	let colorMetro = Template.body.function.colorNewMetro(indexLine);
	let poly = polyMetro([],colorMetro).addTo(Template.body.data.map);
 	Template.body.data.polylineMetro[poly._leaflet_id] = poly;
	Template.body.data.mapEdited.set(true);
	Template.body.collection.metroLines.insert({
		city : city,
		lineName : lineName ,
		name : lineName,
		color : colorMetro,
		stops : stopsList,
		shape : [],
		type : 'metro',
		temp : true,
		indexLine : indexLine,
		subline : subline,
		'bezier_id': poly._leaflet_id,
		speedName : speed,
		frequencyName : freq
	});

};

export const addSubLine = function(latlng, _leaflet_id, indexLine, city, speed="Med", freq="Med"){
	let subIndex = Template.body.data.listNumLines[indexLine];
	Template.body.data.nameLine = Template.body.data.listNameLines[indexLine]+(subIndex).toString();
	let stopsList = [
		{
			'latlng':latlng,
			'_leaflet_id' : _leaflet_id
		}];
	addLine2DB(city, Template.body.data.nameLine, indexLine, stopsList, speed, freq, true);
	return Template.body.data.nameLine;
};

export const stopOnClick = function(e, city){
	let markerTarget = e.target
	let indexLine = markerTarget.indexLine;
	let latlng = [e.target._latlng.lat, e.target._latlng.lng]
	addSubLine(latlng, markerTarget._leaflet_id, indexLine, city);
	//console.log(Template.body.data.nameLine);
	//event map add stop on click
	L.DomEvent.stopPropagation(e);
	//markerEvent('off', [Template.body.data.clickE, 'dblclick']);
	mapClickAddStopEvent('on');

	$('.computeDone').toggleClass('hidden');
	$('#buttonAddCompute').removeClass('btn-success');
	$('#buttonAddCompute').addClass('btn-danger');
	Template.body.data.markerClicked = markerTarget;
	markerTarget.setStyle(styleMarkerClicked);
	return false;
};

//export const addStopsLine()


export const observeNewLineChanges = function(){
	var city = getCity();
	return Template.body.collection.metroLines.find({city:city}).observe({
		added : function(newDoc) {
			//Template.body.data.mapEdited.set(true);
			//oldL = oldDoc.stops.length;
			newL = newDoc.stops.length;

			let line = newDoc
			let layer = {};
	 		if(line.type == 'metro'){
	 			//create of polyline for the metro (only style)
	 			layer = polyMetro(line['shape'],line['color']).addTo(Template.body.data.map);
				line.stops.forEach((stop, index) => {
	 				if( !('_leaflet_id' in stop)){
	 					console.log(stop)
		 				let marker = stopMarker(stop.latlng,line['color']).addTo(Template.body.data.map);
		 					 					console.log(stop)
		 				marker['indexLine'] = line.indexLine;// || _.indexOf(Template.body.data.listNameLines, line.lineName.slice(0,3));
						marker['lineName'] = line.lineName;
						marker['temp'] = false;
						marker.addTo(Template.body.data.map);
								 					 					console.log(stop)
						marker.bringToBack();//adding to the list of markers to change visibility when swiching between info-build
								 					 					console.log(stop)

						//Template.body.data.StopsMarker[marker['_leaflet_id']] = marker; //console.log('stops.' + stop.toString() + '._leaflet_id')
	//Ha che mi serve?!?!
			 				console.log(stop)

		 				let arrayP = 'stops.' + stop.toString() + '._leaflet_id';
		 				line.stops[index]['_leaflet_id'] = marker['_leaflet_id']
		 				console.log(stop)
		 			}
	 			});
	 			Template.body.collection.metroLines.update(
							{'_id'  : line._id},
							{'$set':{ 'stops' :  line.stops} }
				, (err, doc)=>{
					//console.log('update', err, doc, Template.body.collection.metroLines.findOne({'_id'  : line._id}));
				});

	 		}else{
	 			//add non metro lines
	 			layer = polyMetro(line['shape'],line['color']).addTo(Template.body.data.map);

	 		}
	 		if(!$('#buttonBuild').hasClass('active')){
	 			//bring to back in already clicked on build;
	 			layer.bringToBack();
	 		}
			//}
		},
		changed : function(newDoc) {
			//Template.body.data.mapEdited.set(true);
			let lineStop = newDoc.stops.map(function(stop){return stop.latlng;});
			// console.log('changed',newDoc)
			if(newDoc.temp){
				if(lineStop.length > 2){
						let smoothPolyLine = turf.bezier(turf.lineString(lineStop),10000, 0.4);
						Template.body.data.polylineMetro[newDoc.bezier_id].setLatLngs(smoothPolyLine.geometry.coordinates);
					}
				else if(lineStop.length == 2){
						Template.body.data.polylineMetro[newDoc.bezier_id].setLatLngs(lineStop);
				}else if(lineStop.length == 1){
					if(newDoc.bezier_id in Template.body.data.polylineMetro){
						Template.body.data.polylineMetro[newDoc.bezier_id].setLatLngs(lineStop);
					}
				}
			}

		},
		removed : function(doc) {
			Template.body.data.mapEdited.set(true);
			if(doc.bezier_id in Template.body.data.polylineMetro){
				//console.log('removed',doc.bezier_id)
				Template.body.data.polylineMetro[doc.bezier_id].remove();
			}
		}
	});
};
