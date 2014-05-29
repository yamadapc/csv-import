// main importation logic
'use strict';
var stream = require('stream'),
    csv = require('csv'),
    async = require('async');

var Readable = stream.Readable;

exports = module.exports = importCsv;

/**
 * Takes stream of a csv's representation and a callback and yields the result
 * of their importation to mongodb.
 *
 * @param {Model} model A mongoose model
 * @param {{Readable|String}} records A stream of unparsed records or a path to
 * a csv file
 * @param {Function} cb A callback function
 */

function importCsv(model, records, cb) {
  if(typeof records === 'string') {
    records = csv().from.path(records);
  } else if(records instanceof Readable) {
    records = csv().from.stream(records);
  }

  parseEntries(records, function parseEntriesCb(err, entries) {
    if(err) return cb(err);
    insertEntries(model, entries, cb);
  });
}

exports.zipObject = function zipObject(keys, values) {
  var ret = {};

  for(var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i],
        value = values[i];

    value && (ret[key] = value);
  }

  return ret;
};

var parseEntry = exports.zipObject;

/**
 * Parses entries out of a stream of records.
 *
 * @param {Readable} records A stream of records generated with `csv`
 * @param {Function} cb A callback function
 */

var parseEntries = exports.parseEntries = function parseEntries(records, cb) {
  var entries = [],
      i = 0,
      header;

  records
    .on('record', function(row) {
      if(i === 0) header = row;
      else entries.push(parseEntry(header, row));
      i++;
    })
    .on('error', cb)
    .on('end', cb.bind(null, null, entries));
};

/**
 * Inserts an array of entries into a Target model's collection.
 *
 * @param {Model} Target The target model
 * @param {Array.<Object>} entries The entries to insert
 * @param {Function} cb A callback function
 */

var insertEntries = exports.insertEntries = function insertEntries(Target, entries, cb) {
  async.map(entries, function(entry, cb) {
    (new Target(entry)).save(cb);
  }, cb);
};

exports.insertEntriesOnce = function(Target, entries, cb) {
  Target.collection.insert(entries, cb);
};

exports.insertEntriesOnceValidate = function(Target, entries, cb) {
  async.map(entries, function(entry, cb) {
    var doc = new Target(entry);
    doc.validate(function(err) {
      if(err) cb(err);
      else cb(null, doc.toObject());
    });
  }, function(err, validatedEntries) {
    if(err) cb(err);
    else Target.collection.insert(validatedEntries, cb);
  });
};

exports.insertEntriesBlocks = function(Target, entries, blockSize, cb) {
  var blockedEntries = [];
  for(var i = 0, z = 0, len = entries.length; i < len; i += blockSize, z++) {
    blockedEntries[z] = [];

    for(var j = 0; j < blockSize; j++) {
      blockedEntries[z].push(entries[j]);
    }
  }

  async.map(blockedEntries, function(entries, cb) {
    Target.collection.insert(entries, cb);
  }, cb);
};

exports.insertEntriesBlocksValidate = function(Target, entries, blockSize, cb) {
  var blockedEntries = [];
  for(var i = 0, z = 0, len = entries.length; i < len; i += blockSize, z++) {
    blockedEntries[z] = [];

    for(var j = 0; j < blockSize; j++) {
      blockedEntries[z].push(entries[j]);
    }
  }

  async.map(blockedEntries, function(entries, cb) {
    async.map(entries, function(entry, cb) {
      var doc = new Target(entry);
      doc.validate(function(err) {
        if(err) cb(err);
        else cb(null, doc.toObject());
      });
    }, function(err, entries) {
      if(err) cb(err);
      else Target.collection.insert(entries, cb);
    });
  }, cb);
};
