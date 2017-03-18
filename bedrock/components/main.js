define([
  'angular',
  './test-form-controller',
  './test-form-library-service'
], function(angular, brTestFormController, brTestFormLibraryService) {

'use strict';

var module = angular.module(
  'bedrock-angular-identity-composer-test',
  ['bedrock.form', 'bedrock.identity-composer']);

module.controller(brTestFormController);
module.service(brTestFormLibraryService);

return module.name;

});
