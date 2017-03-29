import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import {leaflet} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-path-drag';
//import { popUp } from './mapInterface/popUp.js';
import 'leaflet-providers';
import turf from 'turf';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';

import '/imports/client/lib/leaflet.spin.js';
import {copyArrayN} from '/imports/lib/utils.js';

import { LegendHex, createLegends } from '/imports/client/legends/legends.js';
import { popUp } from '/imports/client/info/popUp.js';

import { hexagon } from '/imports/client/info/hexagons/hex.js';
import { unionPoints, updateGeojson} from "/imports/client/info/hexagons/unionHexs.js";
import { makeGeoJsonHexs } from '/imports/client/info/hexagons/hexsGeoJson.js';
import { fillPointTree } from '/imports/client/info/hexagons/findClosestPoint.js'

import { computeAvgAccessibility } from '/imports/client/info/hexagons/colorHex.js';
import { makeWorkers } from '/imports/client/modify/workers.js';

import { vel } from '/imports/api/DBs/velocityDb.js';
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';
import {stops} from '/imports/api/DBs/stopsAndPointsDB.js';

import { zeroTime, budget, HexArea, CenterCity, getCity ,timesOfDay, maxDuration } from '/imports/api/parameters.js';

import {addNewStop, moveStop, removeStop } from '/imports/api/CSA-algorithm/computeNeigh.js';
import { newDragStop, observeNewLine, observeNewLineChanges, stopOnClick } from '/imports/client/modify/addStop.js';
import {polyMetro, stopMarker,radiusCircle} from '/imports/client/modify/style.js';
//import '/imports/client/rank/rank.js';
//import '/imports/client/rank/rankTooltip.js';


import '/imports/client/scenario/scenario.js';

import '/imports/client/body.html';

Template.body.helpers({
});

