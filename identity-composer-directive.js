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
function brIdentityComposer($rootScope, brCredentialLibraryService) {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      loading: '=brLoading',
      library: '=?brLibrary',
      credentials: '=brCredentials',
      consumerQuery: '=brConsumerQuery',
      id: '=brId',
      identity: '=ngModel',
      doneCallback: '&brCallback'
    },
    /* jshint multistr: true */
    templateUrl: requirejs.toUrl(
      'bedrock-angular-identity-composer/identity-composer.html'),
    link: Link
  };

  function Link(scope, element, attrs) {
    var CONTEXT = [
      'https://w3id.org/identity/v1',
      'https://w3id.org/credentials/v1'
    ];
    scope.modal = {show: false};
    scope.loading = false;

    scope.$watch(function() {return scope.library;}, init, true);
    scope.$watch(function() {return scope.consumerQuery;}, init, true);
    scope.$watch(function() {return scope.choices;}, updateChoices, true);

    scope.showChoice = function(property) {
      hideAllChoices();
      scope.choices[property].show = true;
    };

    // TODO: If current flow is maintained then this function should be renamed
    scope.showIdentity = function() {
      // hideAllChoices();
      scope.identity = {
        '@context': CONTEXT
      };
      if(scope.id) {
        scope.identity.id = scope.id;
      }
      scope.identity.credential = _.uniq(
        _.map(scope.choices, function(choice) {
          return {'@graph': choice.selected};
        }));
      scope.doneCallback(scope.identity);
    };

    // TODO: remove once br-credential-thumbnail is available
    scope.showCredential = function(option) {
      scope.modal.show = true;
      scope.modal.credential = option.credential;
      scope.modal.groups = option.credentialGroups;
    };

    function init() {
      scope.loading = true;
      scope.processed = {};
      scope.choices = {};
      scope.identity = null;
      scope.composed = false;

      if(!scope.library) {
        brCredentialLibraryService.getLibrary()
          .then(function(library) {
            scope.library = library;
            console.info('[Identity Composer] Using default library.',
              scope.library);
          });
      }
      if(!scope.consumerQuery) {
        console.warn('[Identity Composer] No query.');
        scope.loading = false;
        return;
      }

      // compact credentials
      var credentialPromise = Promise.all(scope.credentials.map(
        function(credential) {
        return jsonld.promises.compact(credential, {'@context': CONTEXT});
      }))
      .then(function(compacted) {
        scope.processed.credentials = compacted;
        return compacted;
      });

      // compact query
      var queryPromise = jsonld.promises.compact(
        scope.consumerQuery, {'@context': CONTEXT})
      .then(function(compacted) {
        scope.processed.consumerQuery = compacted;
        return compacted;
      });

      Promise.all([credentialPromise, queryPromise])
        .then(function(results) {
          var credentials = results[0];
          var query = results[1];
          // build choice information
          for(var property in query) {
            if(property === '@context') {
              continue;
            }
            var choice = scope.choices[property] = {
              label: property,
              show: false,
              selected: null
            };
            if(property in scope.library.properties) {
              var propertyInfo = scope.library.properties[property];
              if('label' in propertyInfo) {
                scope.choices[property].label = propertyInfo.label;
              }
            }
            // TODO: build groups to use to display just the requested
            // information
            var groups = [];
            // build options for this choice
            choice.options = _.chain(credentials)
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
        }).catch(function(err) {
          // FIXME: show on UI?
          console.error('[Identity Composer] Error:', err);
        }).then(function() {
          scope.loading = false;
          $rootScope.$apply();
        });

      // FIXME: this TODO partly handled. review and update
      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it or integrate it
      // into the module instead of implementing it as a test service
    }

    function updateChoices() {
      if(!scope.choices) {
        return;
      }

      // for every selected credential, mark other choices as selected
      // if the selected credential also contains the property for the choice
      for(var property in scope.processed.consumerQuery) {
        if(property === '@context') {
          continue;
        }
        var selected = scope.choices[property].selected;
        if(!selected) {
          continue;
        }
        for(var otherProperty in scope.processed.consumerQuery) {
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
