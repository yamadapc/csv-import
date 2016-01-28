'use strict';
if(!module.parent) {
  var Chance = require('chance'),
      path = require('path'),
      fs = require('fs');

  var chance = new Chance();

  var records = ['name,tel,job'];
  for(var i = 1; i < 100; i++) {
    var entry = '';
    entry += chance.name();
    entry += ',' + chance.phone();
    entry += ',' + chance.word();

    records[i] = entry;
  }

  fs.writeFileSync(path.join(__dirname, 'big-sample.csv'), records.join('\n'));
}
