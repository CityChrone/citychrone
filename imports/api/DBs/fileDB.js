import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
//import { FS } from 'meteor/cfs:standard-packages';

const fileDB = new FS.Collection("fileDB", {
  stores: [new FS.Store.FileSystem("fileDB")]
});

export {fileDB}