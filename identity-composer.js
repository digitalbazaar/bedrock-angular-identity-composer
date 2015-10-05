/*!
 * Identity Composer module.
 * 
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 * 
 * @author Dave Longley
 */
define([
  'angular',
  './identity-composer-directive',
  './identity-credential-directive'
], function(angular, identityComposer, identityCredential) {

'use strict';

var module = angular.module('bedrock-identity-composer', ['ngAnimate']);

module.directive(identityComposer);
module.directive(identityCredential);

return module.name;

});
