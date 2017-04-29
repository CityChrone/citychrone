export const polyMetro = function(line, color){
	return L.polyline(line, {
		color: color, 
		lineJoin:'round',
		 opacity:1, 
		 weight : 3, 
		 clickable : false})
} 