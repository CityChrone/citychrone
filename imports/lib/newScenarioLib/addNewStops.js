import * as parameters from '/imports/parameters.js'
import math from 'mathjs';
import * as util from "/imports/lib/utils.js"

const deleteEmptyItem = function(array2Add){
	for(let key in array2Add){
		if(array2Add[key].pos.length == 0)
			delete array2Add[key]; 
	}
};

const fill2AddArray = function(num){
	let array2Add = {}
	for(let i = 0; i < num; i++){
		array2Add[i] = {
        	'pos' : [],
            'time' : []
        };
	}
	return array2Add;
};

const computeNeigh = function(stop, stops, P2S2Add, S2S2Add, points, serverOSRM){
	return new Promise( function(resolve, reject ){
		//console.log("in compute neigh")
		let serverUrl = serverOSRM;
		let urlBase =  serverUrl+"table/v1/foot/" + stop.coor[0] + ',' + stop.coor[1] + ';';
		let urlPoints = urlBase.slice(0);
		let urlStops = urlBase.slice(0);
		let posStop = stop.pos;
		let MaxDistance = parameters.maxDistanceWalk;
		let NearSphere = {
							$near: {
						    $geometry: {'type': 'Point', 'coordinates' : stop.coor},
						    $maxDistance: MaxDistance
						  	},
						};
		//console.log("before points.find()")
		let closestPoint = points.find({'point':NearSphere},{ limit : 1}).fetch()
		//console.log("closestPoint", closestPoint)
		let stopsNList = [];
		let stopsFind = stops.find({'point':NearSphere}, {fields:{'point':1, 'pos':1, "S2SPos":1, "S2STime":1}, sort:{'pos':1}});
		let coordinates_stops = []
		let start_coor = [stop.coor[0], stop.coor[1]]
		stopsFind.forEach(function(stopN){
			//console.log("stop", stopN, util.getDistanceFromLatLonInKm(stop.coor[1], stop.coor[0],stopN.point.coordinates[1], stopN.point.coordinates[0]))
	      	stopsNList.push(stopN);
	       	urlStops += stopN.point.coordinates[0] + ',' + stopN.point.coordinates[1] + ';';
	       	coordinates_stops.push([stopN.point.coordinates[0], stopN.point.coordinates[1]])
	    });

	  	let pointsNList = [];
		let pointsFind = points.find({'point':NearSphere}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});
		let coordinates_points = []

		pointsFind
			.forEach(function(pointN){
				//console.log(pointN)
	          	pointsNList.push(pointN);
	          	urlPoints += pointN.point.coordinates[0] + ',' + pointN.point.coordinates[1] + ';';
	          	coordinates_points.push([pointN.point.coordinates[0], pointN.point.coordinates[1]])
	    });

	    urlStops = urlStops.slice(0,-1) + '?sources=0';
	    urlPoints = urlPoints.slice(0,-1) + '?sources=0';
	    let vels = []
	    let err  = []
	    const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
	    //console.log("number of neigs", stop, pointsNList.length, stopsNList.length, MaxDistance);
      	var getPoints = function() {
	        if (pointsNList.length < 1) {
	          resolve([stop,pointsNList,stopsNList]);
	          return;
	        }

	        HTTP.get(urlPoints,  {timeout : 5000}, function (error2, result2){
	  				if(error2) {
	  					console.log('error HTTP call Point, Computing on phisycal distance', serverUrl, error2);
	  					//reject('error http request');
						for(let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++){
							let p = coordinates_points[pointN_i]
  							let time = util.time_walking_distance_exitimation(start_coor[1], start_coor[0], p[1], p[0]);
  							pointsNList[pointN_i].time = time;
  						}
	  					let countPointAdded = 0;
	  					for(let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++){
	  						if(pointsNList[pointN_i].time < parameters.maxTimeWalk){
				                let posPointN = pointsNList[pointN_i].pos
				                let timePointN = pointsNList[pointN_i].time;
			                  	P2S2Add[posPointN].pos.push(stop.pos)
			                  	P2S2Add[posPointN].time.push(timePointN)
	                  			countPointAdded+=1;
	  						}
	  					}

	  				}else{

	  					let resultPoints = result2.data;
	  				   	if('durations' in resultPoints){
	  						for(let i = 1; i < resultPoints.durations[0].length; i++){
	  							let time = math.round(resultPoints.durations[0][i]);
	  							pointsNList[i-1].time = time;

	  						}
	  					}
	  					let countPointAdded = 0;
	  					for(let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++){
	  						if(pointsNList[pointN_i].time < parameters.maxTimeWalk){
			                  	let p = coordinates_points[pointN_i]
  								let time = util.time_walking_distance_exitimation(start_coor[1], start_coor[0], p[1], p[0]);
				                let posPointN = pointsNList[pointN_i].pos
				                let timePointN = pointsNList[pointN_i].time;
			                  	P2S2Add[posPointN].pos.push(stop.pos)
			                  	P2S2Add[posPointN].time.push(timePointN)
  								let dist = util.getDistanceFromLatLonInKm(start_coor[1], start_coor[0], p[1], p[0]) * 1000;
  								vels.push(dist/timePointN)
	                  			err.push(100. * Math.abs(time - timePointN) / time)

  								//console.log(stop.pos, posPointN, timePointN.toFixed(0), time.toFixed(0), 
  								//	(100. * (time - timePointN) / time).toFixed(0) , "%", (dist/timePointN).toFixed(1),
  								//	average(vels).toFixed(1), average(err).toFixed(1))
	                  			countPointAdded+=1;
	  						}
	  					}
	  				}
	  				//console.log("called resolved point", stop, pointsNList, stopsNList)
	  				resolve([stop,pointsNList,stopsNList]);
	        });
	    };

		if (stopsNList.length < 1) {
			getPoints();
			return;
		}

	    HTTP.get(urlStops, {timeout : 0}, function (error, result){
	    	if(error) {
    			console.log('error HTTP call Stop', serverUrl, error);
				//reject('error http request');
				for(let stopN_i = 0; stopN_i < stopsNList.length; stopN_i++){
					let p = coordinates_stops[stopN_i]
					let time = util.time_walking_distance_exitimation(start_coor[1], start_coor[0], p[1], p[0]);
					stopsNList[stopN_i].time = time;
						//console.log(time, start_coor[1],  start_coor[0],p[1], p[0] )
					}
  				for(let stopN_i = 0; stopN_i < stopsNList.length; stopN_i++){
  					let posStopN = stopsNList[stopN_i].pos
		            let timeStopN = stopsNList[stopN_i].time;
  					if(stopsNList[stopN_i].time < parameters.maxTimeWalk && posStop != posStopN){
		              //console.log(posStopN, posStop)
		            	S2S2Add[posStop].pos.push(posStopN)
		            	S2S2Add[posStop].time.push(timeStopN)
		            	if(S2S2Add[posStopN].pos.includes(posStop)){
		            		//console.log('ce sta!!!!')
		            		let posTemp = S2S2Add[posStopN].pos.indexOf(posStop)
		            		if(S2S2Add[posStopN].time[posTemp] > timeStopN){
		            			S2S2Add[posStopN].time[posTemp] = timeStopN
		            		}
		            	}else{
		            		S2S2Add[posStopN].pos.push(stop.pos)
		            		S2S2Add[posStopN].time.push(timeStopN)

		            	}
            		}

  				}
  			}else{
  		    	let resultStops = result.data;
  				if('durations' in resultStops){
  					for(let i = 1; i < resultStops.durations[0].length; i++){
  						let time = resultStops.durations[0][i];
  						stopsNList[i-1].time = time;
  					}
  				}
  				for(let stopN_i = 0; stopN_i < stopsNList.length; stopN_i++){
  					let p = coordinates_stops[stopN_i]
		            let time = util.time_walking_distance_exitimation(start_coor[1], start_coor[0], p[1], p[0]);
  					
  					let posStopN = stopsNList[stopN_i].pos
		            let timeStopN = stopsNList[stopN_i].time;
  					if(stopsNList[stopN_i].time < parameters.maxTimeWalk && posStop != posStopN){
		            	S2S2Add[posStop].pos.push(posStopN)
		            	S2S2Add[posStop].time.push(timeStopN)
		            	//S2S2Add[posStop].time.push(timeStopN)
  						let dist = util.getDistanceFromLatLonInKm(start_coor[1], start_coor[0], p[1], p[0]) * 1000;
  						err.push(100.*Math.abs(time - timeStopN) / time)
	    				vels.push(dist/timeStopN);
  						//console.log(stop.pos, posStopN, timeStopN.toFixed(0), time.toFixed(0), 
  						//			(100. * (time - timeStopN) / time).toFixed(0) , "%", (dist/timeStopN).toFixed(1),
  						//			average(vels).toFixed(1), average(err).toFixed(1))

		            	if(S2S2Add[posStopN].pos.includes(posStop)){
		            		//console.log('ce sta!!!!')
		            		let posTemp = S2S2Add[posStopN].pos.indexOf(posStop)
		            		if(S2S2Add[posStopN].time[posTemp] > timeStopN){
		            			S2S2Add[posStopN].time[posTemp] = timeStopN
		            		}
		            	}else{
		            		S2S2Add[posStopN].pos.push(stop.pos)
		            		S2S2Add[posStopN].time.push(timeStopN)

		            	}
            		}

  				}
  			console.log("called resolved stop", serverUrl)
  			}
    	getPoints();
		});
	});
}

