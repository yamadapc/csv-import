'use strict';
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ContactSchema = new Schema({
  name: { type: String, trim: true, },
  tel: { type: String, trim: true, },
  job: { type: String, },
});

// register and expose the model.
module.exports = mongoose.model('Contact', ContactSchema);
