import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
//import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import {points} from '/imports/api/DBs/stopsAndPointsDB.js';
import {unionHexs} from '/imports/api/CSA-algorithm/isochrone.js';
import {initArrayC} from '/imports/server/startup/InitArrayConnections.js';

Meteor.methods({
  /*'cArray'(){
    this.unblock();
    return arrayC;
  },
  'P2P'(){
    this.unblock();
    return P2P;
  },
  'P2S'(){
    this.unblock();
    return P2S;
  },
  'S2S'(){
    this.unblock();
    return S2S;
  },*/
  'metroLines'(city){
    return metroLines.find({'city' : city}).fetch();
  },
  'isochrone'(city, point){
      console.log('call isochrone!! points')
      listPoint = points.find({'city':'roma'},{fields:{'pos':1, 'hex':1},limit:10}).fetch()
      console.log('start point union hexs')
      res = unionHexs(listPoint)
      console.log(listPoint.length); 

      return res;
  },
  'connections'(city){
    return initArrayC(city, 7*3600, 10.*3600.);
  }
  //'httpREquest'(url){
    /*
      this.unblock();
      try {
        var result = HTTP.call("GET", url);
        return result;
      } catch (e) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }

    HTTP.get(url, function (error, result){
        if(error) {
          console.log('error httm call for dist stop',error, result);
          reject('error http request');
          else{
            return
          }
 */
//  }
});
