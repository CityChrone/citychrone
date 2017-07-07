import {Template} from 'meteor/templating';

export class cityMarker {
  
  constructor(city, color = '#d95f02') {
  	//console.log(city)
  		this.latlng = city.latlng
  		this.newScenario = city.newScenario;
  		this.color = this.newScenario ? '#b2182b' : color;
		this.style = styleMarker(this.color);
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
			marker.setStyle({weight : 1,
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

		let newScenarioPopUp = this.newScenario ? '<div class="text-center" style="color:#b2182b;">with new scenario section</div>': "";
		this.marker.bindPopup('<div class="text-center">' + city.city + '</div>' + newScenarioPopUp,{'closeButton':false});
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
 	}else if(zoom > 3){
		radius = 10;
	}
 	else{
		radius = 7;
	}
		 	//console.log(radius,zoom);
 	return radius;
}

export const styleMarker = function(color){
	colorIn = color
	colorOut = 'white'
	return {'color': colorOut, 
	'weight':1,
	'fillColor' : colorIn, 
	'fillOpacity':1,			
	'opacity' : 1
	};
};


