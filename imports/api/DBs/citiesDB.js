import { Mongo } from 'meteor/mongo';

const cities = new Mongo.Collection('listCity');

export {cities};
