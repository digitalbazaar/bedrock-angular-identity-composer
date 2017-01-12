/*
 * Composer configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

// load bedrock dependencies
require('bedrock-express');
require('bedrock-server');
require('bedrock-views');

// server
config.server.port = 8002;
config.server.httpPort = 8001;
config.server.bindAddr = ['localhost'];
config.server.domain = 'localhost';
config.server.host = 'localhost:8002';
config.server.baseUri =
  'https://' + config.server.host + ':' + config.server.port + '/';

// branding
config.brand.name = 'Composer Example';

config.views.vars.baseUri = config.server.baseUri;
config.views.vars.serviceHost = config.server.host;
config.views.vars.serviceDomain = config.server.domain;
config.views.vars.supportDomain = 'example.com';
config.views.vars.title = config.brand.name;
config.views.vars.siteTitle = config.brand.name;

// pseudo bower package
config.requirejs.bower.packages.push({
  path: path.join(__dirname, '../../..', 'bedrock-angular-identity-composer'),
  manifest: path.join(
      __dirname, '../../..', 'bedrock-angular-identity-composer', 'bower.json')
});


// pseudo bower package
config.requirejs.bower.packages.push({
  path: path.join(__dirname, '..', 'components'),
  manifest: {
    name: 'bedrock-composer-test',
    moduleType: 'amd',
    main: './main.js',
    dependencies: {
      angular: '~1.3.0'
    }
  }
});

