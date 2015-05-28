/*!
 * Identity Composer module.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './identity-composer-directive'
], function(angular, identityComposer) {

'use strict';

var module = angular.module('bedrock-identity-composer', []);

module.directive(identityComposer);

return module.name;

});
