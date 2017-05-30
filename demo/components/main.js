/*!
 * Copyright (c) 2016-2017 Digital Bazaar, Inc. All rights reserved.
 */
import angular from 'angular';
import * as bedrock from 'bedrock-angular';
import TestComposerComponent from './test-composer-component.js';

var module = angular.module('bedrock.composer-test', [
  'bedrock.credential', 'bedrock.card-displayer', 'bedrock.identity-composer'
]);

module.component('brTestComposer', TestComposerComponent);

bedrock.setRootModule(module);

/* @ngInject */
module.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      title: 'Test',
      template: '<br-test-composer></br-test-composer>'
    });
}).run(function(brCredentialService) {
  brCredentialService.registerDisplayer({
    id: 'urn:bedrock:br-motor-vehicle-credential-displayer',
    accept: {
      'urn:bedrock:test:MotorVehicleLicenseCredential': {}
    },
    directive: 'br-motor-vehicle-credential-displayer'
  });

  // generic card types
  var cardTypes = [
    "urn:bedrock:test:CableSubscriptionCredential",
    "urn:bedrock:test:LoyaltyCardCredential",
    "urn:bedrock:test:MessageBoardSubscription",
    "urn:bedrock:test:PassportCredential",
    "urn:bedrock:test:ProofOfResidenceCredential",
    "urn:bedrock:test:LegalNameCredential"
  ];
  cardTypes.forEach(function(cardType) {
    var accept = {};
    accept[cardType] = {};
    brCredentialService.registerDisplayer({
      id: 'urn:bedrock:card:type:' + cardType,
      accept: accept,
      directive: 'br-credential-card-displayer'
    });
  });
});
