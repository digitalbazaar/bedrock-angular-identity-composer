/*!
 * Identity Composer module.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './identity-composer-component'
], function(angular) {

'use strict';

var module = angular.module('bedrock.identity-composer', ['ngAnimate']);

Array.prototype.slice.call(arguments, 1).forEach(function(register) {
  register(module);
});

});