Template.body.onCreated(function bodyOnCreated(){
    console.log('BODY CREATED');

  var city = getCity();

// *******  FUNCTION  ***********
 	Template.body.function = {};

  Template.body.function.checkDataLoaded = function(num) {
    nun = num;
    console.log(Template.body.data.dataLoaded);
    Template.body.data.dataLoaded  += num
    if (Template.body.data.dataLoaded  > 0)
      return;

    if (Template.body.data.allSetAndReady.get()) {
      console.log("dataAlreadyLoaded");
      return;
    }

    $( "#spinLoad" ).remove();
    $("#ComputeNewMap").removeClass( "disabled" );
    //Template.body.data.dataLoaded.set(true);
    Template.body.data.allSetAndReady.set(true);
    Template.body.data.map.spin(false);
    Template.body.data.mapEdited.set(false);
  };


//Color New Metro
 	Template.body.function.colorNewMetro = function(num){
 		let color = ['#CD3C00','#0A09FC','#5CBA4B','#984ea3','#ffff33','#a65628','#f781bf','#999999', '#e41a1c'];
 		return Template.body.data.listNameColors[num % Template.body.data.listNameColors.length];
 	};

// *******  COLLECTION  ***********
	Template.body.collection = {};
	Template.body.collection.connections = new Mongo.Collection(null); //Local DB for Connections
	Template.body.collection.points  = new Mongo.Collection(null); //Local DB for points
	Template.body.collection.stops = new Mongo.Collection(null); //Local DB for stops
	Template.body.collection.metroLines = new Mongo.Collection(null); //Local DB for metroLines

//********** SUBSCRIPTION **********
//Subscription metroLines: copy on local Collections the remote MetroLines
	


//*********TEMPLATE***********
  Template.body.template = {};

// *******  DATA  ***********
  Template.body.data = {};
	Template.body.data.polylineMetro = {}; //A che serve? Solo quelle temp?
 	Template.body.data.dataLoaded = 6; //true when finished load data
 	
  Template.body.data.allSetAndReady = new ReactiveVar(false); //l'applicazione è pronta
  Template.body.data.scenarioComputed = new ReactiveVar(true);
 	Template.body.data.legendFeature = new ReactiveVar('btnVelocity'); //Store the selected feature reactive var
 	Template.body.data.infoBuildRV = new ReactiveVar('info');//Store the  info-Build buttun reactive var
 	Template.body.data.timeOfDay = new ReactiveVar(0);//Store the  time of the day slider reactive var
  Template.body.data.mapEdited = new ReactiveVar(false); //se è stata modificata dall'utente dall'ultimo salvataggio
  Template.body.data.currentMetroForSpeed = new ReactiveVar(""); //la metro attualmente selezionata per modificarne la frequenza

 	Template.body.data.listNameLines = ['MEA','MEB','MEC','MED','MEE','MEF','MEG','MEH','MEI','MEL','MEM', 'MEN', 'MEO','MEP','MEQ','MER','MES','MET','MEU','MEV','MEZ'];
 	Template.body.data.listNameColors = ['#CD3C00','#0A09FC','#5CBA4B','#984ea3','#ffff33','#a65628','#f781bf','#999999', '#e41a1c'];
 	Template.body.data.listNumLines = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //number of metros.. (to reset when ranking?)
 	Template.body.data.listNumLinesDef = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //FIXME: impostare il numero di linee al caricamento dello scenario e all'inizio
 	Template.body.data.nameLine = null; //Name lined selected .. (to reset when ranking?)
 	Template.body.data.StopsMarker = {}; //List of marker key-id
 	Template.body.data.StopsMarkerInfo = {}; //List of marker in the info section

 	//Template.body.data.buttonSelected = false;
	//Template.body.data.buttonsHex = false;
	//Template.body.data.buttonsFeature = false;
	//Template.body.data.clickE = 'click'; //Obsolete Passing to click (done) Template for click event in marker
	Template.body.data.markerClicked = null; //marker to change style for clicked

 	Template.body.data.blazePopUp = -1; //REmove popUp template from blaze afther closing popUp
 	Template.body.data.blazePopUpMarker = -1; //REmove popUp template from blaze afther closing popUpMArker

	Template.body.data.newHexsComputed = false;//check in we have to recompute the new Hex

	Template.body.data.budget = budget;
 	Template.body.data.popup = L.popup();
 	Template.body.data.popupMarker = L.popup();

//all hex geojson
	Template.body.data.geoJson = makeGeoJsonHexs();

	Template.body.data.cArray = [];
  Template.body.data.cArrayDef = [];
  Template.body.data.pointsVenues = []; //venues ordinate per point.pos
  Template.body.data.newAccessMax = {}; //max accessibility for each category of new scenario

  Template.body.data.defaultScenario = undefined;

//*********** WORKER  ************

//worker parameter section
	Template.body.data.cluster = 50;
 	Template.body.data.totWorker = 2;
	Template.body.data.allWorker = makeWorkers(Template.body.data.totWorker);
 	//useful to count the number of new velocity from worker and check finished parallel work
 	Template.body.data.countHex = 0;


//************* LOADING WITH METHOD DATA
  let dataUrl = Meteor.settings.public.zipUrl ||  "http://devdata.citychrone.org/";
  let dataToLoad = 6;



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
        line.indexLine = line.indexLine || _.indexOf(Template.body.data.listNumLinesDef, 0);
        if (!Template.body.data.listNumLinesDef[line.indexLine]) {
          Template.body.data.listNameLines[line.indexLine]=line.name;
          Template.body.data.listNameColors[line.indexLine]=line.color;
          line.subline = false;
        } else {
          line.subline = true;
        }
        Template.body.data.listNumLinesDef[line.indexLine]++;

      }
      Template.body.collection.metroLines.insert(line);
    });
    Template.body.data.listNumLines = Template.body.data.listNumLinesDef.slice();

  });


  Meteor.call('giveDataBuildScenario', city,'arrayC', function(err, res){
    console.log(res)
      Template.body.data.allWorker.forEach((worker)=>{
                  worker.postMessage({'arrayCDef' : res});
      });
      console.log('data ArrayC loaded');
      Template.body.function.checkDataLoaded(-1);
  });

  Meteor.call('giveDataBuildScenario', city,'listPoints', function(err, risp){
    const city = getCity();
    for(let doc_i = 0; doc_i < risp.length; doc_i++){
      doc = risp[doc_i]
      doc.point = {type:'Point', 'coordinates' : risp[doc_i].coor};
      doc.city = city;
      doc._id = doc.pos.toString();
      Template.body.collection.points.insert(doc);
    }           
    fillPointTree(Template.body.collection.points); 
    Template.body.function.checkDataLoaded(-1);
    console.log('data listPoints loaded');
  });

  Meteor.call('giveDataBuildScenario', city,'arrayN', function(err, risp){
      let P2PDef = {pos : risp.P2PPos, time : risp.P2PTime};
      let P2SDef = {pos : risp.P2SPos, time : risp.P2STime};
      let S2SDef = {pos : risp.S2SPos, time : risp.S2STime};
      Template.body.data.allWorker.forEach((worker)=>{
            worker.postMessage({'P2PDef' : P2PDef});
            worker.postMessage({'P2SDef' : P2SDef});
            worker.postMessage({'S2SDef' : S2SDef});
      });      
      console.log('data arrayN loaded');
      Template.body.function.checkDataLoaded(-1);
  });

  Meteor.call('giveDataBuildScenario', city,'pointsVenues', function(err, risp){
    Template.body.data.allWorker.forEach((worker)=>{
          worker.postMessage({'pointsVenues' : risp});
    });
    console.log('data pointsVenues loaded');
    Template.body.function.checkDataLoaded(-1);
  });

Meteor.call('giveDataBuildScenario', city,'stops', function(err, risp){
    risp.forEach(function(stop){
      stop.temp = false;
      Template.body.collection.stops.insert(stop);
    });
    console.log('data stops loaded', dataToLoad);
    Template.body.function.checkDataLoaded(-1);
  });



}); //Template.body.onCreated

Template.body.onRendered(function bodyOnRendered() {
	//window.scrollTo(0,1);

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
  var center = CenterCity[getCity()];

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
	createLegends('legendBudget');
	createLegends('legendAddLines', false);
	createLegends('metroSpeed', false);


});
