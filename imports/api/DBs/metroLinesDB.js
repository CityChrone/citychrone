import { Mongo } from 'meteor/mongo';

const metroLines = new Mongo.Collection('metroLines');

export {metroLines};
