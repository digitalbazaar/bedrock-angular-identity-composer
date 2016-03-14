/*!
 * Identity Credential.
 *
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Alex Lamar
 */
define(['angular', 'jsonld'], function(angular, jsonld) {

'use strict';

/* @ngInject */
function brIdentityCredential($rootScope, brCredentialLibraryService) {
  return {
    restrict: 'E',
    scope: {
      doneCallback: '&brCallback',
      credential: '=brCredential',
      selectedCredentials: '=brSelectedCredentials',
      allCredentials: '=brAllCredentials',
      query: '=brQuery',
      library: '=?brLibrary'
    },
    /* jshint multistr: true */
    templateUrl: requirejs.toUrl(
      'bedrock-angular-identity-composer/identity-credential.html'),
    link: Link
  };

  function Link(scope, element, attrs) {
    var model = scope.model = {};
    model.allCredentials = scope.allCredentials;
    model.credential = scope.credential;
    model.doneCallback = scope.doneCallback;
    model.library = scope.library;
    model.processed = {};
    model.query = scope.query;
    model.selectedCredentials = scope.selectedCredentials;

    scope.$watch(function() {return scope.library;}, init, true);

    model.claimsForCredential = function(credential) {
      // TODO: This only pulls in claims at the top level,
      //and does not recover nested claims.
      var claims = [];
      for(var key in credential.claim) {
        // TODO: Need better filtering here (probably though some kind of
        // grammar that maps claim types to a readable output), right now we're
        // just taking the first level claims w/o any of their nested properties
        if(key === 'id') {
          continue;
        }
        if(key === 'image') {
          continue;
        }
        claims.push(key);
      }
      var props = [];
      traverse(credential.claim);
      return props;

      function traverse(o) {
        for(var i in o) {
          if(typeof(o[i]) === 'object') {
            props.push(i);
            traverse(o[i]);
          } else if(!(i === 'id' || i === 'type' || i === '@value')) {
            props.push(i);
          }
        }
      }
    };

    model.replacementCredentials = function(credential) {
      var substituteCredentials = [];

      // TODO: This doesn't really handle queries that take in a specific value
      // request, because it only looks if credentials have matching keys
      // (but shouldn't the consumer be verifying the returned values anyway?).

      // Get all of the passed in credential's claims.
      var claims = model.claimsForCredential(credential);
      // Filter the passed in claims that match with the properties requested
      // in the query, minus any claims that are already fulfilled by the
      // currently selected credentials.
      var requestedClaims = claims.filter(function(claim) {
        for(var key in model.selectedCredentials) {
          var selectedCredential = model.selectedCredentials[key];
          if(selectedCredential === credential) {
            continue;
          }
          if(jsonld.hasProperty(selectedCredential.claim, claim)) {
            // Property already fulfilled
            return false;
          }
        }
        return jsonld.hasProperty(model.query, claim);
      });

      // Filter through all of the user's credentials, returning those that
      // fulfill the requested claims
      for(var key in model.allCredentials) {
        var substituteCredential = model.allCredentials[key];
        var fulfillable = true;
        for(key in requestedClaims) {
          var requestedClaim = requestedClaims[key];
          if(!(jsonld.hasProperty(substituteCredential.claim, requestedClaim) &&
              substituteCredentials.indexOf(substituteCredential) === -1 &&
              substituteCredential !== credential)) {
            fulfillable = false;
          }
        }
        if(fulfillable) {
          substituteCredentials.push(substituteCredential);
        }
      }
      return substituteCredentials;
    };

    model.getCredentialsToReplace = function(credential) {
      // This differs from the above replacementCredentials() in that it
      // returns the credential that the given credential will replace if
      // selected, whereas replacementCredentials() gives all possible
      // credentials that can replace the given credential

      // Right now this function should only return a single credential,
      // but we might want to extend it so that a credential can replace
      // multiple selected credentials.

      var replaceableCredentials = [];

      // Filter the credential's claims that match with the properties
      // requested in the query.
      var claims =
        filterClaimsByQuery(model.claimsForCredential(credential), model.query);
      // Build the replaceable list with the currently selected credentials
      // that can be fully fulfilled by the given claims.
      for(var key in model.selectedCredentials) {
        var selectedCredential = model.selectedCredentials[key];
        var claimsToFulfill = filterClaimsByQuery(
          model.claimsForCredential(selectedCredential), model.query);
        // Filter out claims that are already fulfilled by
        // other selected credentials.
        claimsToFulfill = claimsToFulfill.filter(function(claim) {
          for(key in model.selectedCredentials) {
            var otherCredential = model.selectedCredentials[key];
            if(otherCredential === selectedCredential) {
              continue;
            }
            if(jsonld.hasProperty(otherCredential.claim, claim)) {
              return false;
            }
          }
          return true;
        });
        if(claimsToFulfill.length === 0) {
          continue;
        }
        var fulfilled = true;
        for(key in claimsToFulfill) {
          if(claims.indexOf(claimsToFulfill[key]) === -1) {
            // The claim is not in the credential that we're trying to
            // replace it with.
            fulfilled = false;
            break;
          }
        }
        if(fulfilled) {
          replaceableCredentials.push(selectedCredential);
        }
      }
      return replaceableCredentials;
    };

    model.isReplaceable = function(credential) {
      var replaceableCredentials = model.replacementCredentials(credential);
      return replaceableCredentials.length !== 0;
    };

    model.replacementCredentialClicked = function(replacementCredential) {
      model.useReplacementCredential(replacementCredential);
      for(var key in model.allCredentials) {
        var credential = model.allCredentials[key];
        credential.hidden = false;
        credential.editing = false;
      }
    };

    model.useReplacementCredential = function(replacementCredential) {
      var replaceableCredentials =
        model.getCredentialsToReplace(replacementCredential);
      for(var key in replaceableCredentials) {
        var credential = replaceableCredentials[key];
        var index = model.selectedCredentials.indexOf(credential);
        if(index !== -1) {
          model.selectedCredentials.splice(index, 1);
        } else {
          // TODO: Should replace with error and appropriate handling.
          console.log('Expecting to replace a credential ' +
                      'that is not selected, this is unexpecteed');
        }
      }
      model.selectedCredentials.push(replacementCredential);
    };

    model.clickItem = function(credential) {
      // Mark the clicked credential editing, and hide all other credentials.
      credential.hidden = false;
      credential.editing = true;
      for(var key in model.selectedCredentials) {
        var selectedCredential = model.selectedCredentials[key];
        if(selectedCredential.name === credential.name) {
          continue;
        }
        selectedCredential.hidden = true;
      }
    };

    function init() {
      model.loading = true;
      model.processed = {};
      model.requestedProperties = {};
      model.output = null;
      model.composed = false;
      model.library = scope.library;

      var libraryPromise;
      if(model.library) {
        libraryPromise = Promise.resolve(model.library);
      } else {
        libraryPromise = brCredentialLibraryService.getLibrary()
          .then(function(library) {
            model.library = library;
            console.info(
              '[Identity Composer] Using default library.', model.library);
          });
      }

      Promise.all([libraryPromise])
        .catch(function(err) {
          // FIXME: show on UI?
          console.error('[Identity Composer] Error:', err);
        }).then(function() {
          console.log('loaded');
          model.loading = false;
          $rootScope.$apply();
        });

      // FIXME: this TODO partly handled. review and update
      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it or integrate it
      // into the module instead of implementing it as a test service
    }

    function filterClaimsByQuery(claims, query) {
      return claims.filter(function(claim) {
        return jsonld.hasProperty(query, claim);
      });
    }
  }
}

return {brIdentityCredential: brIdentityCredential};

});
