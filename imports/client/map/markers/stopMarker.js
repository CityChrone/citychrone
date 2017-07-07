import {leaflet} from 'leaflet';
import { Router } from 'meteor/iron:router';
import { CheckCostAddStop, CheckCostDragStop, allertNoBadget } from '/imports/client/routes/newScenario/budget.js';
import '/imports/client/map/popUps/popUpMarker.js';
import 'leaflet-path-drag';

export const styleMarkerClicked = {
			weight : 10,
			opacity : 0.4
		};
export const styleMarkerUnClicked = {
			weight : 3,
			opacity : 1
		};

export const styleMarker = function(color, drag, temp = false){
	let fillColor = drag ? '#808080' : 'white';
	return {'color': color, 
	'fillColor' : fillColor, 
	'fillOpacity':1,			
	'draggable' : drag,
	'opacity' : 1
	};
};


export const stopMarker =  function(latlng, color = null, drag = false, zoom = 12){
	
	let isNewScenario = Router.current().route.getName() == "newScenario.:city"

	if(!isNewScenario) drag = false;

	let marker = L.circleMarker(latlng,
		styleMarker(color, drag)).setRadius(radiusCircle(zoom));
	marker.colorLine = color;
	marker.on('click dblclick', stopOnCLickPopUp);
	marker.on('dragend', stopOnDragend);
	return marker;
};
export const giveDragMarkerStop = function(latlng, lineName, colorLine, indexLine, zoom){
	let markerStop = stopMarker(latlng,colorLine, true, zoom);
	markerStop['temp'] = true;
	markerStop['indexLine'] = indexLine;
	markerStop['lineName'] = lineName;
	//Template.body.data.mapEdited.set(true);
	return markerStop;
};

export const radiusCircle = function(zoom=10){

 	let radius = 10;
 	let limit1 = 13
 	if(zoom>limit1){
		radius = radius + 3*(zoom - limit1);			//layer.redraw();
	}else if(zoom > 12){
		radius = 6;
	}else if(zoom > 10){
		radius = 4;
 	}else{
		radius = 2;
	}
	//console.log(radius, zoom);
 	return radius;
}

export const stopOnCLickPopUp = function(e){
	//console.log("stopOnCLickPopUp")
	if($('#endMetro').hasClass("hidden")){
		let marker = e.target;
		const container = L.DomUtil.create('div', 'markerPopup');
		L.DomEvent.disableClickPropagation(container);
		Blaze.renderWithData(Template.popUpMarker, {'marker':marker}, container);
		let popUp = marker.bindPopup(container)._popup;
		console.log(popUp)
		marker.on('popupclose', function(e){
			console.log('popupclose')
			marker.unbindPopup()
		})

		//var popup = L.popup().setLatLng(latlng).setContent('<p>Hello world!<br />This is a nice popup.</p>')
    //.openOn(map);

		marker.openPopup();
		//console.log("stopOnCLickPopUp")
	}
};
export const addMarkerStop = function(latlng, lineName){
	let line = Template.metroLinesDraw.collection.metroLines.findOne({'lineName': lineName});
	//console.log(line, lineName);
  let marker = giveDragMarkerStop(latlng, lineName, line['color'], line['indexLine'],Template.map.data.map.getZoom() );
	marker.addTo(Template.map.data.map);
	Template.metroLinesDraw.data.StopsMarker[marker['_leaflet_id']] = marker;
	Template.metroLinesDraw.collection.metroLines
	.update({'lineName': lineName},
	{'$push':{
		'stops':{
			'latlng' : latlng,
			'_leaflet_id' : marker._leaflet_id
		}
	}});
	return marker
}

export const mapClickAddStop = function(e){
	//console.log('click!!', e);
	L.DomEvent.stopPropagation(e);
	let latlng = [e.latlng.lat, e.latlng.lng];
	let stopTemp = {'latlng':latlng};
	let lineName = Template.metroLinesDraw.data.nameLine;
	let check = CheckCostAddStop(Template.metroLinesDraw.collection.metroLines,stopTemp,lineName);
	if(check){
		if(Template.metroLinesDraw.data.markerClicked){
			Template.metroLinesDraw.data.markerClicked.setStyle(styleMarkerUnClicked);
		}

		let marker = addMarkerStop(latlng, lineName);
		Template.metroLinesDraw.data.markerClicked = marker;
		marker.setStyle(styleMarkerClicked);
	}else{
		allertNoBadget();
	}
};

export const stopOnDragend = function(e){

	L.DomEvent.stopPropagation(e);
	if(!Template.metroLinesDraw.RV.mapEdited.get()){
		Template.metroLinesDraw.RV.mapEdited.set(true);
	}

	let markerTarget = e.target;
	let lines = Template.metroLinesDraw.collection.metroLines.find({'stops._leaflet_id' : markerTarget._leaflet_id});
	let stopTemp = {'latlng':[markerTarget._latlng.lat, markerTarget._latlng.lng]};
	let check = CheckCostDragStop(Template.metroLinesDraw.collection.metroLines, markerTarget);

	if(check){
		lines.forEach(function(lineToChange){
			let positionToChange = _.findIndex(lineToChange.stops, function(stop){ return stop._leaflet_id == markerTarget._leaflet_id;});
			let listStopUpdate = 'stops.' + positionToChange.toString()+'.latlng';
			let stopTemp = {
			'latlng':[markerTarget._latlng.lat, markerTarget._latlng.lng],
			'_leaflet_id':markerTarget._leaflet_id
			};
			lineToChange.stops.splice(positionToChange,1, stopTemp);
			let upRes = Template.metroLinesDraw.collection.metroLines.update(
			{'_id'  : lineToChange._id},//lineName : markerTarget['lineName']},
			{
				$set:{
					'stops' : lineToChange.stops
					}
			}
		);
		Template.metroLinesDraw.data.newHexsComputed = false;
	});
	}else{
		listStops = Template.metroLinesDraw.collection.metroLines.findOne(
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
	}
	return false;
};
