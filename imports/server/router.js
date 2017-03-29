import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

import { initVel } from '/imports/api/DBs/velocityDb.js';
import {timesOfDay, maxDuration} from '/imports/api/parameters.js';
import JSZip from 'jszip';
import fs from 'fs';

import { initArrayC} from '/imports/server/startup/InitArrayConnections.js';
import { initNeighStopAndPoint } from '/imports/server/startup/neighStopsPoints.js';

Router.route('/exportzip/:city', function () {
  console.log("exportzip " + this.params.city);
  // var request = this.request;
  // var response = this.response;

  this.response.end('Zip per ' + this.params.city + ' esportati!');
}, {where: 'server'});


