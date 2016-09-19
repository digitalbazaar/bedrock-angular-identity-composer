/*!
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([
  'angular',
  './test-composer-component'
], function(angular) {

'use strict';

var module = angular.module('bedrock.composer-test', []);

Array.prototype.slice.call(arguments, 1).forEach(function(register) {
  register(module);
});

module.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      title: 'Test',
      template: '<br-test-composer></br-test-composer>'
    });
});

});
