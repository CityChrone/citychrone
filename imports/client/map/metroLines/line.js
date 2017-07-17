export const polyMetro = function(line, color, temp = false){
	let weight = 2
	let dashArray = "10, 0";
	if(temp){
		dashArray =  "10, 5";
		weight = 3
	}

	return L.polyline(line, {
		color: color, 
		lineJoin:'round',
		 opacity:1, 
		 weight : weight, 
		 dashArray: dashArray,
		 clickable : false})
} 