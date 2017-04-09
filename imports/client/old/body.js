import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import {leaflet} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-path-drag';

import 'leaflet-providers';
import turf from 'turf';

import '/imports/client/lib/leaflet.spin.js';

import { LegendHex, createLegends } from '/imports/client/legends/legends.js';
import { popUp } from '/imports/client/info/popUp.js';

import { hexagon } from '/imports/client/info/hexagons/hex.js';
import { makeGeoJsonHexs } from '/imports/client/info/hexagons/hexsGeojson.js';
import { fillPointTree } from '/imports/client/info/hexagons/findClosestPoint.js'

import { makeWorkers } from '/imports/client/modify/workers.js';

import {budget, CenterCity, getCity ,timesOfDay, maxDuration } from '/imports/api/parameters.js';

import { observeNewLineChanges } from '/imports/client/modify/addStop.js';
import { radiusCircle } from '/imports/client/modify/style.js';

import '/imports/client/scenario/scenario.js';

import '/imports/client/body.html';



Template.body.onRendered(function bodyOnRendered() {

let city = Router.current().params.city;
Template.body.data.city = city;

 Meteor.call('giveDataBuildScenario', city,'listPoints', function(err, risp){
      for(let doc_i = 0; doc_i < risp.length; doc_i++){
        doc = risp[doc_i]
        doc.point = {type:'Point', 'coordinates' : risp[doc_i].coor};
        doc.city = city;
        doc._id = doc.pos.toString();
        Template.body.collection.points.insert(doc);
      }           
      fillPointTree(Template.body.collection.points); 
      Template.body.function.checkDataLoaded(-1);
 });

Meteor.call('metroLines', city, function(err, res){
    console.log('metrolines',res, err);
    observeNewLineChanges(); //observe add new lines when new lines added
    res.forEach(function(line, index){
      line.stops = _.values(line.stops).map(function(stop){
        return {'latlng':stop};
      });
      line.temp = false;
      line.name = line.name || line.lineName;
      line.speedName = line.speedName || "Med";
      line.frequencyName = line.frequencyName || "Med";
      if (line.type == 'metro') {
              console.log(line)
        line.indexLine = line.indexLine || _.indexOf(Template.body.data.listNumLinesDef, 0);
      }
      Template.body.collection.metroLines.insert(line);
    });
  });

	L.Icon.Default.imagePath = '/node_modules/leaflet/dist/images/';
    Template.body.data.OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      tileSize: 256,
     // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
    Template.body.data.here = L.tileLayer.provider('HERE.normalDayTransit',{
        app_id : 'IbEW2PDzNwdzV4pFf35t',
        app_code : 'yIfUWrkTbLG_cdWMxlLK5g',
        minZoom: 3,
        maxZoom: 20,
        tileSize: 256,
        //detectRetina:true,
	    });
    Template.body.data.Thunderforest_Transport = L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 3,
      maxZoom: 20,
      tileSize: 256,
      //detectRetina: true
    });
    Template.body.data.Thunderforest_TransportDark = L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      minZoom: 3,
      maxZoom: 20,
    });
    Template.body.data.Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      minZoom: 3,
      maxZoom: 20,
      //attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    Template.body.data.Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
      //attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 3,
      maxZoom: 20,
      ext: 'png'
    });
    Template.body.data.Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
	//attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
	});

  Template.body.data.baseMaps = {
      "Default": Template.body.data.here,
      "Transport": Template.body.data.Thunderforest_Transport,
      "Transport night" : Template.body.data.Thunderforest_TransportDark,
      "OpenStreetMap" : Template.body.data.OpenStreetMap_Mapnik,
      'Sat' : Template.body.data.Esri_WorldImagery,
      'B&WLite' : Template.body.data.Stamen_TonerLite,
      'B&W' : Template.body.data.Stamen_Toner

  };

  Template.body.data.geoJson = makeGeoJsonHexs();
  Template.body.data.popup = L.popup();
  Template.body.data.popupMarker = L.popup();

  var center = CenterCity[Template.body.data.city];

 	Template.body.data.map = L.map('mapid',{
    //renderer: L.canvas(),
      center: [center[1], center[0]],
    	zoom: 12,
    	dragging: true,
    	zoomControl : false,
    	layers: [Template.body.data.baseMaps.Default],
    	doubleClickZoom:false,
    	attributionControl:false,
    	zoomDelta:0.2,
    	zoomSnap:0.2,
    	inertia:false
  	});

 	Template.body.data.map.spin(true);
  Template.body.data.geoJson.addTo(Template.body.data.map);

	Template.body.data.map.on('zoomend',function(e){
		let zoom = Template.body.data.map.getZoom();
		let radius = radiusCircle();
		for(let _id in Template.body.data.StopsMarker){
			let layer = Template.body.data.StopsMarker[_id];
			layer.setRadius(radius);
		}
		for(let _id in Template.body.data.StopsMarkerInfo){
		let layer = Template.body.data.StopsMarkerInfo[_id];
		layer.setRadius(radius);
		}
	});

	Template.body.data.ControlbaseMap = L.control.layers(Template.body.data.baseMaps).addTo(Template.body.data.map);

  Template.body.data.mapScale = L.control.scale({position : 'bottomright'}).addTo(Template.body.data.map);
	Template.body.data.zoom = L.control.zoom( {position : 'bottomright'} );
	Template.body.data.zoom.addTo(Template.body.data.map);

  createLegends('timeButtons');
  createLegends('infoInfo');
	createLegends('infoBuild');
	createLegends('quantityButtons');
	createLegends('legendHex');


});
