#!/usr/bin/env node

var fs = require('fs');
var optimist = require('optimist')
var argv = optimist.usage(fs.readFileSync(__dirname + '/USAGE.txt', 'utf8'))
    .argv;
var env = require('superenv')('stripe');
var stripe = require('stripe')(env.key);

var resource = argv._[0];
var command = argv._[1];

if (!resource || !stripe[resource]) {
    console.error('Invalid resource');
    optimist.showHelp();
    process.exit(1);
}

if (!command || !stripe[resource][command]) {
    console.error('Invalid command');
    optimist.showHelp();
    process.exit(1);
}

var objects = [];
(function list(offset) {
    stripe[resource][command]({
        count: 100,
        offset: 100 * offset
    }, function(err, i) {
        if (err) throw err;
        if (i.data.length == 0) return console.log(JSON.stringify(objects, null, 4));
        objects = objects.concat(i.data);
        list(++offset);
    });
})(0);
