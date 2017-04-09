import math from 'mathjs';

class hexagonCity {
  
  constructor(hex) {
    this.cosines = [];
    this.sines = [];
    for (let i = 0; i < 6; i++) {
      let angle = 2. * math.pi/6. * i;
      this.cosines.push(math.cos(angle));
      this.sines.push(math.sin(angle));
    }
    this.centerHex = [(hex[0][0] + hex[3][0])/2., (hex[0][1] + hex[3][1])/2.];
    this.rx = (hex[1][0] - this.centerHex[0])/this.cosines[1];
    this.ry = (hex[1][1] - this.centerHex[1])/this.sines[1];

  }
  
  hexagon(center) {
    let vertices = [];
    for (let i = 0; i < 6; i++) {
      let x = center[0] + this.rx * this.cosines[i];
      let y = center[1] + this.ry * this.sines[i];
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

}


export {hexagonCity};
