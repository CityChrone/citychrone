var require = meteorInstall({"imports":{"lib":{"newScenarioLib":{"addNewLines.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/lib/newScenarioLib/addNewLines.js                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  addNewLines: () => addNewLines
});
let mergeSortedC;
module.watch(require("/imports/lib/utils.js"), {
  mergeSortedC(v) {
    mergeSortedC = v;
  }

}, 0);
let timesOfDay, maxDuration, metroSpeeds, metroFrequencies;
module.watch(require("/imports/parameters.js"), {
  timesOfDay(v) {
    timesOfDay = v;
  },

  maxDuration(v) {
    maxDuration = v;
  },

  metroSpeeds(v) {
    metroSpeeds = v;
  },

  metroFrequencies(v) {
    metroFrequencies = v;
  }

}, 1);
let math;
module.watch(require("mathjs"), {
  default(v) {
    math = v;
  }

}, 2);
let turf;
module.watch(require("turf"), {
  default(v) {
    turf = v;
  }

}, 3);

function computeTfor2Stops(dist, Vf, a) {
  //dist in meters
  // const Vf = 30; // max speed 100km/h
  // const a = 1.3; //acceleration 1.3 m/s^2
  const Ta = Vf / a; //time needed to reach max velocity

  const DISTa = 0.5 * a * Ta * Ta; //dist to reach the maximun velocity

  if (dist / 2.0 <= DISTa) {
    return 2 * math.sqrt(dist);
  } else {
    //console.log('TimeDist ', DISTa, math.sqrt(DISTa), (dist - 2. * DISTa) / Vf);
    return math.round(2 * math.sqrt(DISTa) + (dist - 2.0 * DISTa) / Vf);
  }
}

function findSpeed(name) {
  for (var speed of metroSpeeds) {
    if (speed.name == name) return speed.topSpeed;
  }

  return 30;
}

function findAccel(name) {
  for (var speed of metroSpeeds) {
    if (speed.name == name) return speed.acceleration;
  }

  return 1.3;
}

function findFreq(name) {
  for (var freq of metroFrequencies) {
    if (freq.name == name) return freq.frequency;
  }

  return 2 * 60;
}

function addNewLines(metroLinesFetched, limT) {
  const dockTime = 15; //time the trains is stopped at dock

  var stopsLines = {}; //console.log('metroLinesFetched', metroLinesFetched)

  _.each(metroLinesFetched, function (line) {
    line.stops.forEach(function (stop, indexStop) {
      if (indexStop === 0) {
        stopsLines[line.lineName] = {
          'points': [turf.point([stop.latlng[1], stop.latlng[0]])],
          'pos': [stop.pos],
          speed: findSpeed(line.speedName),
          accel: findAccel(line.speedName),
          frequency: findFreq(line.frequencyName)
        };
      } else {
        stopsLines[line.lineName].points.push(turf.point([stop.latlng[1], stop.latlng[0]]));
        stopsLines[line.lineName].pos.push(stop.pos);
      }
    });
  }); //console.log(stopsLines);

  /*
  metro.find({temp:true}, {sort: {'timeCreation':1}}).forEach(function(stop){
  	if(stop.line in stopsLines) {
  		stopsLines[stop.line].points.push(stop.point);
  		stopsLines[stop.line].pos.push(stop.pos);
  	}else{
  		stopsLines[stop.line] = {'points' : [stop.point], 'pos' : [stop.pos]};
  	}
  });*/
  //console.log('addNEwLines', stopsLines);
  //connections.remove({'temp' : true});


  let cArrayTemp = [];

  _.each(stopsLines, function (line, lineName) {
    //console.log(lines);
    let freqTime = line.frequency;
    let speed = line.speed;
    let accel = line.accel;
    if (!freqTime) return; //knock out linea

    let startingStopTime = 5 * 3600; //line starts at 5am

    let endTime = 24 * 3600; //line ends at 12pm

    let startStopPoint = line.points[0];
    let startStopPos = line.pos[0]; //console.log(startStopPoint);
    //** One direction

    for (let stop_i = 1; stop_i < line.points.length; stop_i++) {
      let endStopPoint = line.points[stop_i];
      let endStopPos = line.pos[stop_i]; //console.log(startStopPoint, endStopPoint);

      let dist = turf.distance(startStopPoint, endStopPoint, 'kilometers') * 1000.0;
      let timeDist = computeTfor2Stops(dist, speed, accel);
      let endingTime = startingStopTime + timeDist;
      let cArray2Add = [];

      for (let StartingTimeTemp = startingStopTime; StartingTimeTemp + timeDist <= endTime; StartingTimeTemp += freqTime) {
        if (StartingTimeTemp >= limT[0] && StartingTimeTemp + timeDist <= limT[1]) {
          cArray2Add.push(startStopPos, endStopPos, StartingTimeTemp, StartingTimeTemp + timeDist);
        }
      }

      cArrayTemp = mergeSortedC(cArrayTemp, cArray2Add);
      startingStopTime = endingTime + dockTime;
      startStopPoint = line.points[stop_i];
      startStopPos = line.pos[stop_i];
    } // *** Opposite direction


    startingStopTime = 5 * 3600; //line starts at 5am

    endTime = 24 * 3600; //line ends at 12pm

    var totStop = line.points.length - 1;
    startStopPoint = line.points[totStop];
    startStopPos = line.pos[totStop];

    for (let stop_i = totStop - 1; stop_i >= 0; stop_i--) {
      let endStopPoint = line.points[stop_i];
      let endStopPos = line.pos[stop_i];
      let dist = turf.distance(startStopPoint, endStopPoint, 'kilometers') * 1000.0;
      let timeDist = computeTfor2Stops(dist, speed, accel);
      let endingTime = startingStopTime + timeDist;
      let cArray2Add = [];

      for (let StartingTimeTemp = startingStopTime; StartingTimeTemp + timeDist <= endTime; StartingTimeTemp += freqTime) {
        if (StartingTimeTemp >= limT[0] && StartingTimeTemp + timeDist <= limT[1]) {
          cArray2Add.push(startStopPos, endStopPos, StartingTimeTemp, StartingTimeTemp + timeDist);
        }
      }

      cArrayTemp = mergeSortedC(cArrayTemp, cArray2Add);
      startingStopTime = endingTime + dockTime;
      startStopPoint = line.points[stop_i];
      startStopPos = line.pos[stop_i];
    }
  }); //console.log(cArrayTemp.length)


  return cArrayTemp; //console.log(stopsLines);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"addNewStops.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/lib/newScenarioLib/addNewStops.js                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  updateArraysWait: () => updateArraysWait,
  updateArrays: () => updateArrays,
  fill2AddArray: () => fill2AddArray,
  deleteEmptyItem: () => deleteEmptyItem
});
let parameters;
module.watch(require("/imports/parameters.js"), {
  "*"(v) {
    parameters = v;
  }

}, 0);
let math;
module.watch(require("mathjs"), {
  default(v) {
    math = v;
  }

}, 1);

const deleteEmptyItem = function (array2Add) {
  for (let key in array2Add) {
    if (array2Add[key].pos.length == 0) delete array2Add[key];
  }
};

const fill2AddArray = function (num) {
  let array2Add = {};

  for (let i = 0; i < num; i++) {
    array2Add[i] = {
      'pos': [],
      'time': []
    };
  }

  return array2Add;
};

const computeNeigh = function (stop, stops, P2S2Add, S2S2Add, points, serverOSRM) {
  return new Promise(function (resolve, reject) {
    let serverUrl = serverOSRM;
    let urlBase = serverUrl + "table/v1/foot/" + stop.coor[0] + ',' + stop.coor[1] + ';';
    let urlPoints = urlBase.slice(0);
    let urlStops = urlBase.slice(0);
    let posStop = stop.pos;
    let MaxDistance = parameters.maxDistanceWalk;
    let NearSphere = {
      $near: {
        $geometry: {
          'type': 'Point',
          'coordinates': stop.coor
        },
        $maxDistance: MaxDistance
      }
    };
    let stopsNList = [];
    let stopsFind = stops.find({
      'point': NearSphere
    }, {
      fields: {
        'point': 1,
        'pos': 1
      },
      sort: {
        'pos': 1
      }
    });
    stopsFind.forEach(function (stopN) {
      stopsNList.push(stopN);
      urlStops += stopN.point.coordinates[0] + ',' + stopN.point.coordinates[1] + ';';
    });
    let pointsNList = [];
    let pointsFind = points.find({
      'point': NearSphere
    }, {
      fields: {
        'point': 1,
        'pos': 1
      },
      sort: {
        'pos': 1
      }
    });
    pointsFind.forEach(function (pointN) {
      pointsNList.push(pointN);
      urlPoints += pointN.point.coordinates[0] + ',' + pointN.point.coordinates[1] + ';';
    });
    urlStops = urlStops.slice(0, -1) + '?sources=0';
    urlPoints = urlPoints.slice(0, -1) + '?sources=0'; //console.log("number of neigs", stop, pointsNList.length, stopsNList.length, MaxDistance);

    var getPoints = function () {
      if (pointsNList.length < 1) {
        resolve([stop, pointsNList, stopsNList]);
        return;
      }

      HTTP.get(urlPoints, function (error2, result2) {
        if (error2) {
          console.log('error HTTP call Point', serverUrl, error);
          reject('error http request');
        } else {
          let resultPoints = result2.data;

          if ('durations' in resultPoints) {
            for (let i = 1; i < resultPoints.durations[0].length; i++) {
              let time = math.round(resultPoints.durations[0][i]);
              pointsNList[i - 1].time = time;
            }
          }

          let countPointAdded = 0;

          for (let pointN_i = 0; pointN_i < pointsNList.length; pointN_i++) {
            if (pointsNList[pointN_i].time < parameters.maxTimeWalk) {
              let posPointN = pointsNList[pointN_i].pos;
              let timePointN = pointsNList[pointN_i].time;
              P2S2Add[posPointN].pos.push(stop.pos);
              P2S2Add[posPointN].time.push(timePointN);
              countPointAdded += 1;
            }
          }
        }

        console.log("called resolved point", serverUrl, urlPoints);
        resolve([stop, pointsNList, stopsNList]);
      });
    };

    if (stopsNList.length < 1) {
      getPoints();
      return;
    }

    HTTP.get(urlStops, function (error, result) {
      if (error) {
        console.log('error HTTP call Stop', serverUrl, error);
        reject('error http request');
      } else {
        let resultStops = result.data;

        if ('durations' in resultStops) {
          for (let i = 1; i < resultStops.durations[0].length; i++) {
            let time = resultStops.durations[0][i];
            stopsNList[i - 1].time = time;
          }
        }

        for (let stopN_i = 0; stopN_i < stopsNList.length; stopN_i++) {
          let posStopN = stopsNList[stopN_i].pos;
          let timeStopN = stopsNList[stopN_i].time;

          if (stopsNList[stopN_i].time < parameters.maxTimeWalk && posStop != posStopN) {
            //console.log(posStopN, posStop)
            S2S2Add[posStop].pos.push(posStopN);
            S2S2Add[posStop].time.push(timeStopN);

            if (S2S2Add[posStopN].pos.includes(posStop)) {
              //console.log('ce sta!!!!')
              let posTemp = S2S2Add[posStopN].pos.indexOf(posStop);

              if (S2S2Add[posStopN].time[posTemp] > timeStopN) {
                S2S2Add[posStopN].time[posTemp] = timeStopN;
              }
            } else {
              S2S2Add[posStopN].pos.push(stop.pos);
              S2S2Add[posStopN].time.push(timeStopN);
            }
          }
        }

        console.log("called resolved stop", serverUrl);
      }

      getPoints();
    });
  });
};

const updateArrays = function (city, stopsCollection, pointsCollections, scenario, serverOSRM) {
  //make copy of default arrays
  stopsCollection.remove({
    temp: true
  });
  let metroLinesFetched = scenario.lines; //console.log(metroLinesFetched)

  metroLinesFetched.forEach(function (line, indexLine) {
    line.stops.forEach(function (stop, indexStop) {
      let posStop = _.size(scenario.S2S2Add); //console.log(posStop, line, stop)


      metroLinesFetched[indexLine].stops[indexStop].pos = posStop;
      stopsCollection.insert({
        'line': line.lineName,
        'pos': posStop,
        'latlng': stop.latlng,
        'coor': [stop.latlng[1], stop.latlng[0]],
        'timeCreation': new Date().getTime(),
        'point': {
          'type': 'Point',
          'coordinates': [stop.latlng[1], stop.latlng[0]]
        },
        'temp': true,
        'city': city
      });
      scenario.S2S2Add[posStop] = {
        'pos': [],
        'time': []
      };
    });
  });
  let newStops = stopsCollection.find({
    temp: true
  }, {
    sort: {
      'timeCreation': 1
    }
  });
  let promiseAddStop = [];

  if (newStops.count()) {
    newStops.forEach(function (stop) {
      promiseAddStop.push(computeNeigh(stop, stopsCollection, scenario.P2S2Add, scenario.S2S2Add, pointsCollections, serverOSRM));
    });
  }

  return promiseAddStop;
};

const updateArraysWait = function (city, stopsCollection, pointsCollections, scenario, serverOSRM) {
  promiseAddStop = updateArrays(city, stopsCollection, pointsCollections, scenario, serverOSRM);
  Promise.all(promiseAddStop).then(values => {
    return values;
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"utils.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/lib/utils.js                                                                                         //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  mergeSortedC: () => mergeSortedC,
  copyArrayN: () => copyArrayN
});

const mergeSortedC = function (left, right) {
  var result = [],
      il = 0,
      ir = 0;

  while (il < left.length && ir < right.length) {
    if (left[il + 2] < right[ir + 2]) {
      result.push(left[il], left[il + 1], left[il + 2], left[il + 3]);
      il += 4;
    } else {
      result.push(right[ir], right[ir + 1], right[ir + 2], right[ir + 3]);
      ir += 4;
    }
  }

  return result.concat(left.slice(il)).concat(right.slice(ir));
};

const copyArrayN = function (obj) {
  if (!obj || !obj.pos || !obj.time) return {
    pos: [],
    time: []
  };
  let pos = obj.pos.map(function (arr) {
    return arr ? arr.slice() : [];
  });
  let time = obj.time.map(function (arr) {
    return arr ? arr.slice() : [];
  });
  return {
    'pos': pos,
    'time': time
  };
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"startup":{"loadCitiesData.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/server/startup/loadCitiesData.js                                                                     //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  citiesData: () => citiesData,
  listCities: () => listCities,
  addDataFromZip: () => addDataFromZip,
  loadCity: () => loadCity
});
let fs;
module.watch(require("fs"), {
  default(v) {
    fs = v;
  }

}, 0);
let JSZip;
module.watch(require("jszip"), {
  default(v) {
    JSZip = v;
  }

}, 1);
let scenarioDB;
module.watch(require("/imports/DBs/scenarioDB.js"), {
  scenarioDB(v) {
    scenarioDB = v;
  }

}, 2);
let computeScenario;
module.watch(require("/imports/server/startup/scenarioDef.js"), {
  computeScenario(v) {
    computeScenario = v;
  }

}, 3);
//let path = process.env['METEOR_SHELL_DIR'] + '/../../../public/cities/';
//let path = Assets.absoluteFilePath('cities/')
var meteorRoot = fs.realpathSync(process.cwd() + '/../');
var publicPath = meteorRoot + '/web.browser/app/';
let path = publicPath + '/cities/';
let citiesData = {};
let listCities = [];

let addDataFromZip = function (nameFile) {
  console.log("reading", nameFile, Meteor.settings.public);
  fs.readFile(nameFile, function (err, data) {
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {
      zip.file("cityData.txt").async("string").then(function (data2) {
        let cityData = JSON.parse(data2);
        let city = cityData['city'];
        citiesData[city] = {};
        citiesData[city]['city'] = city;
        citiesData[city]['nameFile'] = nameFile.split("/").pop();
        citiesData[city]['oneHex'] = cityData['hex'];
        citiesData[city]['areaHex'] = cityData['areaHex'];
        citiesData[city]['newScenario'] = cityData['newScenario'];
        citiesData[city]['budget'] = cityData['budget'];
        citiesData[city]['metroLines'] = cityData['metroLines'];
        citiesData[city]['serverOSRM'] = Meteor.settings.public.OSRM_SERVER || cityData['serverOSRM'] + "/";
        console.log(citiesData[city]['serverOSRM']);
        citiesData[city]['centerCity'] = cityData['centerCity'];
        citiesData[city]['arrayN'] = {};
        citiesData[city]['arrayPop'] = []; //console.log(citiesData[city], nameFile, nameFile.split("/").pop())

        zip.file("connections.txt").async("string").then(function (data3) {
          console.log(city, 'parsing, arrayC');
          citiesData[city]['arrayC'] = JSON.parse(data3); //data3.split(",").map(Number); //JSON.parse(data3);

          console.log(city, 'arrayC');
          zip.file("listPoints.txt").async("string").then(function (data3) {
            citiesData[city]['listPoints'] = JSON.parse(data3);
            citiesData[city]['listPoints'].forEach(p => {
              citiesData[city]['arrayPop'].push(p.pop);
            });
            zip.file("listStops.txt").async("string").then(function (data3) {
              citiesData[city]['stops'] = JSON.parse(data3);
              zip.file("P2PPos.txt").async("string").then(function (data3) {
                citiesData[city]['arrayN']['P2PPos'] = JSON.parse(data3);
                zip.file("P2PTime.txt").async("string").then(function (data3) {
                  citiesData[city]['arrayN']['P2PTime'] = JSON.parse(data3);
                  zip.file("P2SPos.txt").async("string").then(function (data3) {
                    citiesData[city]['arrayN']['P2SPos'] = JSON.parse(data3);
                    zip.file("P2STime.txt").async("string").then(function (data3) {
                      citiesData[city]['arrayN']['P2STime'] = JSON.parse(data3);
                      zip.file("S2SPos.txt").async("string").then(function (data3) {
                        citiesData[city]['arrayN']['S2SPos'] = JSON.parse(data3);
                        zip.file("S2STime.txt").async("string").then(function (data3) {
                          citiesData[city]['arrayN']['S2STime'] = JSON.parse(data3);
                          let latlng = citiesData[city]['centerCity'];
                          let newScenario = citiesData[city]['newScenario'];
                          listCities.push({
                            'city': city,
                            'latlng': latlng.reverse(),
                            'newScenario': newScenario
                          });
                          console.log('readed', nameFile); //console.log("loaded", city+".zip", 'scenario def',scenarioDB.find({'city':city, 'default':true}).count(), ' newScenario', newScenario, citiesData[city]['centerCity'])

                          if (scenarioDB.find({
                            'city': city,
                            'default': true
                          }).count() == 0) {
                            //computeScenario(city, citiesData[city]);
                            console.log("computeScenario", city);
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

let loadCity = function () {
  fs.readdirSync(path).forEach(nameFile => {
    //console.log(file.slice(-3));
    if (nameFile.slice(-3) == "zip") {
      //console.log(file.slice(0,-4))
      addDataFromZip(path + nameFile);
    }
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"scenarioDef.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/server/startup/scenarioDef.js                                                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  cutArrayC: () => cutArrayC,
  computeScenario: () => computeScenario,
  computeScenarioDefault: () => computeScenarioDefault,
  addCityToList: () => addCityToList
});
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let JSZip;
module.watch(require("jszip"), {
  default(v) {
    JSZip = v;
  }

}, 1);
let fs;
module.watch(require("fs"), {
  default(v) {
    fs = v;
  }

}, 2);
let turf;
module.watch(require("turf"), {
  default(v) {
    turf = v;
  }

}, 3);
let math;
module.watch(require("mathjs"), {
  default(v) {
    math = v;
  }

}, 4);
let EJSON;
module.watch(require("meteor/ejson"), {
  EJSON(v) {
    EJSON = v;
  }

}, 5);
let scenarioDB, initScenario, computeScoreNewScenario;
module.watch(require("/imports/DBs/scenarioDB.js"), {
  scenarioDB(v) {
    scenarioDB = v;
  },

  initScenario(v) {
    initScenario = v;
  },

  computeScoreNewScenario(v) {
    computeScoreNewScenario = v;
  }

}, 6);
let timesOfDay, maxDuration;
module.watch(require("/imports/parameters.js"), {
  timesOfDay(v) {
    timesOfDay = v;
  },

  maxDuration(v) {
    maxDuration = v;
  }

}, 7);
let loadCity, citiesData;
module.watch(require("/imports/server/startup/loadCitiesData.js"), {
  loadCity(v) {
    loadCity = v;
  },

  citiesData(v) {
    citiesData = v;
  }

}, 8);
process.on('unhandledRejection', console.log.bind(console));

var worker = require("/public/workers/ICSACore.js");

var avgEmAll = function (arrays) {
  result = [];

  for (var i = 0; i < arrays[0].length; i++) {
    var num = 0; //still assuming all arrays have the same amount of numbers

    for (var i2 = 0; i2 < arrays.length; i2++) {
      num += arrays[i2][i];
    }

    result.push(num / arrays.length);
  }

  return result;
};

const cutArrayC = function (startTime, arrayC) {
  let endTime = startTime + 4 * 3600.;
  let indexEnd = 0;
  let indexStart = 0;

  for (indexEnd = 2; indexEnd < arrayC.length; indexEnd += 4) {
    if (parseInt(arrayC[indexEnd]) > endTime) {
      break; //console.log("break!!!")
    }
  }

  for (indexStart = 2; indexStart < arrayC.length; indexStart += 4) {
    if (parseInt(arrayC[indexStart]) >= startTime) {
      break; //console.log("break!!!")
    }
  }

  arrayCCut = _.slice(arrayC, indexStart - 2, indexEnd + 2);
  console.log("cutted array!!", startTime, indexStart, indexEnd, arrayC.length, arrayCCut.length);
  return arrayCCut;
};

const computeScenario = function (city, dataCity, startTimes = timesOfDay) {
  Meteor.setTimeout(() => {
    let listPoints = dataCity.listPoints;
    let arrayN = dataCity.arrayN;
    let areaHex = dataCity.areaHex;
    let stopsList = dataCity.stopsList;
    let arrayPop = dataCity.arrayPop;
    let results = [];
    let scenario = initScenario(city, 'default', 'citychrone', startTimes);
    scenario.default = true; //console.log(arrayN)

    let perLim = 25;

    for (let time_i in startTimes) {
      let percentage = 0;
      let velocityScore = [];
      let socialityScore = [];
      let startTime = startTimes[time_i];
      let arrayC = cutArrayC(startTime, dataCity.arrayC);

      for (var point_i = 0; point_i < listPoints.length; point_i++) {
        var point = listPoints[point_i];
        var returned = worker.ICSAPoint(point, arrayC, arrayN, startTime, areaHex, arrayPop); //console.log(point.pos , listPoints.length ,percentage);

        if (100. * point.pos / listPoints.length > percentage) {
          console.log(city, startTime / 3600, returned.velocityScore, returned.socialityScore, parseInt(100. * point.pos / listPoints.length).toString() + "%");
          percentage += perLim;
        }

        velocityScore.push(returned.velocityScore);
        socialityScore.push(returned.socialityScore);
      }

      scenario.moments[startTime.toString()] = scenario.moments[startTime.toString()] || {};
      let moment = scenario.moments[startTime.toString()];
      moment.velocityScore = velocityScore;
      moment.socialityScore = socialityScore;
    }

    let velocities = [];
    let socialities = [];

    for (let time in scenario.moments) {
      console.log(time);

      if (scenario.moments[time]['velocityScore'].length > 0) {
        velocities.push(scenario.moments[time]['velocityScore']);
        socialities.push(scenario.moments[time]['socialityScore']);
      }
    }

    console.log(velocities.length, "after", Object.keys(scenario.moments));
    scenario.moments["avg"] = {};
    scenario.moments["avg"].velocityScore = avgEmAll(velocities);
    scenario.moments["avg"].socialityScore = avgEmAll(socialities); //console.log(velocities)

    scenarioDB.remove({
      'city': city,
      'default': true
    });
    scenario['arrayPop'] = arrayPop;
    scenario['scores'] = computeScoreNewScenario(scenario, startTimes[0].toString());
    scenarioDB.insert(scenario); //return scenario;
  }, 0);
};

const computeScenarioDefault = function (city) {
  let dataCity = citiesData[city];
  let scenario = computeScenario(city, dataCity);
  return scenario;
};

const addCityToList = function (scenarioDef, dataCity) {
  return new Promise(function (resolve, reject) {
    console.log("inside PROMISE");
    let city = scenarioDef.city;
    citiesData[city] = dataCity;
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/server/methods.js                                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let addNewLines;
module.watch(require("/imports/lib/newScenarioLib/addNewLines.js"), {
  addNewLines(v) {
    addNewLines = v;
  }

}, 2);
let scenarioDB;
module.watch(require("/imports/DBs/scenarioDB.js"), {
  scenarioDB(v) {
    scenarioDB = v;
  }

}, 3);
let citiesData, listCities;
module.watch(require("/imports/server/startup/loadCitiesData.js"), {
  citiesData(v) {
    citiesData = v;
  },

  listCities(v) {
    listCities = v;
  }

}, 4);
let maxDuration;
module.watch(require("/imports/parameters.js"), {
  maxDuration(v) {
    maxDuration = v;
  }

}, 5);
module.watch(require("/imports/lib/newScenarioLib/addNewStops.js"));

let worker = require("/public/workers/ICSACore.js");

let mergeArrays = require("/public/workers/mergeArrays.js");

Meteor.methods({
  'isochrone'(point, scenarioID, startTime) {
    var scenario = scenarioDB.findOne({
      '_id': scenarioID
    });
    let city = scenario.city;

    if (scenario == [] || !(city in citiesData)) {
      //console.log('Scenario not found')
      return [];
    } else {
      let cityData = citiesData[city];
      let listPoints = cityData.listPoints;
      let wTime = [startTime, startTime + maxDuration];
      let arrayC2Add = addNewLines(scenario.lines, wTime) || [];
      let arrayC = mergeArrays.mergeSortedC(cityData.arrayC, arrayC2Add);
      let arrayN = {};
      let arrayNDef = cityData.arrayN;
      arrayN['P2SPos'] = mergeArrays.mergeArrayN(arrayNDef.P2SPos, scenario.P2S2Add, 'pos');
      arrayN['P2STime'] = mergeArrays.mergeArrayN(arrayNDef.P2STime, scenario.P2S2Add, 'time');
      arrayN['S2SPos'] = mergeArrays.mergeArrayN(arrayNDef.S2SPos, scenario.S2S2Add, 'pos');
      arrayN['S2STime'] = mergeArrays.mergeArrayN(arrayNDef.S2STime, scenario.S2S2Add, 'time');
      arrayN['P2PPos'] = arrayNDef.P2PPos.slice();
      arrayN['P2PTime'] = arrayNDef.P2PTime.slice();
      let pointsVenues = cityData.pointsVenues;
      let areaHex = cityData.areaHex;
      let arrayPop = cityData.arrayPop; //console.log('arrayC, arrayN', arrayC.length, Object.keys(arrayN))
      //let startTime = timesOfDay[time_i];

      let returned = worker.ICSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);
      return returned.tPoint;
    }
  },

  'giveDataBuildScenario': function (city, data) {
    let dataToReturn = {};
    data.forEach(name => {
      if (citiesData[city][name] != undefined) {
        dataToReturn[name] = citiesData[city][name];
      } else {
        dataToReturn[name] = [];
      }
    }); //console.log(city, data)

    return dataToReturn;
  },
  'giveListCitiesScenario': function () {
    return listCities;
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"router.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/server/router.js                                                                                     //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Router;
module.watch(require("meteor/iron:router"), {
  Router(v) {
    Router = v;
  }

}, 1);
let timesOfDay, maxDuration;
module.watch(require("/imports/parameters.js"), {
  timesOfDay(v) {
    timesOfDay = v;
  },

  maxDuration(v) {
    maxDuration = v;
  }

}, 2);
let JSZip;
module.watch(require("jszip"), {
  default(v) {
    JSZip = v;
  }

}, 3);
let fs;
module.watch(require("fs"), {
  default(v) {
    fs = v;
  }

}, 4);
let computeScenarioDefault, addCityToList, checkCities, computeDataCity, computeOnlyScenarioDefault;
module.watch(require("/imports/server/startup/scenarioDef.js"), {
  computeScenarioDefault(v) {
    computeScenarioDefault = v;
  },

  addCityToList(v) {
    addCityToList = v;
  },

  checkCities(v) {
    checkCities = v;
  },

  computeDataCity(v) {
    computeDataCity = v;
  },

  computeOnlyScenarioDefault(v) {
    computeOnlyScenarioDefault = v;
  }

}, 5);
let scenarioDB, initScenario;
module.watch(require("/imports/DBs/scenarioDB.js"), {
  scenarioDB(v) {
    scenarioDB = v;
  },

  initScenario(v) {
    initScenario = v;
  }

}, 6);
let loadCity, citiesData;
module.watch(require("/imports/server/startup/loadCitiesData.js"), {
  loadCity(v) {
    loadCity = v;
  },

  citiesData(v) {
    citiesData = v;
  }

}, 7);
Router.route('/addCity/:city', function () {
  let city = this.params.city;
  console.log('Adding ... ', city);
  this.response.end('Adding ... ' + city);
  let scenarioDef = computeScenarioDefault(city);
}, {
  where: 'server'
});
Router.route('/reloadCities', function () {
  loadCity();
}, {
  where: 'server'
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"DBs":{"scenarioDB.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/DBs/scenarioDB.js                                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  scenarioDB: () => scenarioDB,
  initScenario: () => initScenario,
  computeScoreNewScenario: () => computeScoreNewScenario
});
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let Template;
module.watch(require("meteor/templating"), {
  Template(v) {
    Template = v;
  }

}, 2);
const scenarioDB = new Mongo.Collection('scenario');

if (Meteor.isServer) {
  scenarioDB._ensureIndex({
    "scores.scoreVelocity": -1,
    "creationDate": -1
  });

  scenarioDB._ensureIndex({
    "city": 1,
    "scores.avgVelocityScore": 1,
    "creationDate": -1
  });

  scenarioDB._ensureIndex({
    "city": 1
  });

  scenarioDB._ensureIndex({
    "city": 1,
    "scores.avgSocialityScore": 1
  });
}

const initScenario = function (city, name, author, times, metroLinesFetched, P2S2Add, S2S2Add) {
  metroLinesFetched = metroLinesFetched || [];
  P2S2Add = P2S2Add || {};
  S2S2Add = S2S2Add || {};
  let moments = {};
  times.forEach(time => {
    moments[time] = {
      'velocity': 0,
      'score': 0,
      'budget': 0,
      'efficency': 0,
      'velocityScore': [],
      'socialityScore': [],
      'velocityScoreDiff': [],
      'socialityScoreDiff': []
    };
  });
  let scenario = {
    'author': author,
    'name': name,
    'creationDate': new Date(),
    'lines': metroLinesFetched,
    'P2S2Add': P2S2Add,
    'S2S2Add': S2S2Add,
    'city': city,
    '_id': new Mongo.ObjectID(),
    'moments': moments,
    'default': false,
    'author': author
  };
  return scenario;
};

const computeScoreNewScenario = function (scenario, time) {
  let scores = {};
  let moment = scenario['moments'][time];
  let popArray = scenario['arrayPop'];
  let totPop = scenario.arrayPop.reduce((a, b) => {
    return a + b;
  }, 0);
  scores['avgVelocityScore'] = 0;
  moment['velocityScore'].forEach((vel, i) => {
    scores['avgVelocityScore'] += popArray[i] * vel;
  });
  scores['avgVelocityScore'] /= totPop;
  scores['avgSocialityScore'] = 0;
  moment['socialityScore'].forEach((soc, i) => {
    scores['avgSocialityScore'] += popArray[i] * soc;
  });
  scores['avgSocialityScore'] /= totPop;
  return scores;
};

Meteor.methods({
  'insertNewScenario': function (obj) {
    //console.log('insert scenario', obj);
    if ('_id' in obj) {
      console.log('updating scenario', obj.city);
      scenarioDB.update({
        '_id': obj['_id']
      }, obj, {
        'upsert': true
      }, function (err, id) {
        if (err) {
          console.log(err);
          return;
        } //console.log('insert scenario new id', id);
        //if (Meteor.isClient)
        //Template.body.template.scenario.currentScenarioId = id;

      });
    } else {
      scenarioDB.insert(obj, function (err, id) {
        if (err) {
          console.log(err);
          return;
        } //console.log('insert scenario new id', id);
        //if (Meteor.isClient)
        //Template.body.template.scenario.currentScenarioId = id;

      });
    }
  },
  'updateScenario': function (obj, _id) {
    //console.log("update scenario", _id);
    scenarioDB.update({
      '_id': _id
    }, obj);
  },
  'updateNameAuthorScenario': function (title, author, _id) {
    let res = scenarioDB.update({
      '_id': _id
    }, {
      "$set": {
        'name': title,
        'author': author
      }
    }, (err, numModified) => {//console.log("scenario updated", title, author, _id, numModified, err);
    }); //console.log("scenario updated", title, author, _id, res);
  },
  'scenarioDef': function (city) {
    let res = scenarioDB.findOne({
      'default': true,
      'city': city
    }, {
      sort: {
        'creationDate': -1
      },
      reactive: false
    }); //console.log('return scenario def', res);

    return res;
  },
  'giveScenario': function (_id) {
    //console.log(_id, scenarioDB.findOne({'_id':new Mongo.ObjectID(_id)}))
    return scenarioDB.findOne({
      '_id': new Mongo.ObjectID(_id)
    });
  },
  'findOne': function (search) {
    return scenarioDB.findOne(search);
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"parameters.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/parameters.js                                                                                        //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
module.export({
  maxTimeWalk: () => maxTimeWalk,
  walkingVelocity: () => walkingVelocity,
  maxDistanceWalk: () => maxDistanceWalk,
  timesOfDay: () => timesOfDay,
  maxDuration: () => maxDuration,
  metroSpeeds: () => metroSpeeds,
  metroFrequencies: () => metroFrequencies
});
let turf;
module.watch(require("turf"), {
  default(v) {
    turf = v;
  }

}, 0);
let math;
module.watch(require("mathjs"), {
  default(v) {
    math = v;
  }

}, 1);
let Router;
module.watch(require("meteor/iron:router"), {
  Router(v) {
    Router = v;
  }

}, 2);
const maxTimeWalk = 900.;
const walkingVelocity = 5. / 3.6;
const maxDistanceWalk = maxTimeWalk * walkingVelocity;
const timesOfDay = [7. * 3600., 10 * 3600, 13 * 3600, 16 * 3600, 19 * 3600, 22 * 3600];
const maxDuration = 4 * 3600;
const metroSpeeds = [{
  name: "Low",
  topSpeed: 12,
  acceleration: 0.6,
  colorClass: 'btn-danger'
}, {
  name: "Med",
  topSpeed: 20,
  acceleration: 0.9,
  colorClass: 'btn-warning'
}, {
  name: "High",
  topSpeed: 30,
  acceleration: 1.3,
  colorClass: 'btn-success'
}];
const metroFrequencies = [{
  name: "Off",
  frequency: 0,
  colorClass: 'btn-default'
}, {
  name: "Low",
  frequency: 15 * 60,
  colorClass: 'btn-danger'
}, {
  name: "Med",
  frequency: 8 * 60,
  colorClass: 'btn-warning'
}, {
  name: "High",
  frequency: 2 * 60,
  colorClass: 'btn-success'
}];
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"main.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// server/main.js                                                                                               //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Router;
module.watch(require("meteor/iron:router"), {
  Router(v) {
    Router = v;
  }

}, 1);
let scenarioDB;
module.watch(require("/imports/DBs/scenarioDB.js"), {
  scenarioDB(v) {
    scenarioDB = v;
  }

}, 2);
module.watch(require("/imports/server/methods.js"));
let JSZip;
module.watch(require("jszip"), {
  default(v) {
    JSZip = v;
  }

}, 3);
let fs;
module.watch(require("fs"), {
  default(v) {
    fs = v;
  }

}, 4);
module.watch(require("/imports/server/router.js"));
let loadCity;
module.watch(require("/imports/server/startup/loadCitiesData.js"), {
  loadCity(v) {
    loadCity = v;
  }

}, 5);

var _;

Meteor.startup(() => {
  _ = lodash;
  loadCity();
  Meteor.publish('scenario', function scenarioList(city) {
    let sort = {
      'scores.avgVelocityScore': -1,
      'creationDate': -1
    };
    let field = {
      'moments': 0,
      'P2S2Add': 0,
      'S2S2Add': 0,
      'lines': 0
    };
    console.log(sort, field);
    return scenarioDB.find({
      'city': city
    }, {
      sort: sort,
      'fields': field
    });
  });
  Meteor.publish('scenarioDef', function scenarioList(city, listOfId) {
    return scenarioDB.find({
      'default': true,
      'city': city
    }, {
      sort: {
        'creationDate': -1
      }
    });
  });
  Meteor.publish('scenarioID', function scenarioList(city, _id) {
    return scenarioDB.find({
      '_id': _id,
      'city': city,
      'moments': {
        '$exists': true
      }
    }, {
      sort: {
        'creationDate': -1
      }
    });
  }); //console.log('finish publish!!');

  return true;
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"public":{"workers":{"ICSACore.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// public/workers/ICSACore.js                                                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
//import '/public/workers/libAccessibility.js';

"use strict"

var a = 0.2;
var b = 0.7;
var N = 2.5;
var TBus = 67.0;
let windowTime = 10000;

const tDistr = function(t) {
	if (t == 0) return 0.;
	t /= 30.;
	return N * Math.exp(-((a * TBus) / t) - t / (b * TBus));
};

let normTDistr = 0.;

for(let i = 0.; i < windowTime; i++){
	normTDistr += tDistr(i);
};

const tDistrN = function(t){
	return tDistr(t) / normTDistr;
};

const areaTimeCompute = function(timeP){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach( (t)=>{
    	t = parseInt(t)
    	if (t < windowTime) aTime[t] += 1
    }); 
    return aTime
};

const arrayTimeCompute = function(timeP, arrayW){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach((t,i)=>{
    	t = parseInt(t)
        if (t < windowTime) aTime[t] += arrayW[i]           
    });
    return aTime
};

const computeVelocityScore = function(timeP,areaHex){
	let areasTime = areaTimeCompute(timeP);
	return velocityScore(areasTime, areaHex);
}

const velocityScore = function(areasTime, areaHex){
    let area_new = 0.;
    let vAvg = 0.;
    let integralWindTime = 0.
    for (let time_i = 0.; time_i < areasTime.length; time_i++){
        area_new += areasTime[time_i]*areaHex;
        //console.log(area_new, vAvg,time_i, tDistrN(time_i) ,Math.PI)
        if(time_i==0){
        	 vAvg += tDistrN(1) * (Math.sqrt(area_new/Math.PI));
        	 integralWindTime += tDistrN(time_i);
     	}
        if (time_i > 0){
            vAvg += tDistrN(time_i) * (1./time_i)*(Math.sqrt(area_new/Math.PI));
            integralWindTime += tDistrN(time_i);
        }
    }
    //console.log(area_new, vAvg, integralWindTime,tDistrN(4600.))
    //vAvg /= integralWindTime;
    vAvg *= 3600.;
    return vAvg;
}

const socialityScore = function(popsTime){
    let popComul = 0.;
    let popMean = 0.;
    for (let time_i = 0; time_i < popsTime.length; time_i++){
        popComul += popsTime[time_i];
        popMean += tDistrN(time_i) * popComul;
    }
    return popMean;
};

const computeSocialityScore = function(timeP, arrayPop){
	if (timeP.length == arrayPop.length){
		let popsTime = arrayTimeCompute(timeP, arrayPop)
	 	return socialityScore(popsTime);
	 }
	return 0;
}

const ICSA = function(point, Tpoint, Tstop, arrayN, arrayC, startTime){
	"use strict"

	let TstopN = Tstop.slice();

	var P2PPos = arrayN.P2PPos;
	var P2SPos = arrayN.P2SPos;
	var S2SPos = arrayN.S2SPos;
	var P2PTime = arrayN.P2PTime;
	var P2STime = arrayN.P2STime;
	var S2STime = arrayN.S2STime;
	startTime = Math.round(startTime);
	var posPoint = point.pos;
	//console.log('point', posPoint, Tpoint[posPoint], typeof startTime)
	Tpoint[posPoint] = startTime;

	//console.log(posPoint, P2PPos[posPoint], P2SPos[posPoint], arrayC)

	// **** Initialize time for neigh point

	for (var i = 0, lenghtP = P2PPos[posPoint].length; i < lenghtP; i++) {
		//if(posPoint == 2550)
			//console.log('pointN', i, P2PPos[posPoint][i], P2PTime[posPoint][i],typeof P2PTime[posPoint][i])
		Tpoint[P2PPos[posPoint][i]] = P2PTime[posPoint][i] + startTime;
	}

	for (var i = 0, lenghtS = P2SPos[posPoint].length; i < lenghtS; i++) {
		//if(posPoint == 2550)
			//console.log('stopN', i, P2SPos[posPoint][i],P2STime[posPoint][i],  typeof P2STime[posPoint][i])
		TstopN[P2SPos[posPoint][i]] = P2STime[posPoint][i] + startTime;
	}


	//CSA-Algorithm core
	for (var c_i = 0, totC = arrayC.length; c_i < totC; c_i += 4) {
		let posStopStart = arrayC[c_i];
		let timeStartC = arrayC[c_i + 2];
		if (Tstop[posStopStart] <= timeStartC || TstopN[posStopStart] <= timeStartC) {

			var posStopArr = arrayC[c_i + 1];
			var timeArr = arrayC[c_i + 3];
			
			if (Tstop[posStopArr] > timeArr) {
				Tstop[posStopArr] = timeArr;
				let stopNArrayPos = S2SPos[posStopArr];
				if(stopNArrayPos != null){
				

					for (var stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++) {
						var posStopArrN = stopNArrayPos[stopN_i];
						var timeArrN = timeArr + S2STime[posStopArr][stopN_i];
						if (TstopN[posStopArrN] > timeArrN) {
							TstopN[posStopArrN] = timeArrN;
						}
					}
				}
			}
		}
	}

	for (var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++) {
		//if (P2SPos[point_i]) {
			for (var i = 0, lenghtS = P2SPos[point_i].length; i < lenghtS; i++) {
				var StopNPos = P2SPos[point_i][i];
				let timeStop = Tstop[StopNPos] < TstopN[StopNPos] ? Tstop[StopNPos] : TstopN[StopNPos];
				var newTime = P2STime[point_i][i] + timeStop;
				if (Tpoint[point_i] > newTime) {
					Tpoint[point_i] = newTime;
				}
			}
		//}
	}
	//if(posPoint < 10)
	//	console.log('point after', posPoint, Tpoint[posPoint],Tstop, TstopN)

	return Tpoint;
};


let ICSAPoint = function(point, arrayC, arrayN, startTime, areaHex, arrayPop ) {
	"use strict"

	arrayPop = arrayPop || [];
	const infTime = Math.round(Math.pow(10, 12));
	//console.log('starting computing');
	var totPoint = arrayN.P2SPos.length;
	var totStop = arrayN.S2SPos.length;
	var Tstop = new Array(totStop).fill(infTime);
	var Tpoint = new Array(totPoint).fill(infTime);

	var countTime = 0;
	//console.log('before treeNew');

	Tpoint =  ICSA(point, Tpoint, Tstop, arrayN, arrayC, startTime);

	let countNonReached = 0

	for(let i = 0; i < Tpoint.length; i++) {
		if(Tpoint[i] == infTime) countNonReached++
		Tpoint[i] -= startTime;
	}
	// **** Update point time after computed stop time
	//console.log(computeVel(Tpoint,areaHex))
	//console.log('ending computing', countNonReached, Tpoint.length, startTime, point.pos,Tpoint[point.pos] );
	return {
		'velocityScore': computeVelocityScore(Tpoint,areaHex),
		'socialityScore' : computeSocialityScore(Tpoint, arrayPop),
		'tPoint' : Tpoint,
		'pointNotReached' : countNonReached,
		'tStop' : Tstop,
	};
};

module.exports.ICSAPoint = ICSAPoint;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mergeArrays.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// public/workers/mergeArrays.js                                                                                //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
"use strict"


const mergeSortedCOld = function(left, right){
    var result  = new Uint32Array(left.length + right.length),
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.set([left[il],left[il+1],left[il+2],left[il+3]], il+ir);
            il+=4;
        } else {
        	result.set([right[il],right[il+1],right[il+2],right[il+3]], il+ir);
            //result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    result.set(left.slice(il), il+ir)
    result.set(right.slice(ir), il+ir)


    return result;
};

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

const mergeArrayN = function(arrayNDef, arrayN2Add, field){
    let arrayNResult = []
    arrayNResult = arrayNDef.map((originArray, pos)=>{
        let isToAdd = pos in arrayN2Add;
        if(isToAdd){
            let toAdd = []
            toAdd = arrayN2Add[pos][field]
            let newLength = originArray.length + toAdd.length;
            let newArray = new Uint32Array(newLength);
            newArray.set(originArray);
            newArray.set(toAdd, originArray.length);
            if(field == "pos" && pos==2550)
                console.log(originArray,pos, arrayN2Add[pos][field], newArray, originArray.length)

            return newArray}
        else{
            return originArray;
        }
    });

    for (let pos in arrayN2Add){
        let array2Add = arrayN2Add[pos];
        if(!(pos in  arrayNDef)){
            arrayNResult[pos] = new Uint32Array(array2Add[field])
        }
    }
    return arrayNResult;
}

module.exports.mergeArrayN = mergeArrayN;
module.exports.mergeSortedC = mergeSortedC;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9saWIvbmV3U2NlbmFyaW9MaWIvYWRkTmV3TGluZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvbGliL25ld1NjZW5hcmlvTGliL2FkZE5ld1N0b3BzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL2xpYi91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9sb2FkQ2l0aWVzRGF0YS5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9zY2VuYXJpb0RlZi5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zZXJ2ZXIvbWV0aG9kcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9zZXJ2ZXIvcm91dGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL0RCcy9zY2VuYXJpb0RCLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9pbXBvcnRzL3BhcmFtZXRlcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsImFkZE5ld0xpbmVzIiwibWVyZ2VTb3J0ZWRDIiwid2F0Y2giLCJyZXF1aXJlIiwidiIsInRpbWVzT2ZEYXkiLCJtYXhEdXJhdGlvbiIsIm1ldHJvU3BlZWRzIiwibWV0cm9GcmVxdWVuY2llcyIsIm1hdGgiLCJkZWZhdWx0IiwidHVyZiIsImNvbXB1dGVUZm9yMlN0b3BzIiwiZGlzdCIsIlZmIiwiYSIsIlRhIiwiRElTVGEiLCJzcXJ0Iiwicm91bmQiLCJmaW5kU3BlZWQiLCJuYW1lIiwic3BlZWQiLCJ0b3BTcGVlZCIsImZpbmRBY2NlbCIsImFjY2VsZXJhdGlvbiIsImZpbmRGcmVxIiwiZnJlcSIsImZyZXF1ZW5jeSIsIm1ldHJvTGluZXNGZXRjaGVkIiwibGltVCIsImRvY2tUaW1lIiwic3RvcHNMaW5lcyIsIl8iLCJlYWNoIiwibGluZSIsInN0b3BzIiwiZm9yRWFjaCIsInN0b3AiLCJpbmRleFN0b3AiLCJsaW5lTmFtZSIsInBvaW50IiwibGF0bG5nIiwicG9zIiwic3BlZWROYW1lIiwiYWNjZWwiLCJmcmVxdWVuY3lOYW1lIiwicG9pbnRzIiwicHVzaCIsImNBcnJheVRlbXAiLCJmcmVxVGltZSIsInN0YXJ0aW5nU3RvcFRpbWUiLCJlbmRUaW1lIiwic3RhcnRTdG9wUG9pbnQiLCJzdGFydFN0b3BQb3MiLCJzdG9wX2kiLCJsZW5ndGgiLCJlbmRTdG9wUG9pbnQiLCJlbmRTdG9wUG9zIiwiZGlzdGFuY2UiLCJ0aW1lRGlzdCIsImVuZGluZ1RpbWUiLCJjQXJyYXkyQWRkIiwiU3RhcnRpbmdUaW1lVGVtcCIsInRvdFN0b3AiLCJ1cGRhdGVBcnJheXNXYWl0IiwidXBkYXRlQXJyYXlzIiwiZmlsbDJBZGRBcnJheSIsImRlbGV0ZUVtcHR5SXRlbSIsInBhcmFtZXRlcnMiLCJhcnJheTJBZGQiLCJrZXkiLCJudW0iLCJpIiwiY29tcHV0ZU5laWdoIiwiUDJTMkFkZCIsIlMyUzJBZGQiLCJzZXJ2ZXJPU1JNIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXJ2ZXJVcmwiLCJ1cmxCYXNlIiwiY29vciIsInVybFBvaW50cyIsInNsaWNlIiwidXJsU3RvcHMiLCJwb3NTdG9wIiwiTWF4RGlzdGFuY2UiLCJtYXhEaXN0YW5jZVdhbGsiLCJOZWFyU3BoZXJlIiwiJG5lYXIiLCIkZ2VvbWV0cnkiLCIkbWF4RGlzdGFuY2UiLCJzdG9wc05MaXN0Iiwic3RvcHNGaW5kIiwiZmluZCIsImZpZWxkcyIsInNvcnQiLCJzdG9wTiIsImNvb3JkaW5hdGVzIiwicG9pbnRzTkxpc3QiLCJwb2ludHNGaW5kIiwicG9pbnROIiwiZ2V0UG9pbnRzIiwiSFRUUCIsImdldCIsImVycm9yMiIsInJlc3VsdDIiLCJjb25zb2xlIiwibG9nIiwiZXJyb3IiLCJyZXN1bHRQb2ludHMiLCJkYXRhIiwiZHVyYXRpb25zIiwidGltZSIsImNvdW50UG9pbnRBZGRlZCIsInBvaW50Tl9pIiwibWF4VGltZVdhbGsiLCJwb3NQb2ludE4iLCJ0aW1lUG9pbnROIiwicmVzdWx0IiwicmVzdWx0U3RvcHMiLCJzdG9wTl9pIiwicG9zU3RvcE4iLCJ0aW1lU3RvcE4iLCJpbmNsdWRlcyIsInBvc1RlbXAiLCJpbmRleE9mIiwiY2l0eSIsInN0b3BzQ29sbGVjdGlvbiIsInBvaW50c0NvbGxlY3Rpb25zIiwic2NlbmFyaW8iLCJyZW1vdmUiLCJ0ZW1wIiwibGluZXMiLCJpbmRleExpbmUiLCJzaXplIiwiaW5zZXJ0IiwiRGF0ZSIsImdldFRpbWUiLCJuZXdTdG9wcyIsInByb21pc2VBZGRTdG9wIiwiY291bnQiLCJhbGwiLCJ0aGVuIiwidmFsdWVzIiwiY29weUFycmF5TiIsImxlZnQiLCJyaWdodCIsImlsIiwiaXIiLCJjb25jYXQiLCJvYmoiLCJtYXAiLCJhcnIiLCJjaXRpZXNEYXRhIiwibGlzdENpdGllcyIsImFkZERhdGFGcm9tWmlwIiwibG9hZENpdHkiLCJmcyIsIkpTWmlwIiwic2NlbmFyaW9EQiIsImNvbXB1dGVTY2VuYXJpbyIsIm1ldGVvclJvb3QiLCJyZWFscGF0aFN5bmMiLCJwcm9jZXNzIiwiY3dkIiwicHVibGljUGF0aCIsInBhdGgiLCJuYW1lRmlsZSIsIk1ldGVvciIsInNldHRpbmdzIiwicHVibGljIiwicmVhZEZpbGUiLCJlcnIiLCJsb2FkQXN5bmMiLCJ6aXAiLCJmaWxlIiwiYXN5bmMiLCJkYXRhMiIsImNpdHlEYXRhIiwiSlNPTiIsInBhcnNlIiwic3BsaXQiLCJwb3AiLCJPU1JNX1NFUlZFUiIsImRhdGEzIiwicCIsIm5ld1NjZW5hcmlvIiwicmV2ZXJzZSIsInJlYWRkaXJTeW5jIiwiY3V0QXJyYXlDIiwiY29tcHV0ZVNjZW5hcmlvRGVmYXVsdCIsImFkZENpdHlUb0xpc3QiLCJFSlNPTiIsImluaXRTY2VuYXJpbyIsImNvbXB1dGVTY29yZU5ld1NjZW5hcmlvIiwib24iLCJiaW5kIiwid29ya2VyIiwiYXZnRW1BbGwiLCJhcnJheXMiLCJpMiIsInN0YXJ0VGltZSIsImFycmF5QyIsImluZGV4RW5kIiwiaW5kZXhTdGFydCIsInBhcnNlSW50IiwiYXJyYXlDQ3V0IiwiZGF0YUNpdHkiLCJzdGFydFRpbWVzIiwic2V0VGltZW91dCIsImxpc3RQb2ludHMiLCJhcnJheU4iLCJhcmVhSGV4Iiwic3RvcHNMaXN0IiwiYXJyYXlQb3AiLCJyZXN1bHRzIiwicGVyTGltIiwidGltZV9pIiwicGVyY2VudGFnZSIsInZlbG9jaXR5U2NvcmUiLCJzb2NpYWxpdHlTY29yZSIsInBvaW50X2kiLCJyZXR1cm5lZCIsIklDU0FQb2ludCIsInRvU3RyaW5nIiwibW9tZW50cyIsIm1vbWVudCIsInZlbG9jaXRpZXMiLCJzb2NpYWxpdGllcyIsIk9iamVjdCIsImtleXMiLCJzY2VuYXJpb0RlZiIsIk1vbmdvIiwibWVyZ2VBcnJheXMiLCJtZXRob2RzIiwic2NlbmFyaW9JRCIsImZpbmRPbmUiLCJ3VGltZSIsImFycmF5QzJBZGQiLCJhcnJheU5EZWYiLCJtZXJnZUFycmF5TiIsIlAyU1BvcyIsIlAyU1RpbWUiLCJTMlNQb3MiLCJTMlNUaW1lIiwiUDJQUG9zIiwiUDJQVGltZSIsInBvaW50c1ZlbnVlcyIsInRQb2ludCIsImRhdGFUb1JldHVybiIsInVuZGVmaW5lZCIsIlJvdXRlciIsImNoZWNrQ2l0aWVzIiwiY29tcHV0ZURhdGFDaXR5IiwiY29tcHV0ZU9ubHlTY2VuYXJpb0RlZmF1bHQiLCJyb3V0ZSIsInBhcmFtcyIsInJlc3BvbnNlIiwiZW5kIiwid2hlcmUiLCJUZW1wbGF0ZSIsIkNvbGxlY3Rpb24iLCJpc1NlcnZlciIsIl9lbnN1cmVJbmRleCIsImF1dGhvciIsInRpbWVzIiwiT2JqZWN0SUQiLCJzY29yZXMiLCJwb3BBcnJheSIsInRvdFBvcCIsInJlZHVjZSIsImIiLCJ2ZWwiLCJzb2MiLCJ1cGRhdGUiLCJpZCIsIl9pZCIsInRpdGxlIiwicmVzIiwibnVtTW9kaWZpZWQiLCJyZWFjdGl2ZSIsInNlYXJjaCIsIndhbGtpbmdWZWxvY2l0eSIsImNvbG9yQ2xhc3MiLCJzdGFydHVwIiwibG9kYXNoIiwicHVibGlzaCIsInNjZW5hcmlvTGlzdCIsImZpZWxkIiwibGlzdE9mSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE9BQU9DLE1BQVAsQ0FBYztBQUFDQyxlQUFZLE1BQUlBO0FBQWpCLENBQWQ7QUFBNkMsSUFBSUMsWUFBSjtBQUFpQkgsT0FBT0ksS0FBUCxDQUFhQyxRQUFRLHVCQUFSLENBQWIsRUFBOEM7QUFBQ0YsZUFBYUcsQ0FBYixFQUFlO0FBQUNILG1CQUFhRyxDQUFiO0FBQWU7O0FBQWhDLENBQTlDLEVBQWdGLENBQWhGO0FBQW1GLElBQUlDLFVBQUosRUFBZUMsV0FBZixFQUEyQkMsV0FBM0IsRUFBdUNDLGdCQUF2QztBQUF3RFYsT0FBT0ksS0FBUCxDQUFhQyxRQUFRLHdCQUFSLENBQWIsRUFBK0M7QUFBQ0UsYUFBV0QsQ0FBWCxFQUFhO0FBQUNDLGlCQUFXRCxDQUFYO0FBQWEsR0FBNUI7O0FBQTZCRSxjQUFZRixDQUFaLEVBQWM7QUFBQ0Usa0JBQVlGLENBQVo7QUFBYyxHQUExRDs7QUFBMkRHLGNBQVlILENBQVosRUFBYztBQUFDRyxrQkFBWUgsQ0FBWjtBQUFjLEdBQXhGOztBQUF5RkksbUJBQWlCSixDQUFqQixFQUFtQjtBQUFDSSx1QkFBaUJKLENBQWpCO0FBQW1COztBQUFoSSxDQUEvQyxFQUFpTCxDQUFqTDtBQUFvTCxJQUFJSyxJQUFKO0FBQVNYLE9BQU9JLEtBQVAsQ0FBYUMsUUFBUSxRQUFSLENBQWIsRUFBK0I7QUFBQ08sVUFBUU4sQ0FBUixFQUFVO0FBQUNLLFdBQUtMLENBQUw7QUFBTzs7QUFBbkIsQ0FBL0IsRUFBb0QsQ0FBcEQ7QUFBdUQsSUFBSU8sSUFBSjtBQUFTYixPQUFPSSxLQUFQLENBQWFDLFFBQVEsTUFBUixDQUFiLEVBQTZCO0FBQUNPLFVBQVFOLENBQVIsRUFBVTtBQUFDTyxXQUFLUCxDQUFMO0FBQU87O0FBQW5CLENBQTdCLEVBQWtELENBQWxEOztBQUt0YyxTQUFTUSxpQkFBVCxDQUEyQkMsSUFB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QWlDO0FBQzVELFdBQU9ySCxXQUFXbEUsSUFBWCxDQUFnQjtBQUFDLGFBQU11TCxHQUFQO0FBQVksY0FBU3RKLElBQXJCO0FBQTJCLGlCQUFVO0FBQUMsbUJBQVU7QUFBWDtBQUFyQyxLQUFoQixFQUF3RTtBQUFDL0IsWUFBSztBQUFDLHdCQUFlLENBQUM7QUFBakI7QUFBTixLQUF4RSxDQUFQO0FBQ0QsR0FGRCxFQWhCbUIsQ0FvQm5COztBQUVBLFNBQU8sSUFBUDtBQUNELENBdkJELEUiLCJmaWxlIjoiL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1lcmdlU29ydGVkQyB9IGZyb20gJy9pbXBvcnRzL2xpYi91dGlscy5qcyc7XG5pbXBvcnQgeyB0aW1lc09mRGF5LCBtYXhEdXJhdGlvbiwgbWV0cm9TcGVlZHMsIG1ldHJvRnJlcXVlbmNpZXMgIH0gZnJvbSAnL2ltcG9ydHMvcGFyYW1ldGVycy5qcyc7XG5pbXBvcnQgbWF0aCBmcm9tICdtYXRoanMnO1xuaW1wb3J0IHR1cmYgZnJvbSAndHVyZic7XG5cbmZ1bmN0aW9uIGNvbXB1dGVUZm9yMlN0b3BzKGRpc3QsIFZmLCBhKXsvL2Rpc3QgaW4gbWV0ZXJzXG5cdC8vIGNvbnN0IFZmID0gMzA7IC8vIG1heCBzcGVlZCAxMDBrbS9oXG5cdC8vIGNvbnN0IGEgPSAxLjM7IC8vYWNjZWxlcmF0aW9uIDEuMyBtL3NeMlxuXHRjb25zdCBUYSA9IFZmIC8gYTsgLy90aW1lIG5lZWRlZCB0byByZWFjaCBtYXggdmVsb2NpdHlcblx0Y29uc3QgRElTVGEgPSAwLjUgKiBhICogVGEgKiBUYTsgLy9kaXN0IHRvIHJlYWNoIHRoZSBtYXhpbXVuIHZlbG9jaXR5XG5cblx0aWYoZGlzdCAvIDIuMCA8PSBESVNUYSl7XG5cdFx0cmV0dXJuIDIgKiBtYXRoLnNxcnQoZGlzdCk7XG5cdH1lbHNle1xuXHRcdC8vY29uc29sZS5sb2coJ1RpbWVEaXN0ICcsIERJU1RhLCBtYXRoLnNxcnQoRElTVGEpLCAoZGlzdCAtIDIuICogRElTVGEpIC8gVmYpO1xuXHRcdHJldHVybiBtYXRoLnJvdW5kKDIgKiBtYXRoLnNxcnQoRElTVGEpICsgKGRpc3QgLSAyLjAgKiBESVNUYSkgLyBWZik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZmluZFNwZWVkKG5hbWUpIHtcblx0Zm9yICh2YXIgc3BlZWQgb2YgbWV0cm9TcGVlZHMpIHtcblx0XHRpZiAoc3BlZWQubmFtZSA9PSBuYW1lKVxuXHRcdFx0cmV0dXJuIHNwZWVkLnRvcFNwZWVkO1xuXHR9XG5cdHJldHVybiAzMDtcbn1cblxuZnVuY3Rpb24gZmluZEFjY2VsKG5hbWUpIHtcblx0Zm9yICh2YXIgc3BlZWQgb2YgbWV0cm9TcGVlZHMpIHtcblx0XHRpZiAoc3BlZWQubmFtZSA9PSBuYW1lKVxuXHRcdFx0cmV0dXJuIHNwZWVkLmFjY2VsZXJhdGlvbjtcblx0fVxuXHRyZXR1cm4gMS4zO1xufVxuXG5mdW5jdGlvbiBmaW5kRnJlcShuYW1lKSB7XG5cdGZvciAodmFyIGZyZXEgb2YgbWV0cm9GcmVxdWVuY2llcykge1xuXHRcdGlmIChmcmVxLm5hbWUgPT0gbmFtZSlcblx0XHRcdHJldHVybiBmcmVxLmZyZXF1ZW5jeTtcblx0fVxuXHRyZXR1cm4gMio2MDtcbn1cblxuZnVuY3Rpb24gYWRkTmV3TGluZXMobWV0cm9MaW5lc0ZldGNoZWQsIGxpbVQpe1xuXG5cdGNvbnN0IGRvY2tUaW1lID0gMTU7IC8vdGltZSB0aGUgdHJhaW5zIGlzIHN0b3BwZWQgYXQgZG9ja1xuXG5cdHZhciBzdG9wc0xpbmVzID0ge307XG5cdC8vY29uc29sZS5sb2coJ21ldHJvTGluZXNGZXRjaGVkJywgbWV0cm9MaW5lc0ZldGNoZWQpXG5cblx0Xy5lYWNoKG1ldHJvTGluZXNGZXRjaGVkLCBmdW5jdGlvbihsaW5lKXtcblx0XHRsaW5lLnN0b3BzLmZvckVhY2goZnVuY3Rpb24oc3RvcCwgaW5kZXhTdG9wKXtcblx0XHRcdGlmKGluZGV4U3RvcCA9PT0gMCl7XG5cdFx0XHRcdHN0b3BzTGluZXNbbGluZS5saW5lTmFtZV0gPSB7XG5cdFx0XHRcdFx0J3BvaW50cycgOiBbdHVyZi5wb2ludChbc3RvcC5sYXRsbmdbMV0sIHN0b3AubGF0bG5nWzBdXSldLFxuXHRcdFx0XHRcdCdwb3MnIDogW3N0b3AucG9zXSxcblx0XHRcdFx0XHRzcGVlZDogZmluZFNwZWVkKGxpbmUuc3BlZWROYW1lKSxcblx0XHRcdFx0XHRhY2NlbDogZmluZEFjY2VsKGxpbmUuc3BlZWROYW1lKSxcblx0XHRcdFx0XHRmcmVxdWVuY3k6IGZpbmRGcmVxKGxpbmUuZnJlcXVlbmN5TmFtZSlcblx0XHRcdFx0fTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRzdG9wc0xpbmVzW2xpbmUubGluZU5hbWVdLnBvaW50cy5wdXNoKHR1cmYucG9pbnQoW3N0b3AubGF0bG5nWzFdLCBzdG9wLmxhdGxuZ1swXV0pKTtcblx0XHRcdFx0c3RvcHNMaW5lc1tsaW5lLmxpbmVOYW1lXS5wb3MucHVzaChzdG9wLnBvcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8vY29uc29sZS5sb2coc3RvcHNMaW5lcyk7XG5cdC8qXG5cdG1ldHJvLmZpbmQoe3RlbXA6dHJ1ZX0sIHtzb3J0OiB7J3RpbWVDcmVhdGlvbic6MX19KS5mb3JFYWNoKGZ1bmN0aW9uKHN0b3Ape1xuXHRcdGlmKHN0b3AubGluZSBpbiBzdG9wc0xpbmVzKSB7XG5cdFx0XHRzdG9wc0xpbmVzW3N0b3AubGluZV0ucG9pbnRzLnB1c2goc3RvcC5wb2ludCk7XG5cdFx0XHRzdG9wc0xpbmVzW3N0b3AubGluZV0ucG9zLnB1c2goc3RvcC5wb3MpO1xuXHRcdH1lbHNle1xuXHRcdFx0c3RvcHNMaW5lc1tzdG9wLmxpbmVdID0geydwb2ludHMnIDogW3N0b3AucG9pbnRdLCAncG9zJyA6IFtzdG9wLnBvc119O1xuXHRcdH1cblx0fSk7Ki9cblx0Ly9jb25zb2xlLmxvZygnYWRkTkV3TGluZXMnLCBzdG9wc0xpbmVzKTtcblx0Ly9jb25uZWN0aW9ucy5yZW1vdmUoeyd0ZW1wJyA6IHRydWV9KTtcblx0bGV0IGNBcnJheVRlbXAgPSBbXTtcblxuXHRfLmVhY2goc3RvcHNMaW5lcywgZnVuY3Rpb24obGluZSwgbGluZU5hbWUpe1xuXHRcdC8vY29uc29sZS5sb2cobGluZXMpO1xuXHRcdGxldCBmcmVxVGltZSA9IGxpbmUuZnJlcXVlbmN5O1xuXHRcdGxldCBzcGVlZCA9IGxpbmUuc3BlZWQ7XG5cdFx0bGV0IGFjY2VsID0gbGluZS5hY2NlbDtcblxuXHRcdGlmICghZnJlcVRpbWUpXG5cdFx0XHRyZXR1cm47IC8va25vY2sgb3V0IGxpbmVhXG5cblx0XHRsZXQgc3RhcnRpbmdTdG9wVGltZSA9IDUqMzYwMDsgLy9saW5lIHN0YXJ0cyBhdCA1YW1cblx0XHRsZXQgZW5kVGltZSA9IDI0KjM2MDA7IC8vbGluZSBlbmRzIGF0IDEycG1cblxuXHRcdGxldCBzdGFydFN0b3BQb2ludCA9IGxpbmUucG9pbnRzWzBdO1xuXHRcdGxldCBzdGFydFN0b3BQb3MgPSBsaW5lLnBvc1swXTtcblx0XHQvL2NvbnNvbGUubG9nKHN0YXJ0U3RvcFBvaW50KTtcblxuXHRcdC8vKiogT25lIGRpcmVjdGlvblxuXHRcdGZvcihsZXQgc3RvcF9pID0gMTsgc3RvcF9pIDwgbGluZS5wb2ludHMubGVuZ3RoOyBzdG9wX2krKyl7XG5cdFx0XHRsZXQgZW5kU3RvcFBvaW50ID0gbGluZS5wb2ludHNbc3RvcF9pXTtcblx0XHRcdGxldCBlbmRTdG9wUG9zID0gbGluZS5wb3Nbc3RvcF9pXTtcblx0XHRcdC8vY29uc29sZS5sb2coc3RhcnRTdG9wUG9pbnQsIGVuZFN0b3BQb2ludCk7XG5cdFx0XHRsZXQgZGlzdCA9ICB0dXJmLmRpc3RhbmNlKHN0YXJ0U3RvcFBvaW50LCBlbmRTdG9wUG9pbnQsICdraWxvbWV0ZXJzJykgKiAxMDAwLjA7XG5cdFx0XHRsZXQgdGltZURpc3QgPSBjb21wdXRlVGZvcjJTdG9wcyhkaXN0LCBzcGVlZCwgYWNjZWwpO1xuXHRcdFx0bGV0IGVuZGluZ1RpbWUgPSBzdGFydGluZ1N0b3BUaW1lICsgdGltZURpc3Q7XG5cdFx0XHRsZXQgY0FycmF5MkFkZCA9IFtdO1xuXHRcdFx0Zm9yKGxldCBTdGFydGluZ1RpbWVUZW1wID0gc3RhcnRpbmdTdG9wVGltZTsgU3RhcnRpbmdUaW1lVGVtcCArIHRpbWVEaXN0IDw9IGVuZFRpbWU7IFN0YXJ0aW5nVGltZVRlbXAgKz0gZnJlcVRpbWUpe1xuXHRcdFx0XHRpZihTdGFydGluZ1RpbWVUZW1wID49ICBsaW1UWzBdICYmIFN0YXJ0aW5nVGltZVRlbXAgKyB0aW1lRGlzdCA8PSBsaW1UWzFdKXtcblx0XHRcdFx0XHRjQXJyYXkyQWRkLnB1c2goc3RhcnRTdG9wUG9zLCBlbmRTdG9wUG9zLCBTdGFydGluZ1RpbWVUZW1wICwgU3RhcnRpbmdUaW1lVGVtcCArIHRpbWVEaXN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y0FycmF5VGVtcCA9IG1lcmdlU29ydGVkQyhjQXJyYXlUZW1wLCBjQXJyYXkyQWRkKTtcblx0XHRcdHN0YXJ0aW5nU3RvcFRpbWUgPSBlbmRpbmdUaW1lICsgZG9ja1RpbWU7XG5cdFx0XHRzdGFydFN0b3BQb2ludCA9IGxpbmUucG9pbnRzW3N0b3BfaV07XG5cdFx0XHRzdGFydFN0b3BQb3MgPSBsaW5lLnBvc1tzdG9wX2ldO1xuXHRcdH1cblx0XHQvLyAqKiogT3Bwb3NpdGUgZGlyZWN0aW9uXG5cdFx0c3RhcnRpbmdTdG9wVGltZSA9IDUqMzYwMDsgLy9saW5lIHN0YXJ0cyBhdCA1YW1cblx0XHRlbmRUaW1lID0gMjQqMzYwMDsgLy9saW5lIGVuZHMgYXQgMTJwbVxuXHRcdHZhciB0b3RTdG9wID0gbGluZS5wb2ludHMubGVuZ3RoLTE7XG5cdFx0c3RhcnRTdG9wUG9pbnQgPSBsaW5lLnBvaW50c1t0b3RTdG9wXTtcblx0XHRzdGFydFN0b3BQb3MgPSBsaW5lLnBvc1t0b3RTdG9wXTtcblx0XHRmb3IobGV0IHN0b3BfaSA9IHRvdFN0b3AgLTEgOyBzdG9wX2kgPj0gMDsgc3RvcF9pLS0pe1xuXHRcdFx0bGV0IGVuZFN0b3BQb2ludCA9IGxpbmUucG9pbnRzW3N0b3BfaV07XG5cdFx0XHRsZXQgZW5kU3RvcFBvcyA9IGxpbmUucG9zW3N0b3BfaV07XG5cdFx0XHRsZXQgZGlzdCA9ICB0dXJmLmRpc3RhbmNlKHN0YXJ0U3RvcFBvaW50LCBlbmRTdG9wUG9pbnQsICdraWxvbWV0ZXJzJykgKiAxMDAwLjA7XG5cdFx0XHRsZXQgdGltZURpc3QgPSBjb21wdXRlVGZvcjJTdG9wcyhkaXN0LCBzcGVlZCwgYWNjZWwpO1xuXHRcdFx0bGV0IGVuZGluZ1RpbWUgPSBzdGFydGluZ1N0b3BUaW1lICsgdGltZURpc3Q7XG5cdFx0XHRsZXQgY0FycmF5MkFkZCA9IFtdO1xuXHRcdFx0Zm9yKGxldCBTdGFydGluZ1RpbWVUZW1wID0gc3RhcnRpbmdTdG9wVGltZTsgU3RhcnRpbmdUaW1lVGVtcCArIHRpbWVEaXN0IDw9IGVuZFRpbWU7IFN0YXJ0aW5nVGltZVRlbXAgKz0gZnJlcVRpbWUpe1xuXHRcdFx0XHRpZihTdGFydGluZ1RpbWVUZW1wID49ICBsaW1UWzBdICYmIFN0YXJ0aW5nVGltZVRlbXAgKyB0aW1lRGlzdCA8PSBsaW1UWzFdKXtcblx0XHRcdFx0XHRjQXJyYXkyQWRkLnB1c2goc3RhcnRTdG9wUG9zLCBlbmRTdG9wUG9zLCBTdGFydGluZ1RpbWVUZW1wICwgU3RhcnRpbmdUaW1lVGVtcCArIHRpbWVEaXN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y0FycmF5VGVtcCA9IG1lcmdlU29ydGVkQyhjQXJyYXlUZW1wLCBjQXJyYXkyQWRkKTtcblx0XHRcdHN0YXJ0aW5nU3RvcFRpbWUgPSBlbmRpbmdUaW1lICsgZG9ja1RpbWU7XG5cdFx0XHRzdGFydFN0b3BQb2ludCA9IGxpbmUucG9pbnRzW3N0b3BfaV07XG5cdFx0XHRzdGFydFN0b3BQb3MgPSBsaW5lLnBvc1tzdG9wX2ldO1xuXHRcdH1cblxuXG5cdH0pO1xuXHQvL2NvbnNvbGUubG9nKGNBcnJheVRlbXAubGVuZ3RoKVxuXHRyZXR1cm4gY0FycmF5VGVtcDtcblx0Ly9jb25zb2xlLmxvZyhzdG9wc0xpbmVzKTtcbn1cblxuZXhwb3J0IHthZGROZXdMaW5lc307XG4iLCJpbXBvcnQgKiBhcyBwYXJhbWV0ZXJzIGZyb20gJy9pbXBvcnRzL3BhcmFtZXRlcnMuanMnXG5pbXBvcnQgbWF0aCBmcm9tICdtYXRoanMnO1xuXG5jb25zdCBkZWxldGVFbXB0eUl0ZW0gPSBmdW5jdGlvbihhcnJheTJBZGQpe1xuXHRmb3IobGV0IGtleSBpbiBhcnJheTJBZGQpe1xuXHRcdGlmKGFycmF5MkFkZFtrZXldLnBvcy5sZW5ndGggPT0gMClcblx0XHRcdGRlbGV0ZSBhcnJheTJBZGRba2V5XTsgXG5cdH1cbn07XG5cbmNvbnN0IGZpbGwyQWRkQXJyYXkgPSBmdW5jdGlvbihudW0pe1xuXHRsZXQgYXJyYXkyQWRkID0ge31cblx0Zm9yKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKXtcblx0XHRhcnJheTJBZGRbaV0gPSB7XG4gICAgICAgIFx0J3BvcycgOiBbXSxcbiAgICAgICAgICAgICd0aW1lJyA6IFtdXG4gICAgICAgIH07XG5cdH1cblx0cmV0dXJuIGFycmF5MkFkZDtcbn07XG5cbmNvbnN0IGNvbXB1dGVOZWlnaCA9IGZ1bmN0aW9uKHN0b3AsIHN0b3BzLCBQMlMyQWRkLCBTMlMyQWRkLCBwb2ludHMsIHNlcnZlck9TUk0pe1xuXHRyZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCApe1xuXHRcdGxldCBzZXJ2ZXJVcmwgPSBzZXJ2ZXJPU1JNO1xuXHRcdGxldCB1cmxCYXNlID0gIHNlcnZlclVybCtcInRhYmxlL3YxL2Zvb3QvXCIgKyBzdG9wLmNvb3JbMF0gKyAnLCcgKyBzdG9wLmNvb3JbMV0gKyAnOyc7XG5cdFx0bGV0IHVybFBvaW50cyA9IHVybEJhc2Uuc2xpY2UoMCk7XG5cdFx0bGV0IHVybFN0b3BzID0gdXJsQmFzZS5zbGljZSgwKTtcblx0XHRsZXQgcG9zU3RvcCA9IHN0b3AucG9zO1xuXHRcdGxldCBNYXhEaXN0YW5jZSA9IHBhcmFtZXRlcnMubWF4RGlzdGFuY2VXYWxrO1xuXHRcdGxldCBOZWFyU3BoZXJlID0ge1xuXHRcdFx0XHRcdFx0XHQkbmVhcjoge1xuXHRcdFx0XHRcdFx0ICAgICRnZW9tZXRyeTogeyd0eXBlJzogJ1BvaW50JywgJ2Nvb3JkaW5hdGVzJyA6IHN0b3AuY29vcn0sXG5cdFx0XHRcdFx0XHQgICAgJG1heERpc3RhbmNlOiBNYXhEaXN0YW5jZVxuXHRcdFx0XHRcdFx0ICBcdH0sXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0bGV0IHN0b3BzTkxpc3QgPSBbXTtcblx0XHRsZXQgc3RvcHNGaW5kID0gc3RvcHMuZmluZCh7J3BvaW50JzpOZWFyU3BoZXJlfSwge2ZpZWxkczp7J3BvaW50JzoxLCAncG9zJzoxfSwgc29ydDp7J3Bvcyc6MX19KTtcblx0XHRcblx0XHRzdG9wc0ZpbmQuZm9yRWFjaChmdW5jdGlvbihzdG9wTil7XG5cdCAgICAgIFx0c3RvcHNOTGlzdC5wdXNoKHN0b3BOKTtcblx0ICAgICAgIFx0dXJsU3RvcHMgKz0gc3RvcE4ucG9pbnQuY29vcmRpbmF0ZXNbMF0gKyAnLCcgKyBzdG9wTi5wb2ludC5jb29yZGluYXRlc1sxXSArICc7Jztcblx0ICAgIH0pO1xuXG5cdCAgXHRsZXQgcG9pbnRzTkxpc3QgPSBbXTtcblx0XHRsZXQgcG9pbnRzRmluZCA9IHBvaW50cy5maW5kKHsncG9pbnQnOk5lYXJTcGhlcmV9LCB7ZmllbGRzOnsncG9pbnQnOjEsICdwb3MnOjF9LCBzb3J0OnsncG9zJzoxfX0pO1xuXG5cdFx0cG9pbnRzRmluZFxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24ocG9pbnROKXtcblx0ICAgICAgICAgIFx0cG9pbnRzTkxpc3QucHVzaChwb2ludE4pO1xuXHQgICAgICAgICAgXHR1cmxQb2ludHMgKz0gcG9pbnROLnBvaW50LmNvb3JkaW5hdGVzWzBdICsgJywnICsgcG9pbnROLnBvaW50LmNvb3JkaW5hdGVzWzFdICsgJzsnO1xuXHQgICAgfSk7XG5cblx0ICAgIHVybFN0b3BzID0gdXJsU3RvcHMuc2xpY2UoMCwtMSkgKyAnP3NvdXJjZXM9MCc7XG5cdCAgICB1cmxQb2ludHMgPSB1cmxQb2ludHMuc2xpY2UoMCwtMSkgKyAnP3NvdXJjZXM9MCc7XG5cdCAgICAvL2NvbnNvbGUubG9nKFwibnVtYmVyIG9mIG5laWdzXCIsIHN0b3AsIHBvaW50c05MaXN0Lmxlbmd0aCwgc3RvcHNOTGlzdC5sZW5ndGgsIE1heERpc3RhbmNlKTtcbiAgICAgIFx0dmFyIGdldFBvaW50cyA9IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIGlmIChwb2ludHNOTGlzdC5sZW5ndGggPCAxKSB7XG5cdCAgICAgICAgICByZXNvbHZlKFtzdG9wLHBvaW50c05MaXN0LHN0b3BzTkxpc3RdKTtcblx0ICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBIVFRQLmdldCh1cmxQb2ludHMsIGZ1bmN0aW9uIChlcnJvcjIsIHJlc3VsdDIpe1xuXHQgIFx0XHRcdFx0aWYoZXJyb3IyKSB7XG5cdCAgXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvciBIVFRQIGNhbGwgUG9pbnQnLCBzZXJ2ZXJVcmwsIGVycm9yKTtcblx0ICBcdFx0XHRcdFx0cmVqZWN0KCdlcnJvciBodHRwIHJlcXVlc3QnKTtcblx0ICBcdFx0XHRcdH1lbHNle1xuXG5cdCAgXHRcdFx0XHRcdGxldCByZXN1bHRQb2ludHMgPSByZXN1bHQyLmRhdGE7XG5cdCAgXHRcdFx0XHQgICBcdGlmKCdkdXJhdGlvbnMnIGluIHJlc3VsdFBvaW50cyl7XG5cdCAgXHRcdFx0XHRcdFx0Zm9yKGxldCBpID0gMTsgaSA8IHJlc3VsdFBvaW50cy5kdXJhdGlvbnNbMF0ubGVuZ3RoOyBpKyspe1xuXHQgIFx0XHRcdFx0XHRcdFx0bGV0IHRpbWUgPSBtYXRoLnJvdW5kKHJlc3VsdFBvaW50cy5kdXJhdGlvbnNbMF1baV0pO1xuXHQgIFx0XHRcdFx0XHRcdFx0cG9pbnRzTkxpc3RbaS0xXS50aW1lID0gdGltZTtcblx0ICBcdFx0XHRcdFx0XHR9XG5cdCAgXHRcdFx0XHRcdH1cblx0ICBcdFx0XHRcdFx0bGV0IGNvdW50UG9pbnRBZGRlZCA9IDA7XG5cdCAgXHRcdFx0XHRcdGZvcihsZXQgcG9pbnROX2kgPSAwOyBwb2ludE5faSA8IHBvaW50c05MaXN0Lmxlbmd0aDsgcG9pbnROX2krKyl7XG5cdCAgXHRcdFx0XHRcdFx0aWYocG9pbnRzTkxpc3RbcG9pbnROX2ldLnRpbWUgPCBwYXJhbWV0ZXJzLm1heFRpbWVXYWxrKXtcblx0XHRcdFx0ICAgICAgICAgICAgICAgIGxldCBwb3NQb2ludE4gPSBwb2ludHNOTGlzdFtwb2ludE5faV0ucG9zXG5cdFx0XHRcdCAgICAgICAgICAgICAgICBsZXQgdGltZVBvaW50TiA9IHBvaW50c05MaXN0W3BvaW50Tl9pXS50aW1lO1xuXHRcdFx0ICAgICAgICAgICAgICAgICAgXHRQMlMyQWRkW3Bvc1BvaW50Tl0ucG9zLnB1c2goc3RvcC5wb3MpXG5cdFx0XHQgICAgICAgICAgICAgICAgICBcdFAyUzJBZGRbcG9zUG9pbnROXS50aW1lLnB1c2godGltZVBvaW50Tilcblx0ICAgICAgICAgICAgICAgICAgXHRcdFx0Y291bnRQb2ludEFkZGVkKz0xO1xuXHQgIFx0XHRcdFx0XHRcdH1cblx0ICBcdFx0XHRcdFx0fVxuXHQgIFx0XHRcdFx0fVxuXHQgIFx0XHRcdFx0Y29uc29sZS5sb2coXCJjYWxsZWQgcmVzb2x2ZWQgcG9pbnRcIiwgc2VydmVyVXJsLCB1cmxQb2ludHMpXG5cdCAgXHRcdFx0XHRyZXNvbHZlKFtzdG9wLHBvaW50c05MaXN0LHN0b3BzTkxpc3RdKTtcblx0ICAgICAgICB9KTtcblx0ICAgIH07XG5cblx0XHRpZiAoc3RvcHNOTGlzdC5sZW5ndGggPCAxKSB7XG5cdFx0Z2V0UG9pbnRzKCk7XG5cdFx0cmV0dXJuO1xuXHRcdH1cblxuXHQgICAgSFRUUC5nZXQodXJsU3RvcHMsIGZ1bmN0aW9uIChlcnJvciwgcmVzdWx0KXtcblx0ICAgIFx0aWYoZXJyb3IpIHtcblx0ICAgIFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvciBIVFRQIGNhbGwgU3RvcCcsIHNlcnZlclVybCwgZXJyb3IpO1xuXHRcdFx0XHRcdHJlamVjdCgnZXJyb3IgaHR0cCByZXF1ZXN0Jyk7XG4gIFx0XHRcdH1lbHNle1xuICBcdFx0ICAgIFx0bGV0IHJlc3VsdFN0b3BzID0gcmVzdWx0LmRhdGE7XG4gIFx0XHRcdFx0aWYoJ2R1cmF0aW9ucycgaW4gcmVzdWx0U3RvcHMpe1xuICBcdFx0XHRcdFx0Zm9yKGxldCBpID0gMTsgaSA8IHJlc3VsdFN0b3BzLmR1cmF0aW9uc1swXS5sZW5ndGg7IGkrKyl7XG4gIFx0XHRcdFx0XHRcdGxldCB0aW1lID0gcmVzdWx0U3RvcHMuZHVyYXRpb25zWzBdW2ldO1xuICBcdFx0XHRcdFx0XHRzdG9wc05MaXN0W2ktMV0udGltZSA9IHRpbWU7XG4gIFx0XHRcdFx0XHR9XG4gIFx0XHRcdFx0fVxuICBcdFx0XHRcdGZvcihsZXQgc3RvcE5faSA9IDA7IHN0b3BOX2kgPCBzdG9wc05MaXN0Lmxlbmd0aDsgc3RvcE5faSsrKXtcbiAgXHRcdFx0XHRcdGxldCBwb3NTdG9wTiA9IHN0b3BzTkxpc3Rbc3RvcE5faV0ucG9zXG5cdFx0ICAgICAgICAgICAgbGV0IHRpbWVTdG9wTiA9IHN0b3BzTkxpc3Rbc3RvcE5faV0udGltZTtcbiAgXHRcdFx0XHRcdGlmKHN0b3BzTkxpc3Rbc3RvcE5faV0udGltZSA8IHBhcmFtZXRlcnMubWF4VGltZVdhbGsgJiYgcG9zU3RvcCAhPSBwb3NTdG9wTil7XG5cdFx0ICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHBvc1N0b3BOLCBwb3NTdG9wKVxuXHRcdCAgICAgICAgICAgIFx0UzJTMkFkZFtwb3NTdG9wXS5wb3MucHVzaChwb3NTdG9wTilcblx0XHQgICAgICAgICAgICBcdFMyUzJBZGRbcG9zU3RvcF0udGltZS5wdXNoKHRpbWVTdG9wTilcblx0XHQgICAgICAgICAgICBcdGlmKFMyUzJBZGRbcG9zU3RvcE5dLnBvcy5pbmNsdWRlcyhwb3NTdG9wKSl7XG5cdFx0ICAgICAgICAgICAgXHRcdC8vY29uc29sZS5sb2coJ2NlIHN0YSEhISEnKVxuXHRcdCAgICAgICAgICAgIFx0XHRsZXQgcG9zVGVtcCA9IFMyUzJBZGRbcG9zU3RvcE5dLnBvcy5pbmRleE9mKHBvc1N0b3ApXG5cdFx0ICAgICAgICAgICAgXHRcdGlmKFMyUzJBZGRbcG9zU3RvcE5dLnRpbWVbcG9zVGVtcF0gPiB0aW1lU3RvcE4pe1xuXHRcdCAgICAgICAgICAgIFx0XHRcdFMyUzJBZGRbcG9zU3RvcE5dLnRpbWVbcG9zVGVtcF0gPSB0aW1lU3RvcE5cblx0XHQgICAgICAgICAgICBcdFx0fVxuXHRcdCAgICAgICAgICAgIFx0fWVsc2V7XG5cdFx0ICAgICAgICAgICAgXHRcdFMyUzJBZGRbcG9zU3RvcE5dLnBvcy5wdXNoKHN0b3AucG9zKVxuXHRcdCAgICAgICAgICAgIFx0XHRTMlMyQWRkW3Bvc1N0b3BOXS50aW1lLnB1c2godGltZVN0b3BOKVxuXG5cdFx0ICAgICAgICAgICAgXHR9XG4gICAgICAgICAgICBcdFx0fVxuXG4gIFx0XHRcdFx0fVxuICBcdFx0XHRjb25zb2xlLmxvZyhcImNhbGxlZCByZXNvbHZlZCBzdG9wXCIsIHNlcnZlclVybClcbiAgXHRcdFx0fVxuICAgIFx0Z2V0UG9pbnRzKCk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5cbmNvbnN0IHVwZGF0ZUFycmF5cyA9IGZ1bmN0aW9uKGNpdHksIHN0b3BzQ29sbGVjdGlvbiwgcG9pbnRzQ29sbGVjdGlvbnMsIHNjZW5hcmlvLCBzZXJ2ZXJPU1JNKXtcblx0Ly9tYWtlIGNvcHkgb2YgZGVmYXVsdCBhcnJheXNcblxuXHRzdG9wc0NvbGxlY3Rpb24ucmVtb3ZlKHt0ZW1wOnRydWV9KTtcblx0XG5cdGxldCBtZXRyb0xpbmVzRmV0Y2hlZCA9IHNjZW5hcmlvLmxpbmVzO1xuXG5cdC8vY29uc29sZS5sb2cobWV0cm9MaW5lc0ZldGNoZWQpXG5cblx0bWV0cm9MaW5lc0ZldGNoZWQuZm9yRWFjaChmdW5jdGlvbihsaW5lLCBpbmRleExpbmUpe1xuXHRcdGxpbmUuc3RvcHMuZm9yRWFjaChmdW5jdGlvbihzdG9wLCBpbmRleFN0b3Ape1xuIFx0XHRcdGxldCBwb3NTdG9wID0gXy5zaXplKHNjZW5hcmlvLlMyUzJBZGQpO1xuIFx0XHRcdC8vY29uc29sZS5sb2cocG9zU3RvcCwgbGluZSwgc3RvcClcblx0XHRcdG1ldHJvTGluZXNGZXRjaGVkW2luZGV4TGluZV0uc3RvcHNbaW5kZXhTdG9wXS5wb3MgPSBwb3NTdG9wO1xuXHRcdFx0c3RvcHNDb2xsZWN0aW9uLmluc2VydCh7XG5cdFx0XHRcdCdsaW5lJyA6IGxpbmUubGluZU5hbWUsXG5cdFx0XHRcdCdwb3MnIDogcG9zU3RvcCxcblx0XHRcdFx0J2xhdGxuZycgOiBzdG9wLmxhdGxuZyxcblx0XHRcdFx0J2Nvb3InIDogW3N0b3AubGF0bG5nWzFdLCBzdG9wLmxhdGxuZ1swXV0sXG5cdFx0XHRcdCd0aW1lQ3JlYXRpb24nIDogbmV3IERhdGUoKS5nZXRUaW1lKCksXG5cdFx0XHRcdCdwb2ludCcgOiB7J3R5cGUnIDogJ1BvaW50JywgJ2Nvb3JkaW5hdGVzJyA6IFtzdG9wLmxhdGxuZ1sxXSwgc3RvcC5sYXRsbmdbMF1dfSxcblx0XHRcdFx0J3RlbXAnIDogdHJ1ZSxcblx0XHRcdFx0J2NpdHknIDogY2l0eSxcblx0XHRcdH0pO1xuXHRcdFx0c2NlbmFyaW8uUzJTMkFkZFtwb3NTdG9wXSA9IHtcblx0ICAgICAgICBcdCdwb3MnIDogW10sXG5cdCAgICAgICAgICAgICd0aW1lJyA6IFtdXG4gICAgICAgIFx0fTtcblx0XHR9KTtcblx0fSk7XG5cblx0bGV0IG5ld1N0b3BzID0gc3RvcHNDb2xsZWN0aW9uLmZpbmQoe3RlbXA6dHJ1ZX0sIHtzb3J0IDogeyd0aW1lQ3JlYXRpb24nOjF9IH0pO1xuXG5cdGxldCBwcm9taXNlQWRkU3RvcCA9IFtdO1xuXG4gXHRpZihuZXdTdG9wcy5jb3VudCgpKXtcblx0IFx0bmV3U3RvcHMuZm9yRWFjaChmdW5jdGlvbihzdG9wKSB7XG5cdCBcdFx0cHJvbWlzZUFkZFN0b3AucHVzaChjb21wdXRlTmVpZ2goc3RvcCxzdG9wc0NvbGxlY3Rpb24sIHNjZW5hcmlvLlAyUzJBZGQsIHNjZW5hcmlvLlMyUzJBZGQsIHBvaW50c0NvbGxlY3Rpb25zLCBzZXJ2ZXJPU1JNKSk7XG5cdCBcdH0pO1xuXHR9XG5cbiBcdHJldHVybiBwcm9taXNlQWRkU3RvcDtcblxufTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUFycmF5c1dhaXQgPSBmdW5jdGlvbihjaXR5LCBzdG9wc0NvbGxlY3Rpb24sIHBvaW50c0NvbGxlY3Rpb25zLCBzY2VuYXJpbywgc2VydmVyT1NSTSl7XG5cdHByb21pc2VBZGRTdG9wID0gdXBkYXRlQXJyYXlzKGNpdHksIHN0b3BzQ29sbGVjdGlvbiwgcG9pbnRzQ29sbGVjdGlvbnMsIHNjZW5hcmlvLCBzZXJ2ZXJPU1JNKTtcblx0UHJvbWlzZS5hbGwocHJvbWlzZUFkZFN0b3ApLnRoZW4odmFsdWVzID0+IHtyZXR1cm4gdmFsdWVzfSk7XG59XG5cbmV4cG9ydCB7dXBkYXRlQXJyYXlzLCBmaWxsMkFkZEFycmF5LCBkZWxldGVFbXB0eUl0ZW19XG4iLCJjb25zdCBtZXJnZVNvcnRlZEMgPSBmdW5jdGlvbihsZWZ0LCByaWdodCl7XG4gICAgdmFyIHJlc3VsdCAgPSBbXSxcbiAgICAgICAgaWwgICAgICA9IDAsXG4gICAgICAgIGlyICAgICAgPSAwO1xuXG4gICAgd2hpbGUgKGlsIDwgbGVmdC5sZW5ndGggJiYgaXIgPCByaWdodC5sZW5ndGgpe1xuICAgICAgICBpZiAobGVmdFtpbCsyXSA8IHJpZ2h0W2lyKzJdKXtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGxlZnRbaWxdLGxlZnRbaWwrMV0sbGVmdFtpbCsyXSxsZWZ0W2lsKzNdKTtcbiAgICAgICAgICAgIGlsKz00O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gocmlnaHRbaXJdLHJpZ2h0W2lyKzFdLHJpZ2h0W2lyKzJdLHJpZ2h0W2lyKzNdKTtcbiAgICAgICAgICAgIGlyKz00O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC5jb25jYXQobGVmdC5zbGljZShpbCkpLmNvbmNhdChyaWdodC5zbGljZShpcikpO1xufTtcblxuY29uc3QgY29weUFycmF5TiA9IGZ1bmN0aW9uKG9iail7XG4gICAgaWYgKCFvYmogfHwgIW9iai5wb3MgfHwgIW9iai50aW1lIClcbiAgICAgIHJldHVybiB7cG9zOiBbXSwgdGltZTogW119O1xuICAgIGxldCBwb3MgPSBvYmoucG9zLm1hcChmdW5jdGlvbihhcnIpIHsgcmV0dXJuIGFyciA/IGFyci5zbGljZSgpIDogW107fSk7XG4gICAgbGV0IHRpbWUgPSBvYmoudGltZS5tYXAoZnVuY3Rpb24oYXJyKSB7IHJldHVybiBhcnIgPyBhcnIuc2xpY2UoKSA6IFtdO30pO1xuICAgIHJldHVybiB7J3Bvcyc6cG9zLCAndGltZSc6dGltZX07XG59O1xuXG5cbmV4cG9ydCB7bWVyZ2VTb3J0ZWRDLCBjb3B5QXJyYXlOfTtcbiIsImltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBKU1ppcCBmcm9tIFwianN6aXBcIjtcbmltcG9ydCB7IHNjZW5hcmlvREJ9IGZyb20gJy9pbXBvcnRzL0RCcy9zY2VuYXJpb0RCLmpzJztcbmltcG9ydCB7IGNvbXB1dGVTY2VuYXJpbyB9IGZyb20gJy9pbXBvcnRzL3NlcnZlci9zdGFydHVwL3NjZW5hcmlvRGVmLmpzJ1xuXG4vL2xldCBwYXRoID0gcHJvY2Vzcy5lbnZbJ01FVEVPUl9TSEVMTF9ESVInXSArICcvLi4vLi4vLi4vcHVibGljL2NpdGllcy8nO1xuLy9sZXQgcGF0aCA9IEFzc2V0cy5hYnNvbHV0ZUZpbGVQYXRoKCdjaXRpZXMvJylcbnZhciBtZXRlb3JSb290ID0gZnMucmVhbHBhdGhTeW5jKCBwcm9jZXNzLmN3ZCgpICsgJy8uLi8nICk7XG52YXIgcHVibGljUGF0aCA9IG1ldGVvclJvb3QgKyAnL3dlYi5icm93c2VyL2FwcC8nO1xubGV0IHBhdGggPSBwdWJsaWNQYXRoICsgJy9jaXRpZXMvJztcblxuZXhwb3J0IGxldCBjaXRpZXNEYXRhID0ge307XG5leHBvcnQgbGV0IGxpc3RDaXRpZXMgPSBbXTtcblxuXG5leHBvcnQgbGV0IGFkZERhdGFGcm9tWmlwID0gZnVuY3Rpb24obmFtZUZpbGUpe1xuXHRjb25zb2xlLmxvZyhcInJlYWRpbmdcIiwgbmFtZUZpbGUsIE1ldGVvci5zZXR0aW5ncy5wdWJsaWMpXG5cblx0ZnMucmVhZEZpbGUobmFtZUZpbGUsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuXHQgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuXHQgICAgSlNaaXAubG9hZEFzeW5jKGRhdGEpLnRoZW4oZnVuY3Rpb24gKHppcCkge1xuXHQgICAgXHR6aXAuZmlsZShcImNpdHlEYXRhLnR4dFwiKS5hc3luYyhcInN0cmluZ1wiKS50aGVuKGZ1bmN0aW9uIChkYXRhMil7XG5cdCAgICBcdFx0bGV0IGNpdHlEYXRhID0gSlNPTi5wYXJzZShkYXRhMilcblx0ICAgIFx0XHRsZXQgY2l0eSA9IGNpdHlEYXRhWydjaXR5J11cblx0ICAgIFx0XHRjaXRpZXNEYXRhW2NpdHldID0ge31cblx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnY2l0eSddID0gY2l0eVxuXHRcdFx0XHRjaXRpZXNEYXRhW2NpdHldWyduYW1lRmlsZSddID0gbmFtZUZpbGUuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0XHRjaXRpZXNEYXRhW2NpdHldWydvbmVIZXgnXSA9IGNpdHlEYXRhWydoZXgnXTtcblx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnYXJlYUhleCddID0gY2l0eURhdGFbJ2FyZWFIZXgnXTtcblx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnbmV3U2NlbmFyaW8nXSA9IGNpdHlEYXRhWyduZXdTY2VuYXJpbyddO1xuXHRcdFx0XHRjaXRpZXNEYXRhW2NpdHldWydidWRnZXQnXSA9IGNpdHlEYXRhWydidWRnZXQnXTtcblx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnbWV0cm9MaW5lcyddID0gY2l0eURhdGFbJ21ldHJvTGluZXMnXTtcblx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnc2VydmVyT1NSTSddID0gTWV0ZW9yLnNldHRpbmdzLnB1YmxpYy5PU1JNX1NFUlZFUiB8fCBjaXR5RGF0YVsnc2VydmVyT1NSTSddICsgXCIvXCIgO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhjaXRpZXNEYXRhW2NpdHldWydzZXJ2ZXJPU1JNJ10pXG5cdFx0XHRcdGNpdGllc0RhdGFbY2l0eV1bJ2NlbnRlckNpdHknXSA9IGNpdHlEYXRhWydjZW50ZXJDaXR5J107XG5cdFx0XHRcdGNpdGllc0RhdGFbY2l0eV1bJ2FycmF5TiddID0ge307XG5cdFx0XHRcdGNpdGllc0RhdGFbY2l0eV1bJ2FycmF5UG9wJ10gPSBbXTtcblx0ICAgIFx0XHQvL2NvbnNvbGUubG9nKGNpdGllc0RhdGFbY2l0eV0sIG5hbWVGaWxlLCBuYW1lRmlsZS5zcGxpdChcIi9cIikucG9wKCkpXG5cblx0ICAgICAgICBcdHppcC5maWxlKFwiY29ubmVjdGlvbnMudHh0XCIpLmFzeW5jKFwic3RyaW5nXCIpLnRoZW4oZnVuY3Rpb24gKGRhdGEzKXtcblx0ICAgICAgICBcdFx0Y29uc29sZS5sb2coY2l0eSwgJ3BhcnNpbmcsIGFycmF5QycpXG5cdFx0ICAgICAgICBcdGNpdGllc0RhdGFbY2l0eV1bJ2FycmF5QyddID0gSlNPTi5wYXJzZShkYXRhMyk7Ly9kYXRhMy5zcGxpdChcIixcIikubWFwKE51bWJlcik7IC8vSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0ICAgICAgICBcdGNvbnNvbGUubG9nKGNpdHksICdhcnJheUMnKVxuXHRcdFx0ICAgICAgICB6aXAuZmlsZShcImxpc3RQb2ludHMudHh0XCIpLmFzeW5jKFwic3RyaW5nXCIpLnRoZW4oZnVuY3Rpb24gKGRhdGEzKXtcblx0XHRcdCAgICAgICAgXHRjaXRpZXNEYXRhW2NpdHldWydsaXN0UG9pbnRzJ10gPSBKU09OLnBhcnNlKGRhdGEzKTtcblx0XHRcdCAgICAgICAgXHRjaXRpZXNEYXRhW2NpdHldWydsaXN0UG9pbnRzJ10uZm9yRWFjaCgocCk9Pntcblx0XHRcdCAgICAgICAgXHRcdGNpdGllc0RhdGFbY2l0eV1bJ2FycmF5UG9wJ10ucHVzaChwLnBvcClcblx0XHRcdCAgICAgICAgXHR9KVxuXHRcdFx0ICAgICAgICBcdHppcC5maWxlKFwibGlzdFN0b3BzLnR4dFwiKS5hc3luYyhcInN0cmluZ1wiKS50aGVuKGZ1bmN0aW9uIChkYXRhMyl7XG5cdFx0XHRcdCAgICAgICAgXHRjaXRpZXNEYXRhW2NpdHldWydzdG9wcyddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdCAgICAgICAgXHRcdCAgICAgICAgemlwLmZpbGUoXCJQMlBQb3MudHh0XCIpLmFzeW5jKFwic3RyaW5nXCIpLnRoZW4oZnVuY3Rpb24gKGRhdGEzKXtcblx0XHRcdFx0XHQgICAgICAgIFx0Y2l0aWVzRGF0YVtjaXR5XVsnYXJyYXlOJ11bJ1AyUFBvcyddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0XHRcdFx0ICAgICAgICBcdHppcC5maWxlKFwiUDJQVGltZS50eHRcIikuYXN5bmMoXCJzdHJpbmdcIikudGhlbihmdW5jdGlvbiAoZGF0YTMpe1xuXHRcdFx0XHRcdCAgICAgICAgXHRcdGNpdGllc0RhdGFbY2l0eV1bJ2FycmF5TiddWydQMlBUaW1lJ10gPSBKU09OLnBhcnNlKGRhdGEzKTtcblx0XHRcdFx0XHQgICAgICAgIFx0XHR6aXAuZmlsZShcIlAyU1Bvcy50eHRcIikuYXN5bmMoXCJzdHJpbmdcIikudGhlbihmdW5jdGlvbiAoZGF0YTMpe1xuXHRcdFx0XHRcdCAgICAgICAgXHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnYXJyYXlOJ11bJ1AyU1BvcyddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0XHRcdFx0ICAgICAgICBcdFx0ICAgIHppcC5maWxlKFwiUDJTVGltZS50eHRcIikuYXN5bmMoXCJzdHJpbmdcIikudGhlbihmdW5jdGlvbiAoZGF0YTMpe1xuXHRcdFx0XHRcdCAgICAgICAgXHRcdFx0XHRjaXRpZXNEYXRhW2NpdHldWydhcnJheU4nXVsnUDJTVGltZSddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0XHRcdFx0ICAgICAgICBcdFx0XHRcdHppcC5maWxlKFwiUzJTUG9zLnR4dFwiKS5hc3luYyhcInN0cmluZ1wiKS50aGVuKGZ1bmN0aW9uIChkYXRhMyl7XG5cdFx0XHRcdFx0ICAgICAgICBcdFx0XHRcdFx0Y2l0aWVzRGF0YVtjaXR5XVsnYXJyYXlOJ11bJ1MyU1BvcyddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0XHRcdFx0ICAgICAgICBcdFx0XHRcdFx0emlwLmZpbGUoXCJTMlNUaW1lLnR4dFwiKS5hc3luYyhcInN0cmluZ1wiKS50aGVuKGZ1bmN0aW9uIChkYXRhMyl7XG5cdFx0XHRcdFx0ICAgICAgICBcdFx0XHRcdFx0XHRjaXRpZXNEYXRhW2NpdHldWydhcnJheU4nXVsnUzJTVGltZSddID0gSlNPTi5wYXJzZShkYXRhMyk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgICAgXHRsZXQgbGF0bG5nID0gY2l0aWVzRGF0YVtjaXR5XVsnY2VudGVyQ2l0eSddO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAgICAgIFx0bGV0IG5ld1NjZW5hcmlvID0gY2l0aWVzRGF0YVtjaXR5XVsnbmV3U2NlbmFyaW8nXVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAgICAgICAgbGlzdENpdGllcy5wdXNoKHsnY2l0eSc6Y2l0eSwgJ2xhdGxuZyc6IGxhdGxuZy5yZXZlcnNlKCksICduZXdTY2VuYXJpbyc6bmV3U2NlbmFyaW99KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgICAgICAgIGNvbnNvbGUubG9nKCdyZWFkZWQnLCBuYW1lRmlsZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgICAgICBcdC8vY29uc29sZS5sb2coXCJsb2FkZWRcIiwgY2l0eStcIi56aXBcIiwgJ3NjZW5hcmlvIGRlZicsc2NlbmFyaW9EQi5maW5kKHsnY2l0eSc6Y2l0eSwgJ2RlZmF1bHQnOnRydWV9KS5jb3VudCgpLCAnIG5ld1NjZW5hcmlvJywgbmV3U2NlbmFyaW8sIGNpdGllc0RhdGFbY2l0eV1bJ2NlbnRlckNpdHknXSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgICAgICBcdGlmKHNjZW5hcmlvREIuZmluZCh7J2NpdHknOmNpdHksICdkZWZhdWx0Jzp0cnVlfSkuY291bnQoKT09MCl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9jb21wdXRlU2NlbmFyaW8oY2l0eSwgY2l0aWVzRGF0YVtjaXR5XSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgICAgICAgXHRcdGNvbnNvbGUubG9nKFwiY29tcHV0ZVNjZW5hcmlvXCIsIGNpdHkpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgICAgICAgXHR9XG5cdFx0XHRcdCAgICAgICAgXHRcdFx0XHRcdFx0fSk7XG4gICAgICAgIFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuICAgICAgICBcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdCAgICAgICAgXHRcdFx0XHRcdFx0fSk7XG5cdCAgICAgICAgXHRcdFx0XHRcdH0pO1xuXHQgICAgICAgIFx0XHQgICAgICAgIH0pO1xuXHRcdFx0ICAgICAgICBcdH0pO1xuXHQgICAgICAgIFx0XHR9KTtcblx0ICAgIFx0XHR9KTtcblx0XHRcdH0pO1xuXHQgICAgfSk7XG5cdH0pO1xufTtcblxuZXhwb3J0IGxldCBsb2FkQ2l0eSA9IGZ1bmN0aW9uKCl7XG5cdFxuXHRmcy5yZWFkZGlyU3luYyhwYXRoKS5mb3JFYWNoKG5hbWVGaWxlID0+IHtcblx0ICAvL2NvbnNvbGUubG9nKGZpbGUuc2xpY2UoLTMpKTtcblx0XHQgaWYobmFtZUZpbGUuc2xpY2UoLTMpID09XCJ6aXBcIil7XG5cdFx0ICAvL2NvbnNvbGUubG9nKGZpbGUuc2xpY2UoMCwtNCkpXG5cdFx0ICBhZGREYXRhRnJvbVppcChwYXRoICsgbmFtZUZpbGUpO1xuXHRcdH1cblx0fSk7XG5cbn0iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCBKU1ppcCBmcm9tICdqc3ppcCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHR1cmYgZnJvbSAndHVyZic7XG5pbXBvcnQgbWF0aCBmcm9tICdtYXRoanMnO1xuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nO1xuXG5pbXBvcnQgeyBzY2VuYXJpb0RCLCBpbml0U2NlbmFyaW8sIGNvbXB1dGVTY29yZU5ld1NjZW5hcmlvIH0gZnJvbSAnL2ltcG9ydHMvREJzL3NjZW5hcmlvREIuanMnO1xuXG5pbXBvcnQgeyB0aW1lc09mRGF5LCBtYXhEdXJhdGlvbiB9IGZyb20gJy9pbXBvcnRzL3BhcmFtZXRlcnMuanMnXG5cbmltcG9ydCB7bG9hZENpdHksIGNpdGllc0RhdGF9IGZyb20gJy9pbXBvcnRzL3NlcnZlci9zdGFydHVwL2xvYWRDaXRpZXNEYXRhLmpzJztcblxucHJvY2Vzcy5vbigndW5oYW5kbGVkUmVqZWN0aW9uJywgY29uc29sZS5sb2cuYmluZChjb25zb2xlKSlcblxudmFyIHdvcmtlciA9IHJlcXVpcmUoXCIvcHVibGljL3dvcmtlcnMvSUNTQUNvcmUuanNcIik7XG5cbnZhciBhdmdFbUFsbCA9IGZ1bmN0aW9uIChhcnJheXMpIHtcblx0cmVzdWx0ID0gW11cblx0Zm9yKHZhciBpID0gMDsgaSA8IGFycmF5c1swXS5sZW5ndGg7IGkrKyl7XG5cdCAgdmFyIG51bSA9IDA7XG5cdCAgLy9zdGlsbCBhc3N1bWluZyBhbGwgYXJyYXlzIGhhdmUgdGhlIHNhbWUgYW1vdW50IG9mIG51bWJlcnNcblx0ICBmb3IodmFyIGkyID0gMDsgaTIgPCBhcnJheXMubGVuZ3RoOyBpMisrKXsgXG5cdCAgICBudW0gKz0gYXJyYXlzW2kyXVtpXTtcblx0ICB9XG5cdCAgcmVzdWx0LnB1c2goIG51bSAvIGFycmF5cy5sZW5ndGgpO1xuXHR9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5cblxuZXhwb3J0IGNvbnN0IGN1dEFycmF5QyA9IGZ1bmN0aW9uKHN0YXJ0VGltZSwgYXJyYXlDKXtcblx0bGV0IGVuZFRpbWUgPSBzdGFydFRpbWUgKyA0KjM2MDAuO1xuXHRsZXQgaW5kZXhFbmQgPSAwO1xuXHRsZXQgaW5kZXhTdGFydCA9IDA7XG5cdGZvcihpbmRleEVuZCA9IDI7IGluZGV4RW5kIDwgYXJyYXlDLmxlbmd0aDsgaW5kZXhFbmQrPTQpe1xuXHRcdFx0aWYocGFyc2VJbnQoYXJyYXlDW2luZGV4RW5kXSkgPiBlbmRUaW1lKXtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coXCJicmVhayEhIVwiKVxuXHRcdFx0fVxuXHR9XG5cdGZvcihpbmRleFN0YXJ0ID0gMjsgaW5kZXhTdGFydCA8IGFycmF5Qy5sZW5ndGg7IGluZGV4U3RhcnQrPTQpe1xuXHRcdFx0aWYocGFyc2VJbnQoYXJyYXlDW2luZGV4U3RhcnRdKSA+PSBzdGFydFRpbWUpe1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImJyZWFrISEhXCIpXG5cdFx0XHR9XG5cdH1cblxuXHRhcnJheUNDdXQgPSBfLnNsaWNlKGFycmF5QywgaW5kZXhTdGFydCAtIDIsIGluZGV4RW5kKzIpO1xuXHRjb25zb2xlLmxvZyhcImN1dHRlZCBhcnJheSEhXCIsc3RhcnRUaW1lLCAgaW5kZXhTdGFydCwgaW5kZXhFbmQsIGFycmF5Qy5sZW5ndGgsIGFycmF5Q0N1dC5sZW5ndGgpXG5cdHJldHVybiBhcnJheUNDdXQ7XG59OyAgXG5cbmV4cG9ydCBjb25zdCBjb21wdXRlU2NlbmFyaW8gPSBmdW5jdGlvbihjaXR5LCBkYXRhQ2l0eSxzdGFydFRpbWVzID0gdGltZXNPZkRheSl7XG5cdE1ldGVvci5zZXRUaW1lb3V0KCgpPT57XG5cdFx0bGV0IGxpc3RQb2ludHMgPSBkYXRhQ2l0eS5saXN0UG9pbnRzO1xuXHRcdGxldCBhcnJheU4gPSBkYXRhQ2l0eS5hcnJheU47XG5cblx0IFx0bGV0IGFyZWFIZXggPSBkYXRhQ2l0eS5hcmVhSGV4O1xuXHQgXHRsZXQgc3RvcHNMaXN0ID0gZGF0YUNpdHkuc3RvcHNMaXN0O1xuXHQgXHRsZXQgYXJyYXlQb3AgPSBkYXRhQ2l0eS5hcnJheVBvcDtcblxuXHRcdGxldCByZXN1bHRzID0gW107XG5cdFx0bGV0IHNjZW5hcmlvID0gaW5pdFNjZW5hcmlvKGNpdHksICdkZWZhdWx0JywgJ2NpdHljaHJvbmUnLCBzdGFydFRpbWVzKTtcblx0XHRzY2VuYXJpby5kZWZhdWx0ID0gdHJ1ZTtcblx0XHRcblx0IFx0Ly9jb25zb2xlLmxvZyhhcnJheU4pXG5cdCBcdGxldCBwZXJMaW0gPSAyNTtcblx0IFx0Zm9yKGxldCB0aW1lX2kgaW4gc3RhcnRUaW1lcyl7XG5cdCBcdFx0bGV0IHBlcmNlbnRhZ2UgPSAwXG5cdCBcdFx0bGV0IHZlbG9jaXR5U2NvcmUgPSBbXTtcblx0IFx0XHRsZXQgc29jaWFsaXR5U2NvcmUgPSBbXTtcblx0XHRcdGxldCBzdGFydFRpbWUgPSBzdGFydFRpbWVzW3RpbWVfaV07XG5cdFx0XHRsZXQgYXJyYXlDID0gY3V0QXJyYXlDKHN0YXJ0VGltZSwgZGF0YUNpdHkuYXJyYXlDKTtcblx0XHRcdGZvciAodmFyIHBvaW50X2kgPSAwOyBwb2ludF9pIDwgbGlzdFBvaW50cy5sZW5ndGg7IHBvaW50X2krKykge1xuXHRcdFx0XHR2YXIgcG9pbnQgPSBsaXN0UG9pbnRzW3BvaW50X2ldO1xuXHRcdFx0XHR2YXIgcmV0dXJuZWQgPSB3b3JrZXIuSUNTQVBvaW50KHBvaW50LCBhcnJheUMsIGFycmF5Tiwgc3RhcnRUaW1lLCBhcmVhSGV4LCBhcnJheVBvcCk7XG5cdFx0XHRcdC8vY29uc29sZS5sb2cocG9pbnQucG9zICwgbGlzdFBvaW50cy5sZW5ndGggLHBlcmNlbnRhZ2UpO1xuXHRcdFx0XHRpZigxMDAuICogcG9pbnQucG9zIC8gbGlzdFBvaW50cy5sZW5ndGggPiBwZXJjZW50YWdlKXsgXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coY2l0eSwgc3RhcnRUaW1lLzM2MDAsIHJldHVybmVkLnZlbG9jaXR5U2NvcmUsIHJldHVybmVkLnNvY2lhbGl0eVNjb3JlLCAocGFyc2VJbnQoMTAwLiAqIHBvaW50LnBvcyAvIGxpc3RQb2ludHMubGVuZ3RoKSkudG9TdHJpbmcoKSArIFwiJVwiIClcblx0XHRcdFx0XHRwZXJjZW50YWdlICs9IHBlckxpbVxuXHRcdFx0XHR9XG5cdFx0XHRcdHZlbG9jaXR5U2NvcmUucHVzaChyZXR1cm5lZC52ZWxvY2l0eVNjb3JlKTtcblx0XHRcdFx0c29jaWFsaXR5U2NvcmUucHVzaChyZXR1cm5lZC5zb2NpYWxpdHlTY29yZSk7XG5cdFx0XHR9XG5cblxuXHRcdFx0c2NlbmFyaW8ubW9tZW50c1tzdGFydFRpbWUudG9TdHJpbmcoKV0gPSBzY2VuYXJpby5tb21lbnRzW3N0YXJ0VGltZS50b1N0cmluZygpXSB8fCB7fTtcblxuXHRcdFx0bGV0IG1vbWVudCA9IHNjZW5hcmlvLm1vbWVudHNbc3RhcnRUaW1lLnRvU3RyaW5nKCldXG5cdFx0XHRtb21lbnQudmVsb2NpdHlTY29yZSA9IHZlbG9jaXR5U2NvcmU7XG5cdFx0XHRtb21lbnQuc29jaWFsaXR5U2NvcmUgPSBzb2NpYWxpdHlTY29yZTtcblxuXHRcdH1cblx0IFxuXHQgXG5cdFx0bGV0IHZlbG9jaXRpZXMgPSBbXTtcblx0XHRsZXQgc29jaWFsaXRpZXMgPSBbXTtcblx0XHRmb3IobGV0IHRpbWUgaW4gc2NlbmFyaW8ubW9tZW50cyl7XG5cdFx0XHRjb25zb2xlLmxvZyh0aW1lKVxuXHRcdFx0aWYoc2NlbmFyaW8ubW9tZW50c1t0aW1lXVsndmVsb2NpdHlTY29yZSddLmxlbmd0aCA+IDAgKXtcblx0XHRcdFx0dmVsb2NpdGllcy5wdXNoKHNjZW5hcmlvLm1vbWVudHNbdGltZV1bJ3ZlbG9jaXR5U2NvcmUnXSk7XG5cdFx0XHRcdHNvY2lhbGl0aWVzLnB1c2goc2NlbmFyaW8ubW9tZW50c1t0aW1lXVsnc29jaWFsaXR5U2NvcmUnXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2codmVsb2NpdGllcy5sZW5ndGgsIFwiYWZ0ZXJcIiAsIE9iamVjdC5rZXlzKHNjZW5hcmlvLm1vbWVudHMpKVxuXHRcdHNjZW5hcmlvLm1vbWVudHNbXCJhdmdcIl0gPSB7fTtcblx0XHRzY2VuYXJpby5tb21lbnRzW1wiYXZnXCJdLnZlbG9jaXR5U2NvcmUgPSBhdmdFbUFsbCh2ZWxvY2l0aWVzKTtcblx0XHRzY2VuYXJpby5tb21lbnRzW1wiYXZnXCJdLnNvY2lhbGl0eVNjb3JlID0gYXZnRW1BbGwoc29jaWFsaXRpZXMpO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyh2ZWxvY2l0aWVzKVxuXG5cdFx0c2NlbmFyaW9EQi5yZW1vdmUoeydjaXR5JzpjaXR5LCAnZGVmYXVsdCc6dHJ1ZX0pO1xuXHRcdHNjZW5hcmlvWydhcnJheVBvcCddID0gYXJyYXlQb3A7XG5cdFx0c2NlbmFyaW9bJ3Njb3JlcyddID0gY29tcHV0ZVNjb3JlTmV3U2NlbmFyaW8oc2NlbmFyaW8sIHN0YXJ0VGltZXNbMF0udG9TdHJpbmcoKSk7XG5cblx0XHRzY2VuYXJpb0RCLmluc2VydChzY2VuYXJpbyk7XG5cdFx0XG5cdFx0Ly9yZXR1cm4gc2NlbmFyaW87XG5cdH0sIDApO1xuIFxufSBcblxuZXhwb3J0IGNvbnN0IGNvbXB1dGVTY2VuYXJpb0RlZmF1bHQgPSBmdW5jdGlvbihjaXR5KXtcblx0bGV0IGRhdGFDaXR5ID0gY2l0aWVzRGF0YVtjaXR5XTtcblx0bGV0IHNjZW5hcmlvID0gY29tcHV0ZVNjZW5hcmlvKGNpdHksIGRhdGFDaXR5KTtcblx0cmV0dXJuIHNjZW5hcmlvO1xuXG59IFxuXG5cbmV4cG9ydCBjb25zdCBhZGRDaXR5VG9MaXN0ID0gZnVuY3Rpb24oc2NlbmFyaW9EZWYsIGRhdGFDaXR5KSB7XG5yZXR1cm4gbmV3IFByb21pc2UoIGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCApe1xuXHRcdGNvbnNvbGUubG9nKFwiaW5zaWRlIFBST01JU0VcIik7XG5cdFx0bGV0IGNpdHkgPSBzY2VuYXJpb0RlZi5jaXR5XG5cdFx0Y2l0aWVzRGF0YVtjaXR5XSA9IGRhdGFDaXR5O1xuXHR9KTtcbn1cblxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5pbXBvcnQgeyBhZGROZXdMaW5lcyB9IGZyb20gJy9pbXBvcnRzL2xpYi9uZXdTY2VuYXJpb0xpYi9hZGROZXdMaW5lcy5qcyc7XG4vL2ltcG9ydCB7aW5pdEFycmF5Q30gZnJvbSAnL2ltcG9ydHMvc2VydmVyL3N0YXJ0dXAvSW5pdEFycmF5Q29ubmVjdGlvbnMuanMnO1xuaW1wb3J0IHsgc2NlbmFyaW9EQiB9IGZyb20gJy9pbXBvcnRzL0RCcy9zY2VuYXJpb0RCLmpzJztcbmltcG9ydCB7IGNpdGllc0RhdGEsICBsaXN0Q2l0aWVzfSBmcm9tICcvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9sb2FkQ2l0aWVzRGF0YS5qcyc7XG5pbXBvcnQgeyBtYXhEdXJhdGlvblxufSBmcm9tICcvaW1wb3J0cy9wYXJhbWV0ZXJzLmpzJztcbmltcG9ydCAnL2ltcG9ydHMvbGliL25ld1NjZW5hcmlvTGliL2FkZE5ld1N0b3BzLmpzJztcbiAgXG5sZXQgd29ya2VyID0gcmVxdWlyZShcIi9wdWJsaWMvd29ya2Vycy9JQ1NBQ29yZS5qc1wiKTtcbmxldCBtZXJnZUFycmF5cyA9IHJlcXVpcmUoXCIvcHVibGljL3dvcmtlcnMvbWVyZ2VBcnJheXMuanNcIik7XG5cbk1ldGVvci5tZXRob2RzKHtcbiAgJ2lzb2Nocm9uZScocG9pbnQsIHNjZW5hcmlvSUQsIHN0YXJ0VGltZSl7XG4gICAgICB2YXIgc2NlbmFyaW8gPSBzY2VuYXJpb0RCLmZpbmRPbmUoeydfaWQnOnNjZW5hcmlvSUR9KTtcbiAgICAgIGxldCBjaXR5ID0gc2NlbmFyaW8uY2l0eTtcbiAgICAgIGlmKHNjZW5hcmlvID09IFtdIHx8ICEoY2l0eSBpbiBjaXRpZXNEYXRhKSApeyBcbiAgICAgICAgLy9jb25zb2xlLmxvZygnU2NlbmFyaW8gbm90IGZvdW5kJylcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNpdHlEYXRhID0gY2l0aWVzRGF0YVtjaXR5XTtcbiAgICAgICAgbGV0IGxpc3RQb2ludHMgPSBjaXR5RGF0YS5saXN0UG9pbnRzO1xuICAgICAgICBsZXQgd1RpbWUgPSBbc3RhcnRUaW1lICwgc3RhcnRUaW1lICsgbWF4RHVyYXRpb25dO1xuICAgICAgICBsZXQgYXJyYXlDMkFkZCA9IGFkZE5ld0xpbmVzKHNjZW5hcmlvLmxpbmVzLCB3VGltZSkgfHwgW107XG4gICAgICAgIGxldCBhcnJheUMgPSBtZXJnZUFycmF5cy5tZXJnZVNvcnRlZEMoY2l0eURhdGEuYXJyYXlDLCBhcnJheUMyQWRkKTtcblxuICAgICAgICBsZXQgYXJyYXlOID0ge307XG4gICAgICAgIGxldCBhcnJheU5EZWYgPSBjaXR5RGF0YS5hcnJheU47XG5cbiAgICAgICAgYXJyYXlOWydQMlNQb3MnXSA9IG1lcmdlQXJyYXlzLm1lcmdlQXJyYXlOKGFycmF5TkRlZi5QMlNQb3MsIHNjZW5hcmlvLlAyUzJBZGQsICdwb3MnKTtcbiAgICAgICAgYXJyYXlOWydQMlNUaW1lJ10gPSBtZXJnZUFycmF5cy5tZXJnZUFycmF5TihhcnJheU5EZWYuUDJTVGltZSwgc2NlbmFyaW8uUDJTMkFkZCwgJ3RpbWUnKTtcbiAgICAgICAgYXJyYXlOWydTMlNQb3MnXSA9IG1lcmdlQXJyYXlzLm1lcmdlQXJyYXlOKGFycmF5TkRlZi5TMlNQb3MsIHNjZW5hcmlvLlMyUzJBZGQsICdwb3MnKTtcbiAgICAgICAgYXJyYXlOWydTMlNUaW1lJ10gPSBtZXJnZUFycmF5cy5tZXJnZUFycmF5TihhcnJheU5EZWYuUzJTVGltZSwgc2NlbmFyaW8uUzJTMkFkZCwgJ3RpbWUnKTtcbiAgICAgICAgYXJyYXlOWydQMlBQb3MnXSA9IGFycmF5TkRlZi5QMlBQb3Muc2xpY2UoKTtcbiAgICAgICAgYXJyYXlOWydQMlBUaW1lJ10gPSBhcnJheU5EZWYuUDJQVGltZS5zbGljZSgpO1xuXG4gICAgICAgIGxldCBwb2ludHNWZW51ZXMgPSBjaXR5RGF0YS5wb2ludHNWZW51ZXM7XG4gICAgICAgIGxldCBhcmVhSGV4ID0gY2l0eURhdGEuYXJlYUhleDtcbiAgICAgICAgbGV0IGFycmF5UG9wID0gY2l0eURhdGEuYXJyYXlQb3A7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2FycmF5QywgYXJyYXlOJywgYXJyYXlDLmxlbmd0aCwgT2JqZWN0LmtleXMoYXJyYXlOKSlcbiAgICAgICAgLy9sZXQgc3RhcnRUaW1lID0gdGltZXNPZkRheVt0aW1lX2ldO1xuICAgICAgICBsZXQgcmV0dXJuZWQgPSB3b3JrZXIuSUNTQVBvaW50KHBvaW50LCBhcnJheUMsIGFycmF5Tiwgc3RhcnRUaW1lLCBhcmVhSGV4LCBwb2ludHNWZW51ZXMsIGFycmF5UG9wKTtcblxuXG4gICAgICByZXR1cm4gcmV0dXJuZWQudFBvaW50O1xuICAgIH1cbiAgfSxcbiAgICAnZ2l2ZURhdGFCdWlsZFNjZW5hcmlvJyA6IGZ1bmN0aW9uKGNpdHksZGF0YSl7XG4gICAgbGV0IGRhdGFUb1JldHVybiA9IHt9XG4gICAgZGF0YS5mb3JFYWNoKCAobmFtZSk9PntcbiAgICAgIGlmKGNpdGllc0RhdGFbY2l0eV1bbmFtZV0gIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgZGF0YVRvUmV0dXJuW25hbWVdID0gY2l0aWVzRGF0YVtjaXR5XVtuYW1lXTt9XG4gICAgICBlbHNle1xuICAgICAgICBkYXRhVG9SZXR1cm5bbmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKGNpdHksIGRhdGEpXG5cbiAgICByZXR1cm4gZGF0YVRvUmV0dXJuO1xuICB9LFxuICAnZ2l2ZUxpc3RDaXRpZXNTY2VuYXJpbycgOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBsaXN0Q2l0aWVzO1xuICB9XG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnbWV0ZW9yL2lyb246cm91dGVyJztcblxuLy9pbXBvcnQgeyBpbml0VmVsIH0gZnJvbSAnL2ltcG9ydHMvREJzL3ZlbG9jaXR5RGIuanMnO1xuaW1wb3J0IHt0aW1lc09mRGF5LCBtYXhEdXJhdGlvbn0gZnJvbSAnL2ltcG9ydHMvcGFyYW1ldGVycy5qcyc7XG5pbXBvcnQgSlNaaXAgZnJvbSAnanN6aXAnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IHsgY29tcHV0ZVNjZW5hcmlvRGVmYXVsdCwgYWRkQ2l0eVRvTGlzdCwgY2hlY2tDaXRpZXMsIGNvbXB1dGVEYXRhQ2l0eSwgY29tcHV0ZU9ubHlTY2VuYXJpb0RlZmF1bHQgfSBmcm9tICcvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9zY2VuYXJpb0RlZi5qcyc7XG5pbXBvcnQgeyBzY2VuYXJpb0RCLCBpbml0U2NlbmFyaW8gfSBmcm9tICcvaW1wb3J0cy9EQnMvc2NlbmFyaW9EQi5qcyc7XG5pbXBvcnQge2xvYWRDaXR5LCBjaXRpZXNEYXRhfSBmcm9tICcvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9sb2FkQ2l0aWVzRGF0YS5qcyc7XG5cblxuUm91dGVyLnJvdXRlKCcvYWRkQ2l0eS86Y2l0eScsIGZ1bmN0aW9uICgpIHtcblx0bGV0IGNpdHkgPSB0aGlzLnBhcmFtcy5jaXR5XG5cdGNvbnNvbGUubG9nKCdBZGRpbmcgLi4uICcsIGNpdHkpO1xuIFx0dGhpcy5yZXNwb25zZS5lbmQoJ0FkZGluZyAuLi4gJyArIGNpdHkpO1xuXHRsZXQgc2NlbmFyaW9EZWYgPSBjb21wdXRlU2NlbmFyaW9EZWZhdWx0KGNpdHkpO1xufSwge3doZXJlOiAnc2VydmVyJ30pO1xuIFxuIFxuUm91dGVyLnJvdXRlKCcvcmVsb2FkQ2l0aWVzJywgZnVuY3Rpb24gKCkge1xuICBsb2FkQ2l0eSgpO1xufSwge3doZXJlOiAnc2VydmVyJ30pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5pbXBvcnQgeyBUZW1wbGF0ZSB9IGZyb20gJ21ldGVvci90ZW1wbGF0aW5nJztcblxuZXhwb3J0IGNvbnN0IHNjZW5hcmlvREIgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbignc2NlbmFyaW8nKTtcblxuaWYoTWV0ZW9yLmlzU2VydmVyKXtcblx0c2NlbmFyaW9EQi5fZW5zdXJlSW5kZXgoeyBcInNjb3Jlcy5zY29yZVZlbG9jaXR5XCI6IC0xLCBcImNyZWF0aW9uRGF0ZVwiOi0xfSk7XG5cdHNjZW5hcmlvREIuX2Vuc3VyZUluZGV4KHsgXCJjaXR5XCI6MSwgXCJzY29yZXMuYXZnVmVsb2NpdHlTY29yZVwiOiAxLCBcImNyZWF0aW9uRGF0ZVwiOi0xfSk7XG5cdHNjZW5hcmlvREIuX2Vuc3VyZUluZGV4KHsgXCJjaXR5XCI6MX0pO1xuXHRzY2VuYXJpb0RCLl9lbnN1cmVJbmRleCh7IFwiY2l0eVwiOjEsIFwic2NvcmVzLmF2Z1NvY2lhbGl0eVNjb3JlXCI6IDF9KTtcblxufVxuZXhwb3J0IGNvbnN0IGluaXRTY2VuYXJpbyA9IGZ1bmN0aW9uKGNpdHksIG5hbWUsIGF1dGhvciwgdGltZXMsIG1ldHJvTGluZXNGZXRjaGVkLCBQMlMyQWRkLCBTMlMyQWRkKXtcblx0bWV0cm9MaW5lc0ZldGNoZWQgPSBtZXRyb0xpbmVzRmV0Y2hlZCB8fCBbXTtcblx0UDJTMkFkZCA9IFAyUzJBZGQgfHwge307XG5cdFMyUzJBZGQgPSBTMlMyQWRkIHx8IHt9O1xuXHRsZXQgbW9tZW50cyA9IHsgfVxuXHR0aW1lcy5mb3JFYWNoKCh0aW1lKT0+e1xuXHRcdG1vbWVudHNbdGltZV0gPSB7XG5cdFx0XHQndmVsb2NpdHknIDogMCxcblx0XHRcdCdzY29yZScgOiAwLFxuXHRcdFx0J2J1ZGdldCcgOiAwLFxuXHRcdFx0J2VmZmljZW5jeScgOiAwLFxuXHRcdFx0J3ZlbG9jaXR5U2NvcmUnIDogW10sXG5cdFx0XHQnc29jaWFsaXR5U2NvcmUnIDogW10sXG5cdFx0XHQndmVsb2NpdHlTY29yZURpZmYnIDogW10sXG5cdFx0XHQnc29jaWFsaXR5U2NvcmVEaWZmJyA6IFtdLFxuXG5cdFx0fVxuXHR9KVxuXHRsZXQgc2NlbmFyaW8gPSB7XG5cdFx0J2F1dGhvcicgOiBhdXRob3IsXG5cdFx0J25hbWUnIDogbmFtZSxcblx0XHQnY3JlYXRpb25EYXRlJyAgOiBuZXcgRGF0ZSgpLFxuXHRcdCdsaW5lcycgOiBtZXRyb0xpbmVzRmV0Y2hlZCxcblx0XHQnUDJTMkFkZCcgOiBQMlMyQWRkLFxuXHRcdCdTMlMyQWRkJzogUzJTMkFkZCxcblx0XHQnY2l0eScgOiBjaXR5LFxuXHRcdCdfaWQnIDogbmV3IE1vbmdvLk9iamVjdElEKCksXG5cdFx0J21vbWVudHMnIDogbW9tZW50cyxcblx0XHQnZGVmYXVsdCcgOiBmYWxzZSxcblx0XHQnYXV0aG9yJyA6IGF1dGhvclxuXHR9O1xuXHRyZXR1cm4gc2NlbmFyaW87XG59OyBcblxuZXhwb3J0IGNvbnN0IGNvbXB1dGVTY29yZU5ld1NjZW5hcmlvID0gZnVuY3Rpb24oc2NlbmFyaW8sIHRpbWUpe1xuXHRsZXQgc2NvcmVzID0ge307XG5cdGxldCBtb21lbnQgPSBzY2VuYXJpb1snbW9tZW50cyddW3RpbWVdO1xuXHRsZXQgcG9wQXJyYXkgPSBzY2VuYXJpb1snYXJyYXlQb3AnXTtcblx0bGV0IHRvdFBvcCA9IHNjZW5hcmlvLmFycmF5UG9wLnJlZHVjZSgoYSwgYik9PnsgcmV0dXJuIGEgKyBiOyB9LCAwKTtcblx0c2NvcmVzWydhdmdWZWxvY2l0eVNjb3JlJ10gPSAwO1xuXHRtb21lbnRbJ3ZlbG9jaXR5U2NvcmUnXS5mb3JFYWNoKCh2ZWwsIGkpPT57XG5cdFx0c2NvcmVzWydhdmdWZWxvY2l0eVNjb3JlJ10gKz0gcG9wQXJyYXlbaV0gKiB2ZWxcblx0fSk7XG5cdHNjb3Jlc1snYXZnVmVsb2NpdHlTY29yZSddIC89IHRvdFBvcDtcblx0XG5cdHNjb3Jlc1snYXZnU29jaWFsaXR5U2NvcmUnXSA9IDA7XG5cdG1vbWVudFsnc29jaWFsaXR5U2NvcmUnXS5mb3JFYWNoKChzb2MsIGkpPT57XG5cdFx0c2NvcmVzWydhdmdTb2NpYWxpdHlTY29yZSddICs9IHBvcEFycmF5W2ldICogc29jXG5cdH0pO1xuXHRzY29yZXNbJ2F2Z1NvY2lhbGl0eVNjb3JlJ10gLz0gdG90UG9wO1xuXG5cdHJldHVybiBzY29yZXM7XG5cbn07XG5cbk1ldGVvci5tZXRob2RzKHtcblx0J2luc2VydE5ld1NjZW5hcmlvJyA6IGZ1bmN0aW9uKG9iail7XG5cdFx0Ly9jb25zb2xlLmxvZygnaW5zZXJ0IHNjZW5hcmlvJywgb2JqKTtcblx0XHRpZignX2lkJyBpbiBvYmope1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCd1cGRhdGluZyBzY2VuYXJpbycsIG9iai5jaXR5KTtcblxuXHRcdFx0c2NlbmFyaW9EQi51cGRhdGUoeydfaWQnOm9ialsnX2lkJ119LCBvYmoseyd1cHNlcnQnOnRydWV9LCBmdW5jdGlvbihlcnIsIGlkKSB7XG5cdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZygnaW5zZXJ0IHNjZW5hcmlvIG5ldyBpZCcsIGlkKTtcblx0XHRcdFx0XHQvL2lmIChNZXRlb3IuaXNDbGllbnQpXG5cdFx0XHRcdFx0XHQvL1RlbXBsYXRlLmJvZHkudGVtcGxhdGUuc2NlbmFyaW8uY3VycmVudFNjZW5hcmlvSWQgPSBpZDtcblx0XHRcdH0pO1xuXHRcdH1lbHNle1xuXHRcdFx0c2NlbmFyaW9EQi5pbnNlcnQob2JqLCBmdW5jdGlvbihlcnIsIGlkKSB7XG5cdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coJ2luc2VydCBzY2VuYXJpbyBuZXcgaWQnLCBpZCk7XG5cdFx0XHRcdFx0Ly9pZiAoTWV0ZW9yLmlzQ2xpZW50KVxuXHRcdFx0XHRcdFx0Ly9UZW1wbGF0ZS5ib2R5LnRlbXBsYXRlLnNjZW5hcmlvLmN1cnJlbnRTY2VuYXJpb0lkID0gaWQ7XG5cdFx0XHR9KTtcblxuXHRcdH1cblx0fSxcblx0J3VwZGF0ZVNjZW5hcmlvJyA6IGZ1bmN0aW9uKG9iaiwgX2lkKXtcblx0XHQvL2NvbnNvbGUubG9nKFwidXBkYXRlIHNjZW5hcmlvXCIsIF9pZCk7XG5cdFx0c2NlbmFyaW9EQi51cGRhdGUoeydfaWQnOl9pZH0sIG9iaik7XG5cdH0sXG5cdCd1cGRhdGVOYW1lQXV0aG9yU2NlbmFyaW8nIDogZnVuY3Rpb24odGl0bGUsIGF1dGhvciwgX2lkKXtcblx0XHRsZXQgcmVzID0gc2NlbmFyaW9EQi51cGRhdGUoeydfaWQnOl9pZH0sIHtcIiRzZXRcIjp7J25hbWUnOnRpdGxlLCAnYXV0aG9yJzphdXRob3J9fSxcblx0XHRcdChlcnIsIG51bU1vZGlmaWVkKT0+e1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwic2NlbmFyaW8gdXBkYXRlZFwiLCB0aXRsZSwgYXV0aG9yLCBfaWQsIG51bU1vZGlmaWVkLCBlcnIpO1xuXHRcdFx0fSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcInNjZW5hcmlvIHVwZGF0ZWRcIiwgdGl0bGUsIGF1dGhvciwgX2lkLCByZXMpO1xuXHR9LFxuXHQgJ3NjZW5hcmlvRGVmJyA6IGZ1bmN0aW9uKGNpdHkpe1xuXHQgXHRsZXQgcmVzID0gc2NlbmFyaW9EQi5maW5kT25lKHsnZGVmYXVsdCc6dHJ1ZSwgJ2NpdHknIDogY2l0eX0sIHtzb3J0OnsnY3JlYXRpb25EYXRlJzotMX0sIHJlYWN0aXZlOiBmYWxzZX0gKTtcblx0IFx0Ly9jb25zb2xlLmxvZygncmV0dXJuIHNjZW5hcmlvIGRlZicsIHJlcyk7XG4gICAgXHRyZXR1cm4gcmVzXG4gIH0sXG4gICdnaXZlU2NlbmFyaW8nOiBmdW5jdGlvbihfaWQpe1xuICBcdC8vY29uc29sZS5sb2coX2lkLCBzY2VuYXJpb0RCLmZpbmRPbmUoeydfaWQnOm5ldyBNb25nby5PYmplY3RJRChfaWQpfSkpXG4gIFx0cmV0dXJuIHNjZW5hcmlvREIuZmluZE9uZSh7J19pZCc6bmV3IE1vbmdvLk9iamVjdElEKF9pZCl9KTtcbiAgfSxcbiAgJ2ZpbmRPbmUnOmZ1bmN0aW9uKHNlYXJjaCl7XG4gIFx0cmV0dXJuIHNjZW5hcmlvREIuZmluZE9uZShzZWFyY2gpO1xuICB9XG5cbn0pO1xuIiwiaW1wb3J0IHR1cmYgZnJvbSAndHVyZic7XG5pbXBvcnQgbWF0aCBmcm9tICdtYXRoanMnO1xuaW1wb3J0IHtcblx0Um91dGVyXG59IGZyb20gJ21ldGVvci9pcm9uOnJvdXRlcic7XG5cbmV4cG9ydCBjb25zdCBtYXhUaW1lV2FsayA9IDkwMC47IC8vW3NlY29uZF0gTWF4IGRpc3RhbmNlIGFsbG93ZWQgZm9yIHdhbGtpbmcgcGF0aCBiZXR3ZWVuIHN0b3BzIGFuZCBwb2ludHMuXG5leHBvcnQgY29uc3Qgd2Fsa2luZ1ZlbG9jaXR5ID0gNS4vMy42OyAvLyBbbWV0ZXIvc2Vjb25kXS5cbmV4cG9ydCBjb25zdCBtYXhEaXN0YW5jZVdhbGsgPSBtYXhUaW1lV2FsayAqIHdhbGtpbmdWZWxvY2l0eTsgLy9NYXggZGlzdGFuY2UgYWxsb3dlZCBmb3Igd2Fsa2luZyBwYXRoIGJldHdlZW4gc3RvcHMgYW5kIHBvaW50cy5cbmV4cG9ydCBjb25zdCB0aW1lc09mRGF5ID0gWzcuICogMzYwMC4sIDEwICogMzYwMCwgMTMgKiAzNjAwLCAxNiAqIDM2MDAsIDE5ICogMzYwMCwgMjIgKiAzNjAwXTtcbmV4cG9ydCBjb25zdCBtYXhEdXJhdGlvbiA9IDQgKiAzNjAwOyAvL21heCBpbnRlZ3JhdGlvbiBpbnRlcnZhbHMsIGxpbWl0IHRoZSBsZW5naHQgb2YgYXJyYXkgb2YgY29ubmVjdGlvbnMuXG5cbi8vZXhwb3J0IGNvbnN0IHplcm9UaW1lID0gMy4wICogNjA7IC8vZmlyc3QgMyBtaW4gYXJlIG5vdCBjb25zaWRlciBpbiB0aGUgYXZlcmFnZSB2ZWxvY2l0eVxuLy9leHBvcnQgY29uc3QgaW50ZWdyYWxXaW5kVGltZSA9IE1hdGgubG9nKG1heER1cmF0aW9uIC0gemVyb1RpbWUpIC0gTWF0aC5sb2coemVyb1RpbWUpO1xuXG5leHBvcnQgY29uc3QgbWV0cm9TcGVlZHMgPSBbXG5cdHtcblx0XHRuYW1lOiBcIkxvd1wiLFxuXHRcdHRvcFNwZWVkOiAxMixcblx0XHRhY2NlbGVyYXRpb246IDAuNixcblx0XHRjb2xvckNsYXNzOiAnYnRuLWRhbmdlcidcblx0fSxcblx0e1xuXHRcdG5hbWU6IFwiTWVkXCIsXG5cdFx0dG9wU3BlZWQ6IDIwLFxuXHRcdGFjY2VsZXJhdGlvbjogMC45LFxuXHRcdGNvbG9yQ2xhc3M6ICdidG4td2FybmluZydcblx0fSxcblx0e1xuXHRcdG5hbWU6IFwiSGlnaFwiLFxuXHRcdHRvcFNwZWVkOiAzMCxcblx0XHRhY2NlbGVyYXRpb246IDEuMyxcblx0XHRjb2xvckNsYXNzOiAnYnRuLXN1Y2Nlc3MnXG5cdH1cbl07XG5cbmV4cG9ydCBjb25zdCBtZXRyb0ZyZXF1ZW5jaWVzID0gW1xuXHR7XG5cdFx0bmFtZTogXCJPZmZcIixcblx0XHRmcmVxdWVuY3k6IDAsXG5cdFx0Y29sb3JDbGFzczogJ2J0bi1kZWZhdWx0J1xuXHR9LFxuXHR7XG5cdFx0bmFtZTogXCJMb3dcIixcblx0XHRmcmVxdWVuY3k6IDE1KjYwLFxuXHRcdGNvbG9yQ2xhc3M6ICdidG4tZGFuZ2VyJ1xuXHR9LFxuXHR7XG5cdFx0bmFtZTogXCJNZWRcIixcblx0XHRmcmVxdWVuY3k6IDgqNjAsXG5cdFx0Y29sb3JDbGFzczogJ2J0bi13YXJuaW5nJ1xuXHR9LFxuXHR7XG5cdFx0bmFtZTogXCJIaWdoXCIsXG5cdFx0ZnJlcXVlbmN5OiAyKjYwLFxuXHRcdGNvbG9yQ2xhc3M6ICdidG4tc3VjY2Vzcydcblx0fSxcbl07XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ21ldGVvci9pcm9uOnJvdXRlcic7XG5cbmltcG9ydCB7IHNjZW5hcmlvREIgfSBmcm9tICcvaW1wb3J0cy9EQnMvc2NlbmFyaW9EQi5qcyc7XG5pbXBvcnQgJy9pbXBvcnRzL3NlcnZlci9tZXRob2RzLmpzJztcbmltcG9ydCBKU1ppcCBmcm9tICdqc3ppcCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG4vL2ltcG9ydCB7IGluaXRBcnJheUN9IGZyb20gJy9pbXBvcnRzL3NlcnZlci9zdGFydHVwL0luaXRBcnJheUNvbm5lY3Rpb25zLmpzJztcbi8vaW1wb3J0IHsgaW5pdE5laWdoU3RvcEFuZFBvaW50IH0gZnJvbSAnL2ltcG9ydHMvc2VydmVyL3N0YXJ0dXAvbmVpZ2hTdG9wc1BvaW50cy5qcyc7XG5cbi8vaW1wb3J0IHsgY2hlY2tDaXRpZXMgfSBmcm9tICcvaW1wb3J0cy9zZXJ2ZXIvc3RhcnR1cC9zY2VuYXJpb0RlZi5qcyc7XG5pbXBvcnQgJy9pbXBvcnRzL3NlcnZlci9yb3V0ZXIuanMnO1xuaW1wb3J0IHtsb2FkQ2l0eX0gZnJvbSAnL2ltcG9ydHMvc2VydmVyL3N0YXJ0dXAvbG9hZENpdGllc0RhdGEuanMnO1xuXG52YXIgXztcbiBcblxuTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICBfID0gbG9kYXNoO1xuICBsb2FkQ2l0eSgpXG5cblxuICBNZXRlb3IucHVibGlzaCgnc2NlbmFyaW8nLCBmdW5jdGlvbiBzY2VuYXJpb0xpc3QoY2l0eSkge1xuICAgIGxldCBzb3J0ID0geydzY29yZXMuYXZnVmVsb2NpdHlTY29yZSc6LTEsICdjcmVhdGlvbkRhdGUnOi0xfTtcbiAgICBsZXQgZmllbGQgPSB7J21vbWVudHMnOjAsICdQMlMyQWRkJzogMCwgJ1MyUzJBZGQnOjAsICdsaW5lcyc6MH07XG4gICAgY29uc29sZS5sb2coc29ydCwgZmllbGQpO1xuICAgIHJldHVybiBzY2VuYXJpb0RCLmZpbmQoeydjaXR5JzpjaXR5fSwge3NvcnQ6c29ydCwgJ2ZpZWxkcyc6ZmllbGR9KTtcbiAgfSk7XG5cbiAgTWV0ZW9yLnB1Ymxpc2goJ3NjZW5hcmlvRGVmJywgZnVuY3Rpb24gc2NlbmFyaW9MaXN0KGNpdHksIGxpc3RPZklkKSB7XG4gICAgcmV0dXJuIHNjZW5hcmlvREIuZmluZCh7J2RlZmF1bHQnOnRydWUsICdjaXR5JyA6IGNpdHl9LCB7c29ydDp7J2NyZWF0aW9uRGF0ZSc6LTF9fSk7XG4gIH0pO1xuXG4gIE1ldGVvci5wdWJsaXNoKCdzY2VuYXJpb0lEJywgZnVuY3Rpb24gc2NlbmFyaW9MaXN0KGNpdHksIF9pZCkge1xuICAgIHJldHVybiBzY2VuYXJpb0RCLmZpbmQoeydfaWQnOl9pZCwgJ2NpdHknIDogY2l0eSwgJ21vbWVudHMnOnsnJGV4aXN0cyc6dHJ1ZX19LCB7c29ydDp7J2NyZWF0aW9uRGF0ZSc6LTF9fSk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2coJ2ZpbmlzaCBwdWJsaXNoISEnKTtcblxuICByZXR1cm4gdHJ1ZTtcbn0pO1xuXG4iXX0=
