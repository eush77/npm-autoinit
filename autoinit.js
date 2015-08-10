'use strict';

var init = require('init-package-json'),
    findRoot = require('find-root');


module.exports = function (dir, cb) {
  // Make sure no package.json is there yet.
  try {
    findRoot(dir);
    return process.nextTick(cb);
  }
  catch (e) {}

  // Write package.json file.
  var consoleLog = console.log;
  console.log = Function.prototype;
  init(dir, String(), { yes: true }, function (err) {
    console.log = consoleLog;
    cb(err);
  });
};
