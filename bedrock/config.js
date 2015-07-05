/*
 * Bedrock Configuration.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var fs = require('fs');
var path = require('path');

module.exports = function(bedrock) {
  if(bedrock.config.protractor) {
    var protractor = bedrock.config.protractor.config;
    // add protractor tests
    protractor.suites['bedrock-angular-identity-composer'] =
      path.join(__dirname, './tests/**/*.js');
  }
};
