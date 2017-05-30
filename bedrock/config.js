/*
 * Bedrock Configuration.
 *
 * Copyright (c) 2012-2017 Digital Bazaar, Inc. All rights reserved.
 */
var path = require('path');

module.exports = function(bedrock) {
  if(bedrock.config.protractor) {
    var protractor = bedrock.config.protractor.config;
    // add protractor tests
    protractor.suites['bedrock-angular-identity-composer'] =
      path.join(__dirname, './tests/**/*.js');
  }

  var packages = bedrock.config.views.angular.optimize.templates.packages;
  packages['bedrock-angular-identity-composer'] = {
    src: [
      '**/*.html',
      '!bedrock/**/*.html'
    ]
  };
};
