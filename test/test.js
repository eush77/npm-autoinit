'use strict';

var rewire = require('rewire');

var autoinit = rewire('..');

var test = require('tape'),
    findRoot = require('find-root');

var fs = require('fs');


var generatedPackageJson = __dirname + '/package.json';
var lastModificationTime;

var cleanup = function (t) {
  fs.unlink(generatedPackageJson, function (err) {
    t.ifErr(err);
    t.end();
  });
};


test('first time', function (t) {
  autoinit.__set__('findRoot', function () {
    throw Error('package.json not found in path');
  });

  t.plan(3);

  autoinit(__dirname, function (err) {
    t.ifErr(err);
    fs.stat(generatedPackageJson, function (err, stat) {
      t.ifErr(err);
      t.equal(require(generatedPackageJson).name, 'test');
      lastModificationTime = stat.mtime;
      t.end();
    });
  });
});


test('second time', function (t) {
  autoinit.__set__('findRoot', findRoot);

  t.plan(4);

  autoinit(__dirname, function (err) {
    t.ifErr(err);
    fs.stat(generatedPackageJson, function (err, stat) {
      t.ifErr(err);
      t.equal(+stat.mtime, +lastModificationTime);
      cleanup(t);
    });
  });
});
