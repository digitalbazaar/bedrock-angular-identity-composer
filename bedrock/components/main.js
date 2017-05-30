import angular from 'angular';
import BrTestFormController from './test-form-controller.js';
import BrTestFormLibraryService from './test-form-library-service.js';

var module = angular.module(
  'bedrock-angular-identity-composer-test', ['bedrock.form',
    'bedrock.identity-composer'
  ]);

module.controller('brTestFormController', BrTestFormController);
module.service('brBrTestFormLibraryService', BrTestFormLibraryService);
