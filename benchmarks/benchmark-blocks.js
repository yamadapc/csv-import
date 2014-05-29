'use strict';
var Chance = require('chance'),
    mongoose = require('mongoose'),
    Benchmark = require('benchmark');

var SAMPLE_SIZE = 2000;
var CONNECTIONS = 5;

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

var insertEntriesBlocks = importCsv.insertEntriesBlocks;

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

/* jshint -W083 */
for(var blockSize = SAMPLE_SIZE; blockSize > 200; blockSize -= 100) {
  suite.add('blocksize = ' + blockSize, function(deferred) {
    var records = setup();
    insertEntriesBlocks(Contact, records, blockSize, function(err) {
      if(err) deferred.abort(err);
      else deferred.resolve();
    });
  }, { defer: true });
}

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
