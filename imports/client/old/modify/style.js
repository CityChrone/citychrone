import {leaflet} from 'leaflet';
import {Template} from 'meteor/templating';

export const styleMarker = function(color, drag){
	let fillColor = drag ? '#808080' : 'white';
	return {'color': color, 
	'fillColor' : fillColor, 
	'fillOpacity':1,			
	'draggable' : drag,
	'opacity' : 1
	};
};

export const restyleMarker = function(){
	return {color: color, 
	fillColor : 'white', 
	fillOpacity:1,			
	draggable : drag,
	opacity : 1,
	CLIP_PADDING : 1};
};


export const styleMarkerClicked = {
			weight : 10,
			opacity : 0.4
		};
export const styleMarkerUnClicked = {
			weight : 3,
			opacity : 1
		};


export const polyMetro = function(line, color){
	return L.polyline(line, {
		color: color, 
		lineJoin:'round',
		 opacity:1, 
		 weight : 3, 
		 clickable : false})
} 

export const radiusCircle = function(){
	 	//console.log(e);
 	let zoom = Template.body.data.map.getZoom();
 	let radius = 10;
 	let limit1 = 12
 	if(zoom>limit1){
		radius = radius + 5*(zoom - limit1);			//layer.redraw();
	}else if(zoom > 10){
		radius = 8;
 	}else{
		radius = 2;
	}
 	return radius;
}


export const stopMarker =  function(latlng, color = null, drag = false){
	let marker = L.circleMarker(latlng,
		styleMarker(color, drag)).setRadius(radiusCircle());
	marker.colorLine = color;
	return marker;
};