const computeNeighNew = function(stop, stops, P2S2Add, S2S2Add, points, arrayN){
	//console.log("computeNeighNew", arrayN)
	let P2PPos = arrayN["P2PPos"]
	let P2SPos = arrayN["P2SPos"]
	let S2SPos = arrayN["S2SPos"]
	let P2PTime = arrayN["P2PTime"]
	let P2STime = arrayN["P2STime"]
	let S2STime = arrayN["S2STime"]

	let posStop = stop.pos;
	let start_coor = [stop.coor[0], stop.coor[1]]
	let MaxDistance = parameters.maxDistanceWalk;
	let NearSphere = {
						$near: {
					    $geometry: {'type': 'Point', 'coordinates' : stop.coor},
					    $maxDistance: MaxDistance
					  	},
					};


	let stopsNList = [];
	let stopsFind = stops.find({'point':NearSphere}, {fields:{'point':1, 'pos':1, "S2SPos":1, "S2STime":1}, sort:{'pos':1}});

	stopsFind.forEach(function(stopN){
		//console.log("stop", stopN, util.getDistanceFromLatLonInKm(stop.coor[1], stop.coor[0],stopN.point.coordinates[1], stopN.point.coordinates[0]))
      	stopsNList.push(stopN);
    });

  	let pointsNList = [];
	let pointsFind = points.find({'point':NearSphere}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});
	pointsFind
		.forEach(function(pointN){
			//console.log(pointN)
          	pointsNList.push(pointN);
    });


	let closestPoint = points.find({'point':NearSphere}).fetch()[0]
	let closestStop = stops.find({'point':NearSphere, "temp":{"$ne":true}}).fetch()[0]
	//console.log(closestPoint, closestStop)

	let dist_point = util.getDistanceFromLatLonInKm(closestPoint.coor[1], closestPoint.coor[0],stop.coor[1], stop.coor[0]);
	let dist_stop = util.getDistanceFromLatLonInKm(closestStop.point.coordinates[1], closestStop.point.coordinates[0],stop.coor[1], stop.coor[0]);
	//console.log( dist_point, dist_stop)

	if (dist_stop <= dist_point){
		let pos_stop_closest = closestStop.pos;
		let pos_to_add = S2SPos[pos_stop_closest]
		let time_to_add = S2STime[pos_stop_closest]
		pos_to_add.push(pos_stop_closest)
		time_to_add.push(0)
		S2S2Add[posStop].pos = pos_to_add
		S2S2Add[posStop].time = time_to_add

		//updating the neighbor stops
		for (pos_i = 0; pos_i < S2S2Add[posStop].pos.length; pos_i++){
			pos_update = S2S2Add[posStop].pos[pos_i]
			S2S2Add[pos_update].pos.push(posStop)
			S2S2Add[pos_update].time.push(S2S2Add[posStop].time[pos_i])
		}

		//updating the neighbor points
		for(let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++){
			let pos_point = pointsNList[pointN_i].pos
			if (P2SPos[pos_point].includes(pos_stop_closest)){
	            	let index_stop_closest = P2SPos[pos_point].indexOf(pos_stop_closest)
	            	let time_stop_closest = P2STime[pos_point][index_stop_closest]
	            	P2S2Add[pos_point].pos.push(posStop)
	            	P2S2Add[pos_point].time.push(time_stop_closest)
			}
		}
	}
	else{
		let pos_point_closest = closestPoint.pos;
		let pos_to_add = P2SPos[pos_point_closest]
		let time_to_add = P2STime[pos_point_closest]
		S2S2Add[posStop].pos = pos_to_add
		S2S2Add[posStop].time = time_to_add

		//updating the neighbor stops
		for (pos_i = 0; pos_i < S2S2Add[posStop].pos.length; pos_i++){
			pos_update = S2S2Add[posStop].pos[pos_i]
			S2S2Add[pos_update].pos.push(posStop)
			S2S2Add[pos_update].time.push(S2S2Add[posStop].time[pos_i])
		}

		//updating the neighbor points
		neigh_points_pos = P2PPos[pos_point_closest]
		P2S2Add[pos_point_closest].pos.push(posStop)
		P2S2Add[pos_point_closest].time.push(0)

		for(let pointN_i = 0; pointN_i < neigh_points_pos.length; pointN_i++){
			let pos_point = neigh_points_pos[pointN_i]
			P2S2Add[pos_point].pos.push(posStop)
			P2S2Add[pos_point].time.push(P2PTime[pos_point_closest][pointN_i])
			//console.log(pos_point, P2S2Add[pos_point])
		}

	}
	//console.log("called resolved point", stop,  dist_point, dist_stop, S2S2Add[posStop], P2PPos[closestPoint.pos])
}



