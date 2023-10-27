import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { leaflet } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-providers';
import '/imports/client/lib/leaflet.spin.js';
import '/imports/client/map/map.html';

Template.map.onCreated(function () {
  Template.map.data = {};
  Template.map.data.centerCity = this.data.centerCity || [10, 10];
  Template.map.data.zoom = this.data.zoom || 3;
  Template.map.RV = {}
  Template.map.RV.mapLoaded = new ReactiveVar(false)

});

Template.map.onRendered(function () {
  L.Icon.Default.imagePath = '/pipo/images/';
  //console.log(L)

  Template.map.data.OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 2,
    maxZoom: 20,
    tileSize: 256,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  Template.map.data.here = L.tileLayer.provider('HERE.normalDayTransit', {
    app_id: 'nXsNURHqhL8o3oxXpeGt',
    app_code: 'T_Zl3cx-On6P7Rk0OinOow',
    minZoom: 2,
    maxZoom: 20,
    tileSize: 256,
    detectRetina: true,
  });
  Template.map.data.Thunderforest_Transport = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey={apikey}', {
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 1,
    maxZoom: 20,
    tileSize: 256,
    detectRetina: true,
    apikey: '7644eea471bf495bb7ba24b1144a91a7',
  });
  // Template.map.data.Thunderforest_TransportDark = L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  //   minZoom: 1,
  //   maxZoom: 20,
  // });
  // Template.map.data.Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  //   minZoom: 1,
  //   maxZoom: 20,
  //   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  // });

  // Template.map.data.Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  //   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  //   subdomains: 'abcd',
  //   minZoom: 1,
  //   maxZoom: 18,
  //   ext: 'png',
  //   detectRetina: true,
  //   //noWrap: true
  // });

  Template.map.data.Stamen_TonerLite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
  });

  //   Template.map.data.Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
  // attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // subdomains: 'abcd',
  // minZoom: 1,
  // maxZoom: 18,
  // ext: 'png',
  // detectRetina:true,
  // //noWrap: true
  // });

  Template.map.data.baseMaps = {
    "Default": Template.map.data.here,
    "OpenStreetMap": Template.map.data.OpenStreetMap_Mapnik,
    'B&W': Template.map.data.Stamen_TonerLite,
    'Public Transport': Template.map.data.Thunderforest_Transport,
  };


  Template.map.data.map = L.map('mapid', {
    //renderer: L.canvas(),
    center: Template.map.data.centerCity,
    zoom: Template.map.data.zoom,
    dragging: true,
    zoomControl: false,
    layers: [Template.map.data.baseMaps['Default']],
    doubleClickZoom: false,
    attributionControl: true,
    renderer: L.canvas(),
    //zoomSnap:0.3,
    //zoomDelta:0.2,
    //zoomSnap:0.2,
    //inertia:false,
    tapTolerance: 20,
    tap: false,
  });

  //L.Icon.Default.imagePath = '/pipo/images/';
  Template.map.data.ControlbaseMap = L.control.layers(Template.map.data.baseMaps).addTo(Template.map.data.map);

  Template.map.data.mapScale = L.control.scale({ position: 'bottomright' }).addTo(Template.map.data.map);
  Template.map.data.zoom = L.control.zoom({ position: 'bottomright' });
  Template.map.data.zoom.addTo(Template.map.data.map);

  Template.map.RV.mapLoaded.set(true);

});
