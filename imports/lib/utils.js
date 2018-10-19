import {maxDuration} from "/imports/parameters.js";

const mergeSortedC = function(left, right){
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.push(left[il],left[il+1],left[il+2],left[il+3]);
            il+=4;
        } else {
            result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
};

const copyArrayN = function(obj){
    if (!obj || !obj.pos || !obj.time )
      return {pos: [], time: []};
    let pos = obj.pos.map(function(arr) { return arr ? arr.slice() : [];});
    let time = obj.time.map(function(arr) { return arr ? arr.slice() : [];});
    return {'pos':pos, 'time':time};
};

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


function time_walking_distance_exitimation(lat1, lon1, lat2, lon2) {
  let walking_speed = 4/3.6; // m/s
  let dist = getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) * 1000;
  //console.log(dist)
  let time_dist = dist / walking_speed;
  return time_dist; // in sec
}

const cutArrayC = function(startTime, arrayC, maxTime = maxDuration){
    let endTime = startTime + maxTime * 3600.;
    let indexEnd = 0;
    let indexStart = 0;
    for(indexEnd = 2; indexEnd < arrayC.length; indexEnd+=4){
            if(parseInt(arrayC[indexEnd]) > endTime){
                break;
                //console.log("break!!!")
            }
    }
    for(indexStart = 2; indexStart < arrayC.length; indexStart+=4){
            if(parseInt(arrayC[indexStart]) >= startTime){
                break;
                //console.log("break!!!")
            }
    }
    //console.log(_)

    arrayCCut = _.slice(arrayC, indexStart - 2, indexEnd+2);
    console.log("cutted array!!",startTime,  indexStart, indexEnd, arrayC.length, arrayCCut.length)
    return arrayCCut;
};  


export {mergeSortedC, copyArrayN, time_walking_distance_exitimation, distance, cutArrayC, getDistanceFromLatLonInKm};

