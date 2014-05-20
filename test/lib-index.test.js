'use strict'; /* global describe, it, before */
/*!
 * Dependencies
 * --------------------------------------------------------------------------*/

var path = require('path'),
    should = require('should'),
    importCsv = require('..');

process.env.DB_URI = 'mongodb://localhost:27017/test';
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI);
var Contact = require('../models/contact');

describe('csv-import', function() {
  before(function(done) { Contact.remove({}, done); });

  it('gets exposed', function() { should.exist(importCsv); });

  describe('.importCsv', function() {
    it('doesn\'t yield an error and yields inserted records', function(done) {
      var _this = this;
      importCsv(Contact, path.join(__dirname, 'big-sample.csv'), function(err, records) {
        _this.records = records;
        done(err);
      });
    });

    it('inserts the records into the db', function(done) {
      var _this = this;

      Contact.count({}, function(err, count) {
        if(err) return done(err);
        (_this.records.length <= count).should.be.ok;
        done();
      });
    });
  });
});
