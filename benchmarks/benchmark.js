'use strict';
var Chance = require('chance'),
    mongoose = require('mongoose'),
    Benchmark = require('benchmark');

var SAMPLE_SIZE = 2000;
var CONNECTIONS = 100;

// Set-up chance and mongoose
var chance = new Chance();

process.env.DB_URI = 'mongodb://localhost:27017/test';
mongoose.connect(process.env.DB_URI, {
  server: {
    poolSize: CONNECTIONS
  }
});
var Contact = require('../models/contact');

// import csv insertEntries variants:
var importCsv = require('../lib');

var insertEntries = importCsv.insertEntries,
    insertEntriesOnce = importCsv.insertEntriesOnce,
    insertEntriesOnceValidate = importCsv.insertEntriesOnceValidate,
    insertEntriesBlocks = importCsv.insertEntriesBlocks,
    insertEntriesBlocksValidate = importCsv.insertEntriesBlocksValidate;

function setup() {
  var records = [];
  for(var i = 0; i < SAMPLE_SIZE; i++) {
    records.push({
      name: chance.name(),
      tel: chance.phone(),
      job: chance.word(),
    });
  }
  return records;
}

var suite = new Benchmark.Suite();

suite
  .add('insertEntries-parallel', function(deferred) {
    var records = setup();
    insertEntries(Contact, records, function(err) {
      if(err) {
        console.error(err.stack);
        suite.abort(err);
      }
      else deferred.resolve();
    });
  }, { defer: true });

suite
  .add('insertEntriesOnce', function(deferred) {
    var records = setup();
    insertEntriesOnce(Contact, records, function(err) {
      if(err) {
        console.error(err.stack);
        suite.abort(err);
      }
      else deferred.resolve();
    });
  }, { defer: true });

suite
  .add('insertEntriesOnceValidate', function(deferred) {
    var records = setup();
    insertEntriesOnceValidate(Contact, records, function(err) {
      if(err) {
        console.error(err.stack);
        suite.abort(err);
      }
      else deferred.resolve();
    });
  }, { defer: true });

suite
  .add('insertEntriesBlocks', function(deferred) {
    var records = setup();
    insertEntriesBlocks(Contact, records, 500, function(err) {
      if(err) {
        console.error(err.stack);
        suite.abort(err);
      }
      else deferred.resolve();
    });
  }, { defer: true });

suite
  .add('insertEntriesBlocksValidate', function(deferred) {
    var records = setup();
    insertEntriesBlocksValidate(Contact, records, 500, function(err) {
      if(err) {
        console.error(err.stack);
        suite.abort(err);
      }
      else deferred.resolve();
    });
  }, { defer: true });

suite
  .on('cycle', function(evt) {
    console.log(String(evt.target));
    console.log('\t' + 'Total time: ' + evt.target.times.elapsed);
    console.log('\t' + 'Time per cycle: ' + evt.target.times.cycle);
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run();
