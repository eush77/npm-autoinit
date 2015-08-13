'use strict';

var test = require('tape'),
    rewire = require('rewire'),
    findRoot = require('find-root'),
    falafel = require('falafel');

var fs = require('fs'),
    vm = require('vm');

var init = rewire('..'),
    autoinit = (function (src) {
      src = falafel(src, function (decl) {
        if (decl.type == 'VariableDeclarator' && decl.id.name == 'spawnSync') {
          decl.update('spawned = false, spawnSync = ' + function () {
            spawned = true;
          });
        }
      }) + ';spawned';

      return function (/* argv */) {
        return vm.runInNewContext(src, {
          __dirname: __dirname + '/..',
          process: {
            argv: [].slice.call(arguments)
          }
        });
      };
    }(fs.readFileSync(require.resolve('../autoinit'), 'utf8')));


var generatedPackageJson = __dirname + '/package.json';
var lastModificationTime;

var cleanup = function (t) {
  fs.unlink(generatedPackageJson, function (err) {
    t.ifErr(err);
    t.end();
  });
};


test('first time', function (t) {
  init.__set__('findRoot', function () {
    throw Error('package.json not found in path');
  });

  t.plan(3);

  init(__dirname, function (err) {
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
  init.__set__('findRoot', findRoot);

  t.plan(4);

  init(__dirname, function (err) {
    t.ifErr(err);
    fs.stat(generatedPackageJson, function (err, stat) {
      t.ifErr(err);
      t.equal(+stat.mtime, +lastModificationTime);
      cleanup(t);
    });
  });
});


test('respond only to local install', function (t) {
  t.true(autoinit('node', 'npm', 'i', 'test'), 'npm i');
  t.true(autoinit('node', 'npm', 'install', 'test'), 'npm install');
  t.false(autoinit('node', 'npm', 'install', 'test', '-g'), 'npm install -g');
  t.false(autoinit('node', 'npm', 'i', 'test', '--global'), 'npm i --global');
  t.false(autoinit('node', 'npm', 'v', 'npm-autoinit', 'keywords'), 'npm v');
  t.false(autoinit('node', 'npm'), 'npm');
  t.end();
});
