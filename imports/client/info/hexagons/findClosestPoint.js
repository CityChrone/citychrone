import kdbush from 'kdbush';
import Template from 'meteor/templating';
import rbush from 'rbush'
import knn from 'rbush-knn';

export const pointTree = rbush(4);

export const fillPointTree = function(points){
	//console.log('start filling tree')
	listPoint = []
    points.find({}).forEach((point) =>{
    	let item =  {
    		minX: point.point.coordinates[0],
		    minY: point.point.coordinates[1],
		    maxX: point.point.coordinates[0],
		    maxY: point.point.coordinates[1],
    		pos: point.pos}
    	//console.log(item)
    	listPoint.push(item)
    	//pointTree.insert(item)
    });
    pointTree.load(listPoint);
    //console.log('end filling tree')
}

export const findClosestPoint = function(point){
	return knn(pointTree, point[0], point[1], 1);
}