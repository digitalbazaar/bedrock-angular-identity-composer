/*
 * Identity Composer configuration.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

// cache
config.paths.cache = path.resolve(path.join(__dirname, '../.cache'));

// server
config.server.port = 8002;
config.server.httpPort = 8001;
config.server.domain = 'localhost';

// branding
config.brand.name = 'Composer Example';

config.views.vars.baseUri = config.server.baseUri;
config.views.vars.serviceHost = config.server.host;
config.views.vars.serviceDomain = config.server.domain;
config.views.vars.supportDomain = 'example.com';
config.views.vars.title = config.brand.name;
config.views.vars.siteTitle = config.brand.name;

// pseudo bower package for composer
var composerPath = path.resolve(path.join(__dirname, '../..'));
config.requirejs.bower.packages.push({
  path: composerPath,
  manifest: path.join(composerPath, 'bower.json')
});

// pseudo bower package for test files
config.requirejs.bower.packages.push({
  path: path.join(__dirname, '..', 'components'),
  manifest: {
    name: 'bedrock-composer-test',
    moduleType: 'amd',
    main: './main.js',
    dependencies: {
      angular: '~1.5.0'
    }
  }
});
