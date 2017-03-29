import math from 'mathjs';
import {hexList, CenterHex, getCity} from '/imports/api/parameters.js';

var city = getCity();

if (!hexList[city]) {
  window.location.replace("/city/roma");
  return;
}


let cosines = [];
let sines = [];
for (let i = 0; i < 6; i++) {
  let angle = 2. * math.pi/6. * i;
  cosines.push(math.cos(angle));
  sines.push(math.sin(angle));
}

const hexCoor = hexList[city].coordinates[0];
const rx = (hexCoor[1][0] - CenterHex[city][0])/cosines[1];
const ry = (hexCoor[1][1] - CenterHex[city][1])/sines[1];

const hexagon = function(center) {
  let vertices = [];
  for (let i = 0; i < 6; i++) {
    let x = center[0] + rx * cosines[i];
    let y = center[1] + ry * sines[i];
    vertices.push([x,y]);
  }
  //first and last vertex must be the same
  vertices.push(vertices[0]);
  let properties = {};
  let polygon = {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [vertices]
    },
    "properties": properties
  };
  return polygon;
};

export {hexagon,rx,ry,cosines,sines};
