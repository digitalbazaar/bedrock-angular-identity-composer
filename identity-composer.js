/*!
 * Identity Composer module.
 *
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './identity-composer-directive',
  './credential-selector-directive'
], function(angular, identityComposer, credentialSelector) {

'use strict';

var module = angular.module('bedrock-identity-composer', ['ngAnimate']);

module.directive(identityComposer);
module.directive(credentialSelector);

return module.name;

});
