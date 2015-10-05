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
    scope: {
      consumerQuery: '=brConsumerQuery',
      doneCallback: '&brCallback',
      identity: '=brIdentity',
      library: '=?brLibrary',
      loading: '=?brLoading'
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

    scope.selectedPage = true;

    scope.page = 'front';
    scope.selectedCredentials = [];
    scope.allCredentials = [];

    scope.claimsPartiallyFulfillable = false;


    scope.$watch(function() {return scope.library;}, init, true);
    scope.$watch(function() {return scope.consumerQuery;}, init, true);
    scope.$watch(function() {return scope.requestedProperties;}, updateFulfilledProperties, true);


    scope.prefillProperties = function() {
      scope.page = 'front';
      if(!scope.requestedProperties) {
        // Nothing sent in query
        return;
      }
      scope.selectedCredentials = [];
      for(var key in scope.requestedProperties) {
        var curChoice = scope.requestedProperties[key];
        if(!curChoice.selected && curChoice.options.length > 0) {
          // TODO: Select which option to take more wisely
          var selectedOption = curChoice.options[0];
          curChoice.selected = selectedOption.credential;
          if(scope.selectedCredentials.indexOf(selectedOption.credential) === -1) {
            scope.selectedCredentials.push(selectedOption.credential);
          }
          updateFulfilledProperties();
        }
      }
      // Check if all requested claims in the query are fulfilled
      scope.claimsPartiallyFulfillable = false;
      for(var key in scope.selectedCredentials) {
        var credential = scope.selectedCredentials[key];
        var claims = scope.claimsForCredential(credential);
        for(key in claims) {
          var claim = claims[key];
          if(claim in scope.requestedProperties) {
            scope.requestedProperties[claim].fulfillable = true;
            scope.claimsPartiallyFulfillable = true;
          }
        }
      }
      for(var key in scope.requestedProperties) {
        var requestedProperty = scope.requestedProperties[key];
        if(!requestedProperty.fulfillable) {
          scope.page = 'unfulfillable'
        }
      }
    };

    scope.isReplacing = function() {
      for(var key in scope.selectedCredentials) {
        var credential = scope.selectedCredentials[key];
        if(credential.editing) {
          return true;
        }
      }
      return false;
    }
    
    scope.back = function() {
      if(scope.isReplacing()) {
        for(var key in scope.selectedCredentials) {
          var credential = scope.selectedCredentials[key];
          credential.hidden = false;
          credential.editing = false;
        }
      } else {
        for(var key in scope.selectedCredentials) {
          var credential = scope.selectedCredentials[key];
          scope.page = 'front';
        }
      }
    }

    scope.clickItem = function(credential) {
      // Mark the clicked credential editing, and hide all other credentials
      scope.selectedPage = false;
      credential.hidden = false;
      credential.editing = true;
      for(var key in scope.selectedCredentials) {
        var selectedCredential = scope.selectedCredentials[key];
        selectedCredential.hidden = true;
      }
    };

    scope.claimsForCredential = function(credential) {
      // This only pulls in claims at the top level, and does not recover nested claims
      var claims = [];
      for(var key in credential.claim) {
        if(key === 'id' || key === 'image') {
          continue;
        }
        claims.push(key)
      }
      return claims;
    };

    scope.fulfillsExcessClaims = function(credential) {
      var claims = scope.claimsForCredential(credential);

      var requestedClaims = scope.requestedProperties;

      var excessClaims = [];
      for(var key in claims) {
        var claim = claims[key];
        if(!(claim in requestedClaims)) {
          excessClaims.push(claim);
        }
      }
      return excessClaims;
    }

    scope.htmlClaims = function() {
      var html = '<h6>The site is requesting the following information:</h6>';
      for(var key in scope.requestedProperties) {
        var claim = scope.requestedProperties[key];
        html = html + '<h6>' + claim.label + '</h6>';
      }
      return html;
    }

    // This is used to populate an html tooltip with valid html claims
    scope.htmlClaimsForCredential = function(credential) {
      var claims = scope.claimsForCredential(credential);
      var html = '<h6>Contains the following information:</h6>';
      for(var key in claims) {
        var claim = claims[key];
        html = html + '<h6>' + scope.labelForProperty(claim) + '</h6>';
      }
      return html;
    }

    scope.htmlExcessClaimsForCredential = function(credential) {
      var claims = scope.fulfillsExcessClaims(credential);
      var html = '<h6>Will send info that the site did not ask for:</h6>';
      for(var key in claims) {
        var claim = claims[key];
        html = html + '<h6>' + scope.labelForProperty(claim) + '</h6>';
      }
      return html;
    }

    scope.replacementCredentials = function(credential) {
      var substituteCredentials = [];
      // TODO: This doesn't really handle queries that take in a specific value 
      // request, because it only looks if credentials have matching keys 
      // (but shouldn't the consumer be verifying the returned values anyway?)

      // Get all of the passed in credential's claims
      var claims = scope.claimsForCredential(credential);
      // Filter the passed in claims that match with the properties requested in the query.
      var requestedClaims = claims.filter(function(claim) {
                                            return jsonld.hasProperty(scope.requestedProperties, claim);
                                          });
      // Filter through all of the user's credentials, returning those that fulfill the requested claims
      for(var key in requestedClaims) {
        var property = requestedClaims[key];
        substituteCredentials = substituteCredentials.concat(scope.allCredentials
                                                            .filter(function(substituteCredential) {
                                                                     // The credential fulfills the requested claim
                                                              return jsonld.hasProperty(substituteCredential.claim, property) &&
                                                                     // The credential is not already in the substitute list 
                                                                     substituteCredentials.indexOf(substituteCredential) === -1 &&
                                                                     substituteCredential !== credential;
                                                            }));
      }
      return substituteCredentials;
    }

    scope.hasReplaceableCredentials = function(credential) {
      var replaceableCredentials = scope.replacementCredentials(credential);
      return replaceableCredentials.length !== 0;
    }

    scope.done = function() {
      var identity = {
        '@context': CONTEXT,
        id: scope.identity.id
      };
      identity.credential = _.uniq(
        _.map(scope.selectedCredentials, function(credential) {
          delete credential.hidden;
          delete credential.editing;
          return {'@graph': credential};
        }));
      scope.doneCallback({identity: identity});
    };

    scope.labelForProperty = function(property) {
      if(!scope.library.properties) {
        console.log('library not loaded, failed to retrieve label for property');
        return property;
      }
      if(property in scope.library.properties) {
        var propertyInfo = scope.library.properties[property];
        if('label' in propertyInfo) {
          return propertyInfo.label;
        }
      }
      return property;
    }

    scope.cancelButtonPressed = function() {
      // TODO: Escape page
    }

    function init() {
      scope.loading = true;
      scope.processed = {};
      scope.requestedProperties = {};
      scope.output = null;
      scope.composed = false;

      var libraryPromise;
      if(scope.library) {
        libraryPromise = Promise.resolve(scope.library);
      } else {
        libraryPromise = brCredentialLibraryService.getLibrary()
          .then(function(library) {
            scope.library = library;
            console.info(
              '[Identity Composer] Using default library.', scope.library);
            return library;
          });
      }
      if(!scope.consumerQuery) {
        console.warn('[Identity Composer] No query.');
        scope.loading = false;
        return;
      }

      // FIXME: frame identity and frame credentials first
      // (use one frame once possible), ensure claims are embedded
      var credentials = jsonld.getValues(scope.identity, 'credential').map(
        function(credential) {
          return credential['@graph'];
        });
      // compact credentials
      var credentialPromise = Promise.all(credentials.map(function(credential) {
        return jsonld.promises.compact(credential, {'@context': CONTEXT});
      })).then(function(compacted) {
        scope.processed.credentials = compacted;
        return compacted;
      });

      // compact query
      var queryPromise = jsonld.promises.compact(
        scope.consumerQuery, {'@context': CONTEXT}).then(function(compacted) {
        scope.processed.consumerQuery = compacted;
        return compacted;
      });

      Promise.all([libraryPromise, credentialPromise, queryPromise])
        .then(function(results) {
          var credentials = results[1];
          var query = results[2];

          scope.allCredentials = credentials;

          for(var credential in credentials) {
            credentials[credential].cache = {};
          }

          // build choice information
          for(var property in query) {
            if(property === '@context') {
              continue;
            }
            var choice = scope.requestedProperties[property] = {
              label: property,
              show: false,
              selected: null,
              optional: isOptional(query[property])
            };
            scope.requestedProperties[property].label = scope.labelForProperty(property);
            
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
          scope.prefillProperties();
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

    function updateFulfilledProperties() {
      if(!scope.requestedProperties) {
        return;
      }

      // for every selected credential, mark other choices as selected
      // if the selected credential also contains the property for the choice
      for(var property in scope.processed.consumerQuery) {
        if(property === '@context') {
          continue;
        }
        var selected = scope.requestedProperties[property].selected;
        if(!selected) {
          continue;
        }
        for(var otherProperty in scope.processed.consumerQuery) {
          if(otherProperty !== property &&
            jsonld.hasProperty(selected.claim, otherProperty) &&
            !scope.requestedProperties[otherProperty].selected) {
            scope.requestedProperties[otherProperty].selected = selected;
          }
        }
      }

      // track if a full identity has now been composed
      scope.composed = isComposed();
    }

    function claimsFilteredByQuery(claims, query) {
      return claims.filter(function(claim) {
                                          return jsonld.hasProperty(query, claim);
                                        });
    }

    function isComposed() {
      return _.every(_.values(scope.requestedProperties), function(choice) {
        return choice.selected;
      });
    }

    function isOptional(queryValue) {
      if(!angular.isObject(queryValue)) {
        return;
      }
      return queryValue['cred:isOptional'] === true;
    }
  }
}

return {brIdentityComposer: brIdentityComposer};

});
