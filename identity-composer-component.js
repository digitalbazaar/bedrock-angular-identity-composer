/*!
 * Identity Composer.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'jsonld', 'lodash'], function(angular, jsonld, _) {

'use strict';

function register(module) {
  // TODO: rename to `brProfileComposer` or `brIdentityProfileComposer`?
  module.component('brIdentityComposer', {
    bindings: {
      identity: '<brIdentity',
      library: '<?brLibrary',
      onComposed: '&brOnComposed',
      query: '<brCredentialQuery'
    },
    controller: Ctrl,
    templateUrl: requirejs.toUrl(
      'bedrock-angular-identity-composer/identity-composer-component.html')
  });
}

/* @ngInject */
function Ctrl($scope, brCredentialLibraryService) {
  var self = this;
  self.loading = true;
  self.profiles = [];

  // the @context this component is coded to
  var CONTEXT = {
    '@context': [
      'https://w3id.org/identity/v1',
      'https://w3id.org/credentials/v1'
    ]
  };

  self.publicAccess = {
    requested: false,
    acknowledged: false
  };

  /*var mockCredential = {"@context":["https://w3id.org/identity/v1","https://w3id.org/credentials/v1"],"id":"https://authorization.dev:33443/issuer/credentials/1473862731352","type":["Credential","urn:bedrock:test:PassportCredentia"],"image":"http://simpleicon.com/wp-content/uploads/global_1-128x128.png","name":"Passport","claim":{"id":"did:40b16795-73a6-446e-b06d-767087241f24","address":{"type":"PostalAddress","addressCountry":"US","addressLocality":"Blacksburg","addressRegion":"Virginia","postalCode":"24060","streetAddress":"1 Main St."},"schema:birthDate":{"type":"xsd:dateTime","@value":"1980-01-01T00:00:00Z"},"schema:gender":"female","schema:height":"65in","image":"http://simpleicon.com/wp-content/uploads/business-woman-2-128x128.png","name":"Pat Doe","schema:nationality":{"name":"United States"},"urn:bedrock:test:eyeColor":"blue","urn:bedrock:test:passport":{"type":"urn:bedrock:test:Passport","name":"Test Passport","issued":"2010-01-07T01:02:03Z","issuer":"https://example.gov/","expires":"2020-01-07T01:02:03Z","urn:bedrock:test:documentId":"1473862731352"}},"issued":"2016-09-14T14:18:51.352Z","issuer":"urn:issuer:test","signature":{"type":"GraphSignature2012","created":"2016-09-14T14:18:51Z","creator":"https://authorization.dev:33443/issuer/keys/1","signatureValue":"Dex6kqi8fZHbyHkscPcLz2gFvaWBUET5ZkjHN+SJNY2Rq7UfcQ0oOwI2A0NUOA7hivGszFszxbEaEloaUDyzrg=="}};
  self.identity = {
    @context: CONTEXT,
    id: mockCredential.claim.id,
    credential: []
  };
  for(var i = 0; i < 4; ++i) {
    var copy = _.deepClone(mockCredential);
    copy.id += '' + i;
    self.identity.credential.push({'@graph': copy);
  }*/

  self.$onInit = function() {
    init(self.identity);
  };

  self.$onChanges = function(changes) {
    // TODO: support more granular changes; init() will perform a number of
    // updates that do not necessarily need to happen, for example, if the
    // identity changes but the library does not, then there is no need to
    // compact library properties again
    if((changes.identity && !changes.identity.isFirstChange()) ||
      (changes.library && !changes.library.isFirstChange()) ||
      (changes.query && !changes.query.isFirstChange())) {
      init(changes.identity.currentValue);
    }
  };

  self.select = function(profile) {
    var identity = {
      '@context': CONTEXT,
      id: self.identity.id
    };
    identity.credential = profile.credentials.map(function(credential) {
      return {'@graph': credential};
    });
    self.onComposed(identity);
  };

  self.labelForProperty = function(property) {
    var def = self.library.properties[property];
    if(def && 'label' in def) {
      return def.label;
    }
    return property;
  };

  function init(identity) {
    self.loading = true;

    // 1. Load and compact inputs
    // 2. Make identity profile recommendations
    Promise.all([
      ensureLibrary(self.library),
      compactQuery(self.query),
      compactCredentials(identity),
    ]).then(function(results) {
      var query = results[1];

      // TODO: Consider changing "cred:requestPublicAccess" to
      // "cred:requestPersistentAccess" with a value of "publicAccess" so we
      // can support consumers/inspectors providing their ID as a value as well
      if(jsonld.hasProperty(query, 'cred:requestPublicAccess')) {
        self.publicAccess.requested = true;
        // FIXME: if this property is not deleted from the query, the composer
        // attempts to fulfill a request for this property
        delete query['cred:requestPublicAccess'];
      }

      return compactDefinitions()
        .then(function(definitions) {
          return recommendProfiles(query, definitions, results[2]);
        });
    }).then(function(profiles) {
      self.profiles = profiles;
    }).catch(function(err) {
      // FIXME: show on UI?
      console.error('[Identity Composer] Error:', err);
    }).then(function() {
      self.loading = false;
      $scope.$apply();
    });
  }

  /**
   * Ensures a vocabulary library is loaded. This library contains information
   * like labels for properties requested in the credential query. If no
   * library is specified, the application's default library is loaded.
   *
   * @param library the library to ensure is loaded.
   *
   * @return a Promise that resolves once the library is available.
   */
  function ensureLibrary(library) {
    if(library) {
      return Promise.resolve(library);
    }
    // load default library
    return brCredentialLibraryService.getLibrary().then(function(library) {
      self.library = library;
      console.info(
        '[Identity Composer] Using default library.', model.library);
      return library;
    });
  }

  function compactCredentials(identity) {
    // FIXME: frame identity and frame credentials or can we assume
    //   the backend has performed this already?
    var credentials = jsonld.getValues(identity, 'credential');
    return Promise.all(credentials.map(function(credential) {
      return jsonld.promises.compact(credential['@graph'], CONTEXT);
    }));
  }

  function compactQuery(query) {
    return jsonld.promises.compact(query, CONTEXT);
  }

  function compactDefinitions() {
    return jsonld.promises.compact(self.library.graph, CONTEXT)
      .then(function(graph) {
        var definitions = {};
        angular.forEach(graph['@graph'], function(node) {
          // TODO: support deep query
          definitions[node.id] = node;
        });
        return definitions;
      });
  }

  /**
   * Composes a recommended list of identity profiles containing credentials
   * to fulfill the credential query based on a number of simple rules:
   *
   * 1. Prefer credentials that reveal the fewest highly sensitive, superfluous
   *   (not requested) properties. Some properties are more sensitive than
   *   others.
   * 2. Prefer credentials that provide the fewest superfluous (not requested)
   *   properties.
   * 3. Prefer fewest number of credentials.
   *
   * @param query the compacted credential query.
   * @param definitions the compacted property definitions indexed by property.
   * @param credentials the compacted credentials.
   *
   * @return a sorted list of recommended identity profiles.
   */
  function recommendProfiles(query, definitions, credentials) {
    self.requestedProperties = {};

    // TODO: support deep queries
    // TODO: support optional requested properties vs. required ones
    //   (current algorithm assumes all are required)

    // build requested properties map
    angular.forEach(query, function(property) {
      if(property === '@context') {
        return;
      }
      var def = definitions[property] || {};
      self.requestedProperties[property] = {
        label: ('label' in def) ? def.label : property,
        show: false,
        optional: isOptional(query[property]),
        definition: def
      };
    });

    var candidates = computeCandidates(definitions, credentials);

    // no candidates, return empty set
    if(candidates.length === 0) {
      return [];
    }

    // compose identity profiles to fulfill the query
    var profiles = [];
    angular.forEach(candidates, function(candidate, idx) {
      profiles.concat(computeProfile(candidate, candidates.slice(idx + 1)));
    });
    return profiles;
  }

  /**
   * Build a sorted list of candidate meta data for credentials that can be
   * used to fulfill or partially fulfill the credential query. The meta
   * data will include information such as which properties from the query
   * are provided by particular credentials and which properties from
   * the credentials are superfluous (including their degree of sensitivity).
   *
   * This sorted array of meta data can be used to iteratively build
   * recommended identity profiles (containing sets of credentials) to
   * fulfill a query. The sort order prefers revealing the least amount
   * of information.
   *
   * TODO: Some  selective disclosure signature mechanisms would remove
   * the need to test for superfluous properties as they would simply not
   * be disclosed.
   *
   * @param definitions the property definitions to use to determine
   *          property privacy sensitivity levels.
   * @param credentials the credentials that can be used to fulfill or
   *          partially fulfill the query.
   *
   * @return a sorted array of candidate meta data.
   */
  function computeCandidates(definitions, credentials) {
    var requested = Object.keys(self.requestedProperties);
    if(requested.length === 0) {
      // nothing requested by query
      return [];
    }

    // build candidates list by computing superfluous and missing properties
    var candidates = credentials.map(function(credential) {
      var claim = jsonld.getValues(credential, 'claim')[0];
      var claimed = Object.keys(claim).filter(function(property) {
        return property !== 'id';
      });

      // build candidate info
      var info = {credential: credential, missing: null, superfluous: {}};
      info.provides = _.intersection(requested, claimed);
      info.missing = _.difference(requested, info.provides);
      info.superfluous.total = _.difference(claimed, info.provides);
      info.superfluous.sensitive = info.superfluous.total.filter(function(p) {
        if(!(p in definitions)) {
          // unknown properties are marked as insensitive
          return false;
        }
        // TODO: include some measure of privacy sensitivity in
        // property definitions
        // return definitions.p.privacySensitivityLevel > x;
        return false;
      });

      return info;
    });

    // sort candidates by preferred selection
    return candidates.sort(function(a, b) {
      // 1. by number of highly sensitive superfluous properties
      var d = a.superfluous.sensitive.length - b.superfluous.sensitive.length;
      if(d !== 0) {
        return d;
      }
      // 2. by number of superfluous properties
      d = a.superfluous.total.length - b.superfluous.total.length;
      if(d !== 0) {
        return d;
      }
      // 3. by number of missing properties
      return a.missing.length - b.missing.length;
    });
  }

  /**
   * Computes an identity profile that contains the credential for the given
   * candidate and any other credentials that are required to, as best as
   * possible, fulfill the query. The profile will be constructed with a
   * preference for the least number of superfluous highly sensitive and
   * otherwise properties.
   *
   * @param candidate the candidate to include in the profile.
   * @param others other candidates that may need to be included in the
   *          profile to fulfill the query, sorted in preferred privacy order.
   *
   * @return the computed identity profile.
   */
  function computeProfile(candidate, others) {
    var profile = {
      credentials: [candidate.credential],
      missing: _.clone(candidate.missing),
      superflous: _.deepClone(candidate.superfluous)
    };

    // TODO: consider self.requestedProperties[property].optional

    // candidate fulfills query on its own
    if(candidate.missing === 0) {
      return [profile];
    }

    // for each missing property, find another candidate that can provide it
    angular.forEach(candidate.missing, function(p) {
      for(var i = 0; i < others.length; ++i) {
        // TODO: consider overlapping properties provided by other credentials
        // in the set and whether they have the same value or not
        var other = others[i];
        if(other.provides.indexOf(p) !== -1) {
          profile.credentials.push(other.credential);
          profile.missing = _.difference(profile.missing, other.provides);
          profile.superfluous.total = _.union(
            profile.superfluous.total, other.superfluous.total);
          profile.superfluous.sensitive = _.union(
            profile.superfluous.sensitive, other.superfluous.sensitive);
          break;
        }
      }
    });

    return profile;
  }

  function isOptional(queryValue) {
    if(!angular.isObject(queryValue)) {
      return;
    }
    return queryValue['cred:isOptional'] === true;
  }
}

return register;

});
