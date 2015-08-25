/*!
 * Identity Composer.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'jsonld', 'underscore'], function(angular, jsonld, _) {

'use strict';

/* @ngInject */
function brIdentityComposer() {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      library: '=brLibrary',
      credentials: '=brCredentials',
      consumerQuery: '=brConsumerQuery',
      id: '=brId',
      identity: '=ngModel'
    },
    /* jshint multistr: true */
    templateUrl: requirejs.toUrl(
      'bedrock-angular-identity-composer/identity-composer.html'),
    link: Link
  };

  function Link(scope, element, attrs) {
    scope.modal = {show: false};

    scope.$watch(function() {return scope.library;}, init, true);
    scope.$watch(function() {return scope.consumerQuery;}, init, true);
    scope.$watch(function() {return scope.choices;}, updateChoices, true);

    scope.showChoice = function(property) {
      hideAllChoices();
      scope.choices[property].show = true;
    };

    scope.showIdentity = function() {
      hideAllChoices();
      scope.identity = {
        '@context': 'https://w3id.org/identity/v1'
      };
      if(scope.id) {
        scope.identity.id = scope.id;
      }
      scope.identity.credential = _.uniq(
        _.map(scope.choices, function(choice) {
          return {'@graph': choice.selected};
        }));
    };

    // TODO: remove once br-credential-thumbnail is available
    scope.showCredential = function(option) {
      scope.modal.show = true;
      scope.modal.credential = option.credential;
      scope.modal.groups = option.credentialGroups;
    };

    function init() {
      if(!scope.library || !scope.consumerQuery) {
        return;
      }

      // TODO: credentials need to be compacted to appropriate context
      // either here or externally
      // TODO: consumer needs to be compacted to appropriate context, here
      // or externally

      // FIXME: this TODO partly handled. review and update
      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it or integrate it
      // into the module instead of implementing it as a test service

      scope.choices = {};
      scope.identity = null;
      scope.composed = false;

      // build choice information
      for(var property in scope.consumerQuery) {
        var choice = scope.choices[property] = {
          show: false,
          selected: null
        };
        // TODO: build groups to use to display just the requested
        // information
        var groups = [];
        // build options for this choice
        choice.options = _.chain(scope.credentials)
          .filter(function(credential) {
            return jsonld.hasProperty(credential.claim, property);
          })
          .map(function(credential) {
            // TODO: should be handled by br-credential instead
            // pick out groups that match credential types
            var types =
              _.flatten(jsonld.getValues(credential, 'type'));
            var credentialGroups =
              _.values(_.pick(scope.library.groups, types));
            return {
              credential: credential,
              credentialGroups: credentialGroups,
              groups: groups
            };
          })
          .value();
      }
    }

    function updateChoices() {
      if(!scope.choices) {
        return;
      }

      // for every selected credential, mark other choices as selected
      // if the selected credential also contains the property for the choice
      for(var property in scope.consumerQuery) {
        if(!scope.choices[property].selected) {
          return;
        }
        var selected = scope.choices[property].selected;
        for(var otherProperty in scope.consumerQuery) {
          if(otherProperty !== property &&
            jsonld.hasProperty(selected.claim, otherProperty) &&
            !scope.choices[otherProperty].selected) {
            scope.choices[otherProperty].selected = selected;
          }
        }
      }

      // track if a full identity has now been composed
      scope.composed = isComposed();
    }

    function hideAllChoices() {
      _.each(scope.choices, function(choice) {
        choice.show = false;
      });
    }

    function isComposed() {
      return _.every(_.values(scope.choices), function(choice) {
        return choice.selected;
      });
    }
  }
}

return {brIdentityComposer: brIdentityComposer};

});
