/*!
 * Identity Composer.
 *
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'jsonld', 'lodash'], function(angular, jsonld, _) {

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

  function Link(scope) {
    var model = scope.model = {};
    var CONTEXT = [
      'https://w3id.org/identity/v1',
      'https://w3id.org/credentials/v1'
    ];

    model.library = scope.library;
    model.consumerQuery = scope.consumerQuery;
    model.identity = scope.identity;
    model.doneCallback = scope.doneCallback;
    model.processed = {};
    model.requestedProperties = {};
    model.output = null;
    model.composed = false;
    model.modal = {show: false};
    model.loading = scope.loading;
    model.page = 'front';
    model.modalVisible = false;
    model.currentCredential = {};

    model.selectedCredentials = [];
    /*var passport_credential = {"@context":["https://w3id.org/identity/v1","https://w3id.org/credentials/v1"],"id":"https://authorization.dev:33443/issuer/credentials/1473862731352","type":["Credential","urn:bedrock:test:PassportCredentia"],"image":"http://simpleicon.com/wp-content/uploads/global_1-128x128.png","name":"Passport","claim":{"id":"did:40b16795-73a6-446e-b06d-767087241f24","address":{"type":"PostalAddress","addressCountry":"US","addressLocality":"Blacksburg","addressRegion":"Virginia","postalCode":"24060","streetAddress":"1 Main St."},"schema:birthDate":{"type":"xsd:dateTime","@value":"1980-01-01T00:00:00Z"},"schema:gender":"female","schema:height":"65in","image":"http://simpleicon.com/wp-content/uploads/business-woman-2-128x128.png","name":"Pat Doe","schema:nationality":{"name":"United States"},"urn:bedrock:test:eyeColor":"blue","urn:bedrock:test:passport":{"type":"urn:bedrock:test:Passport","name":"Test Passport","issued":"2010-01-07T01:02:03Z","issuer":"https://example.gov/","expires":"2020-01-07T01:02:03Z","urn:bedrock:test:documentId":"1473862731352"}},"issued":"2016-09-14T14:18:51.352Z","issuer":"urn:issuer:test","signature":{"type":"GraphSignature2012","created":"2016-09-14T14:18:51Z","creator":"https://authorization.dev:33443/issuer/keys/1","signatureValue":"Dex6kqi8fZHbyHkscPcLz2gFvaWBUET5ZkjHN+SJNY2Rq7UfcQ0oOwI2A0NUOA7hivGszFszxbEaEloaUDyzrg=="}};
    for(var i = 0; i < 4; ++i) {
      model.selectedCredentials.push(_.clone(passport_credential));
    }*/
    model.allCredentials = [];

    model.claimsPartiallyFulfillable = false;
    model.publicAccess = {
      requested: false,
      acknowledged: false
    };

    // TODO: Consider changing "cred:requestPublicAccess" to
    // "cred:requestPersistentAccess" with a value of "publicAccess" so we can
    // support consumers/inspectors providing their ID as a value as well
    if(jsonld.hasProperty(model.consumerQuery, 'cred:requestPublicAccess')) {
      model.publicAccess.requested = true;
      // FIXME: if this property is not deleted from the query, the composer
      // attempts to fulfill a request for this property
      delete model.consumerQuery['cred:requestPublicAccess'];
    }

    scope.$watch(function() {return scope.library;}, init, true);
    scope.$watch(function() {return scope.consumerQuery;}, init, true);
    scope.$watch(
      function() {return model.requestedProperties;},
      updateFulfilledProperties, true);

    model.cancel = function() {
      model.doneCallback({identity: null});
    };

    // START OF NEW CODE //


    model.showModal = function(bool) {
      model.modalVisible = bool;
    };

    model.setCurrentCredential = function(cred) {
      model.currentCredential = cred;
    };

    model.clearCurrentCredential = function() {
      model.currentCredential = {};
    };

    model.hideCredentialWarning = function(credential) {
      credential.showWarning = false;
    };



    // END OF NEW CODE //



    model.prefillProperties = function() {
      model.page = 'front';
      if(!model.requestedProperties) {
        // Nothing sent in query
        return;
      }
      model.selectedCredentials = [];
      for(var key in model.requestedProperties) {
        var curChoice = model.requestedProperties[key];
        if(!curChoice.selected && curChoice.options.length > 0) {
          // TODO: Select which option to take more wisely
          var selectedOption = curChoice.options[0];
          curChoice.selected = selectedOption.credential;
          if(model.selectedCredentials.indexOf(
            selectedOption.credential) === -1) {
            model.selectedCredentials.push(selectedOption.credential);
          }
          updateFulfilledProperties();
        }
      }
      // Check if all requested claims in the query are fulfilled
      model.claimsPartiallyFulfillable = false;
      for(var key in model.selectedCredentials) {
        var credential = model.selectedCredentials[key];
        var claims = model.claimsForCredential(credential);
        for(key in claims) {
          var claim = claims[key];
          if(claim in model.requestedProperties) {
            model.requestedProperties[claim].fulfillable = true;
            model.claimsPartiallyFulfillable = true;
          }
        }
      }
      for(var key in model.requestedProperties) {
        var requestedProperty = model.requestedProperties[key];
        if(!requestedProperty.fulfillable) {
          model.page = 'unfulfillable';
        }
      }
    };

    model.isReplacing = function() {
      for(var key in model.selectedCredentials) {
        var credential = model.selectedCredentials[key];
        if(credential.editing) {
          return true;
        }
      }
      return false;
    };

    model.back = function() {
      if(model.isReplacing()) {
        for(var key in model.selectedCredentials) {
          var credential = model.selectedCredentials[key];
          credential.hidden = false;
          credential.editing = false;
        }
      } else {
        model.page = 'front';
      }
    };

    model.clickItem = function(credential) {
      // Mark the clicked credential editing, and hide all other credentials
      credential.hidden = false;
      credential.editing = true;
      for(var key in model.selectedCredentials) {
        var selectedCredential = model.selectedCredentials[key];
        selectedCredential.hidden = true;
      }
    };

    model.claimsForCredential = function(credential) {
      // This only pulls in claims at the top level, and does not
      // recover nested claims.
      var claims = [];
      for(var key in credential.claim) {
        if(key === 'id' || key === 'image') {
          continue;
        }
        claims.push(key);
      }
      return claims;
    };

    model.fulfillsExcessClaims = function(credential) {
      var claims = model.claimsForCredential(credential);
      var requestedClaims = Object.keys(model.requestedProperties);
      return _.difference(claims, requestedClaims);
    };

    model.replacementCredentials = function(credential) {
      var substituteCredentials = [];
      // TODO: This doesn't really handle queries that take in a specific value
      // request, because it only looks if credentials have matching keys
      // (but shouldn't the consumer be verifying the returned values anyway?)

      // Get all of the passed in credential's claims
      var claims = model.claimsForCredential(credential);
      // Filter the passed in claims that match with the properties requested
      // in the query.
      var requestedClaims = claims.filter(function(claim) {
        return jsonld.hasProperty(model.requestedProperties, claim);
      });
      // Filter through all of the user's credentials, returning those that
      // fulfill the requested claims.
      for(var key in requestedClaims) {
        var property = requestedClaims[key];
        substituteCredentials = substituteCredentials.concat(
          model.allCredentials.filter(function(substituteCredential) {
            // The credential fulfills the requested claim/
            return jsonld.hasProperty(substituteCredential.claim, property) &&
              // The credential is not already in the substitute list.
              substituteCredentials.indexOf(substituteCredential) === -1 &&
              substituteCredential !== credential;
          }));
      }
      return substituteCredentials;
    };

    model.hasReplaceableCredentials = function(credential) {
      var replaceableCredentials = model.replacementCredentials(credential);
      return replaceableCredentials.length !== 0;
    };

    model.done = function() {
      var identity = {
        '@context': CONTEXT,
        id: model.identity.id
      };
      identity.credential = _.uniq(
        _.map(model.selectedCredentials, function(credential) {
          delete credential.hidden;
          delete credential.editing;
          return {'@graph': credential};
        }));
      model.doneCallback({identity: identity});
    };

    model.labelForProperty = function(property) {
      if(!model.library.properties) {
        console.log(
          'library not loaded, failed to retrieve label for property');
        return property;
      }
      if(property in model.library.properties) {
        var propertyInfo = model.library.properties[property];
        if('label' in propertyInfo) {
          return propertyInfo.label;
        }
      }
      return property;
    };

    function init() {
      model.library = scope.library;
      model.consumerQuery = scope.consumerQuery;
      model.loading = true;
      var libraryPromise;
      if(model.library) {
        libraryPromise = Promise.resolve(model.library);
      } else {
        libraryPromise = brCredentialLibraryService.getLibrary()
          .then(function(library) {
            model.library = library;
            console.info(
              '[Identity Composer] Using default library.', model.library);
            return library;
          });
      }
      if(!model.consumerQuery) {
        console.warn('[Identity Composer] No query.');
        model.loading = false;
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
        model.processed.credentials = compacted;
        return compacted;
      });

      // compact query
      var queryPromise = jsonld.promises.compact(
        model.consumerQuery, {'@context': CONTEXT}).then(function(compacted) {
        model.processed.consumerQuery = compacted;
        return compacted;
      });

      Promise.all([libraryPromise, credentialPromise, queryPromise])
        .then(function(results) {
          var credentials = results[1];
          var query = results[2];

          model.allCredentials = credentials;

          // build choice information
          for(var property in query) {
            if(property === '@context') {
              continue;
            }
            var choice = model.requestedProperties[property] = {
              label: property,
              show: false,
              selected: null,
              optional: isOptional(query[property])
            };
            model.requestedProperties[property].label =
              model.labelForProperty(property);
            var groups = [];
            // build options for this choice
            choice.options = _.chain(credentials)
              .filter(function(credential) {
                return jsonld.hasProperty(credential.claim, property);
              })
              .map(function(credential) {
                // Pick out groups that match credential types
                var types =
                  _.flatten(jsonld.getValues(credential, 'type'));
                var credentialGroups =
                  _.values(_.pick(model.library.groups, types));
                return {
                  credential: credential,
                  credentialGroups: credentialGroups,
                  groups: groups
                };
              })
              .value();
          }
          model.prefillProperties();
        }).catch(function(err) {
          // FIXME: show on UI?
          console.error('[Identity Composer] Error:', err);
        }).then(function() {
          model.loading = false;
          $rootScope.$apply();
        });
      // FIXME: this TODO partly handled. review and update
      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it or integrate it
      // into the module instead of implementing it as a test service
    }

    function updateFulfilledProperties() {
      if(!model.requestedProperties) {
        return;
      }
      // For every selected credential, mark other choices as selected
      // if the selected credential also contains the property for the choice.
      for(var property in model.processed.consumerQuery) {
        if(property === '@context') {
          continue;
        }
        var selected = model.requestedProperties[property].selected;
        if(!selected) {
          continue;
        }
        for(var otherProperty in model.processed.consumerQuery) {
          if(otherProperty !== property &&
            jsonld.hasProperty(selected.claim, otherProperty) &&
            !model.requestedProperties[otherProperty].selected) {
            model.requestedProperties[otherProperty].selected = selected;
          }
        }
      }
      // Track if a full identity has now been composed
      model.composed = isComposed();
    }

    function isComposed() {
      return _.every(_.values(model.requestedProperties), function(choice) {
        return choice.selected;
      });
    }

    function isOptional(queryValue) {
      // TODO: I don't think we handle optional queries
      if(!angular.isObject(queryValue)) {
        return;
      }
      return queryValue['cred:isOptional'] === true;
    }
  }
}

return {brIdentityComposer: brIdentityComposer};

});
