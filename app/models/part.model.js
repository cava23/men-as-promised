'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose-q')(),
	Schema = mongoose.Schema;

/**
 * Part Schema
 */
var PartSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	org: {
		type: Schema.ObjectId,
		ref: 'Org',
		required: "Missing required field 'org'. Parts must belong to an org."
	}
});

mongoose.model('Part', PartSchema);
