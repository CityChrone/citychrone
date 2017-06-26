import { Template } from 'meteor/templating';
import '/imports/client/map/popUps/popUpGeojson.html';
import { color } from '/imports/client/map/geojson/colorHex.js';
import { field2text } from '/imports/client/selector/quantitySelector.js';
Template.popUpGeojson.events({
});

Template.popUpGeojson.helpers({
	'labelColor'(feature, val) {
		//console.log(this);
		let selColor = color(feature, false);
		return "background-color:"+ selColor(val)+';';
	},
	'toString'(feature, val){
		//console.log(val)
		$("#accessPopupChart").html('');
		switch(feature){
			case 'newVels':
				let valFixed = parseFloat(val).toFixed(2);
				if(val > 0){ return valFixed.toString() + ' km/h';}
				else { return 'Not Av.';}
				break;
			case 'newPotPop':		
				valFixed = parseFloat(val/1000).toFixed(0);
				if(val > 0){ return valFixed.toString() + 'K';}
				else { return 'Not Av.';}
				break;

		}
	},
	'nameQuantity'(field){
		//console.log(field, field2text[field])
		return field2text[field]
	},

});
