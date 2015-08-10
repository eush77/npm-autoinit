'use strict';

var spawnSync = require('child_process').spawnSync;


// Block event loop while package.json is being constructed.
spawnSync(process.argv[0], [__dirname + '/init'], {
  stdio: 'inherit'
});
