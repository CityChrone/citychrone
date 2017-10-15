import * as parameters from '/imports/parameters.js'
import math from 'mathjs';

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

		let stopsNList = [];
		let stopsFind = stops.find({'point':NearSphere}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});
		
		stopsFind.forEach(function(stopN){
	      	stopsNList.push(stopN);
	       	urlStops += stopN.point.coordinates[0] + ',' + stopN.point.coordinates[1] + ';';
	    });

	  	let pointsNList = [];
		let pointsFind = points.find({'point':NearSphere}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});

		pointsFind
			.forEach(function(pointN){
	          	pointsNList.push(pointN);
	          	urlPoints += pointN.point.coordinates[0] + ',' + pointN.point.coordinates[1] + ';';
	    });

	    urlStops = urlStops.slice(0,-1) + '?sources=0';
	    urlPoints = urlPoints.slice(0,-1) + '?sources=0';
	    //console.log("number of neigs", stop, pointsNList.length, stopsNList.length, MaxDistance);
      	var getPoints = function() {
	        if (pointsNList.length < 1) {
	          resolve([stop,pointsNList,stopsNList]);
	          return;
	        }

	        HTTP.get(urlPoints, function (error2, result2){
	  				if(error2) {
	  					console.log('error HTTP call Point', serverUrl, error);
	  					reject('error http request');
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
				                let posPointN = pointsNList[pointN_i].pos
				                let timePointN = pointsNList[pointN_i].time;
			                  	P2S2Add[posPointN].pos.push(stop.pos)
			                  	P2S2Add[posPointN].time.push(timePointN)
	                  			countPointAdded+=1;
	  						}
	  					}
	  				}
	  				console.log("called resolved point", serverUrl)
	  				resolve([stop,pointsNList,stopsNList]);
	        });
	    };

		if (stopsNList.length < 1) {
		getPoints();
		return;
		}

	    HTTP.get(urlStops, function (error, result){
	    	if(error) {
	    			console.log('error HTTP call Stop', serverUrl, error);
					reject('error http request');
  			}else{
  		    	let resultStops = result.data;
  				if('durations' in resultStops){
  					for(let i = 1; i < resultStops.durations[0].length; i++){
  						let time = resultStops.durations[0][i];
  						stopsNList[i-1].time = time;
  					}
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
  			console.log("called resolved stop", serverUrl)
  			}
    	getPoints();
		});
	});
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

export {updateArrays, fill2AddArray, deleteEmptyItem}