const updateArrays = function(city, stopsCollection, pointsCollections, scenario, serverOSRM){
	//make copy of default arrays

	stopsCollection.remove({temp:true});
	
	let metroLinesFetched = scenario.lines;

	//console.log(metroLinesFetched)

	metroLinesFetched.forEach(function(line, indexLine){
		line.stops.forEach(function(stop, indexStop){
 			let posStop = _.size(scenario.S2S2Add);
 			//console.log(posStop, line, stop)
			metroLinesFetched[indexLine].stops[indexStop].pos = posStop;
			stopsCollection.insert({
				'line' : line.lineName,
				'pos' : posStop,
				'latlng' : stop.latlng,
				'coor' : [stop.latlng[1], stop.latlng[0]],
				'timeCreation' : new Date().getTime(),
				'point' : {'type' : 'Point', 'coordinates' : [stop.latlng[1], stop.latlng[0]]},
				'temp' : true,
				'city' : city,
			});
			scenario.S2S2Add[posStop] = {
	        	'pos' : [],
	            'time' : []
        	};
		});
	});

	let newStops = stopsCollection.find({temp:true}, {sort : {'timeCreation':1} });

	let promiseAddStop = [];

 	if(newStops.count()){
	 	newStops.forEach(function(stop) {
	 		promiseAddStop.push(computeNeigh(stop,stopsCollection, scenario.P2S2Add, scenario.S2S2Add, pointsCollections, serverOSRM));
	 	});
	}

 	return promiseAddStop;

};

