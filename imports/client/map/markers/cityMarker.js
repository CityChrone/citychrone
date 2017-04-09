import {Template} from 'meteor/templating';

export class cityMarker {
  
  constructor(city, color = '#f28a40') {
  	console.log(city)
  		this.latlng = city.latlng
		this.style = styleMarker(color);
		this.marker = L.circleMarker(this.latlng, this.style).setRadius(radiusCircle())
		this.marker.city = city;

		this.marker.on('mouseover', function(e){
			let marker = e.target;
			marker.setStyle({	weight : 10,
				opacity : 0.4}); 
			marker.openPopup();
		});
		this.marker.on('mouseout', function(e){
			//console.log(e);
			let marker = e.target;
			marker.setStyle({weight : 3,
				opacity : 1});
			marker.closePopup();


		});
	
		this.marker.on('click', function(e){
			//analytics.track("click cityMarker", {
	  		//	city: e.target.city.city,
			//});
			let citySelected = e.target.city.city;
			Router.go('/city/'+citySelected);

			onCLickMarker(e);
		});

		this.marker.bindPopup('<div class="text-center" style="color:#f28a40;">' + city.city + '</div>',{'closeButton':false});
		return this.marker;
	}
	
	/*get marker(){
		return this.marker
	}*/
}

export const onCLickMarker = function(e){
			//console.log('click!!!', e.target.city)
			let marker = e.target;
			marker.setStyle({weight : 3,
			opacity : 1});
}

export const radiusCircle = function(){
 	let zoom = Template.map.data.map.getZoom();
 	let radius = 13;
 	if(zoom>9){
		radius = radius + 5*(zoom - 9);			//layer.redraw();
	}else if(zoom > 6){
		radius = 13;
 	}else{
		radius = 10;
	}
		 	console.log(radius,zoom);
 	return radius;
}

export const styleMarker = function(color){
	return {'color': color, 
	'fillColor' : color, 
	'fillOpacity':1,			
	'opacity' : 1
	};
};


