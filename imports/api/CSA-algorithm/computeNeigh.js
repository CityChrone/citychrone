//import { points } from '../stopsAndPoints.js';
import {getCity, serverOsrm} from '../parameters.js';

const addNewStop = function(stop, P2S, S2S) {
    let line = stop.line;
  	let coor = stop.coor;
  	let timeCreation = stop.timeCreation;
  	let posLine = S2S.pos.length;
 	  computeNeigh(stop, P2S, S2S);
	   //addNewLines();
  };

const  computeNeigh = function(stop, stops, P2S2Add, S2S2Add, points){
	return new Promise( function(resolve, reject ){
		//let serverUrl = "http://socdyn.phys.uniroma1.it:3000";

    var city = getCity();
		let serverUrl = Meteor.settings.public.serverOsrm || serverOsrm;
		let urlBase =  serverUrl+"/table/v1/foot/" + stop.coor[0] + ',' + stop.coor[1] + ';';
		let urlPoints = urlBase.slice(0);
		let urlStops = urlBase.slice(0);
		let posStop = stop.pos;
    //let P2S2Add = {};
    //let S2S2Add = {};
		//console.log(stop.point);
		//let earthRadius = 6378.1 //km
		//let distanceRad = 2500/earthRadius ;
		let NearSphere = {$near: {
						     $geometry: {'type': 'Point', 'coordinates' : stop.coor},
						     $maxDistance: 1250
						  },
						};
		let stopsNList = [];
		//console.log(stops.findOne({'coor':{$exists:true}}), stop, stops.find({'point':NearSphere}).count());
		let stopsFind = stops.find({'point':NearSphere,'city':city}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});
		stopsFind.forEach(function(stopN){
	      	stopsNList.push(stopN);
	       	urlStops += stopN.point.coordinates[0] + ',' + stopN.point.coordinates[1] + ';';
	    });

	  let pointsNList = [];

   		//console.log('points founded near!!', points.find({'point':NearSphere}, {fields:{'coor':1, 'pos':1}}).count());
		let pointsFind = points.find({'point':NearSphere,'city':city}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}});
		//console.log('count points',pointsFind.count(), city,NearSphere, points.find({'point':NearSphere,'city':city}, {fields:{'point':1, 'pos':1}, sort:{'pos':1}}).fetch() )

		pointsFind
			.forEach(function(pointN){
	          	pointsNList.push(pointN);
	          	urlPoints += pointN.point.coordinates[0] + ',' + pointN.point.coordinates[1] + ';';
	    });

	    urlStops = urlStops.slice(0,-1) + '?sources=0';
	    urlPoints = urlPoints.slice(0,-1) + '?sources=0';

      var getPoints = function() {
        if (pointsNList.length < 1) {
          resolve([stop,pointsNList,stopsNList]);
          return;
        }
        HTTP.get(urlPoints, function (error2, result2){
  				if(error2) {
  					//console.log('error httm call fro dist point');
  					reject('error http request');
  				}else{

  					let resultPoints = result2.data;
  				   	if('durations' in resultPoints){
  						for(let i = 1; i < resultPoints.durations[0].length; i++){
  							let time = resultPoints.durations[0][i];
  							pointsNList[i-1].time = time;
  						}
  					}

  					//let P2S_i_time = [];
  					//let P2S_i_pos = [];
  					let countPointAdded = 0;
  					for(let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++){
  						if(pointsNList[pointN_i].time < 900){
                let posStopN = pointsNList[pointN_i].pos
                let timeStopN = pointsNList[pointN_i].time;

                  P2S2Add[posStopN].pos.push(stop.pos)
                  P2S2Add[posStopN].time.push(timeStopN)
                  countPointAdded+=1;
  						}
  					}
  				}
  			    //console.log('stop added', stop, P2S,  pointsNList);
  				resolve([stop,pointsNList,stopsNList]);
        });
      };

      if (stopsNList.length < 1) {
        getPoints();
        return;
      }
	    HTTP.get(urlStops, function (error, result){
	    	if(error) {
					console.log('error httm call for dist stop',error, result);
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
  					if(stopsNList[stopN_i].time < 900){
              let posStopN = stopsNList[stopN_i].pos
              let timeStopN = stopsNList[stopN_i].time;
              //console.log(posStopN, posStop)
              S2S2Add[posStopN].pos.push(stop.pos)
              S2S2Add[posStopN].time.push(timeStopN)
              S2S2Add[posStop].pos.push(posStopN)
              S2S2Add[posStop].time.push(timeStopN)

            }

  				}

  			}
        getPoints();

	    });
	});
}

export {computeNeigh};