const updateArraysNew = function(city, stopsCollection, pointsCollections, scenario, arrayN){
	//make copy of default arrays
	console.log("updateArraysNew")
	stopsCollection.remove({temp:true});
	
	let metroLinesFetched = scenario.lines;

	//console.log(metroLinesFetched)

	metroLinesFetched.forEach(function(line, indexLine){
		line.stops.forEach(function(stop, indexStop){
 			let posStop = _.size(scenario.S2S2Add);
 			//console.log(posStop, line, stop)
			metroLinesFetched[indexLine].stops[indexStop].pos = posStop;
			stopsCollection.insert({
				'line' : line.lineName,
				'pos' : posStop,
				'latlng' : stop.latlng,
				'coor' : [stop.latlng[1], stop.latlng[0]],
				'timeCreation' : new Date().getTime(),
				'point' : {'type' : 'Point', 'coordinates' : [stop.latlng[1], stop.latlng[0]]},
				'temp' : true,
				'city' : city,
			});
			scenario.S2S2Add[posStop] = {
	        	'pos' : [],
	            'time' : []
        	};
		});
	});

	let newStops = stopsCollection.find({temp:true}, {sort : {'timeCreation':1} });

	let promiseAddStop = [];

 	if(newStops.count()){
	 	newStops.forEach(function(stop) {
	 		computeNeighNew(stop,stopsCollection, scenario.P2S2Add, scenario.S2S2Add, pointsCollections, arrayN);
	 		promiseAddStop.push(
				new Promise( function(resolve, reject ){resolve()})
	 			);
	 	});
	}

 	return promiseAddStop;

};


export const updateArraysWait = function(city, stopsCollection, pointsCollections, scenario, serverOSRM){
	promiseAddStop = updateArrays(city, stopsCollection, pointsCollections, scenario, serverOSRM);
	Promise.all(promiseAddStop).then(values => {return values});
}

export {updateArrays, updateArraysNew, fill2AddArray, deleteEmptyItem}
