/*!
 * Identity Profile Composer.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
import angular from 'angular';
import jsonld from 'jsonld';
import _ from 'lodash';

export default {
  bindings: {
    identity: '<brIdentity',
    library: '<?brLibrary',
    onComposed: '&brOnComposed',
    query: '<brCredentialQuery'
  },
  controller: Ctrl,
  templateUrl:
    'bedrock-angular-identity-composer/identity-composer-component.html'
};

/* @ngInject */
function Ctrl($q, brCredentialLibraryService, brMediaQueryService) {
  const self = this;
  self.loading = true;
  self.selectedIndex = null;
  self.sending = false;
  self.profiles = [];
  self.profileContainerStyle = {
    width: '100vw'
  };

  // the @context for outputting profiles
  const CONTEXT = {
    '@context': [
      'https://w3id.org/identity/v1',
      'https://w3id.org/credentials/v1'
    ]
  };
  const RDF_PROPERTY = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property';
  const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
  const CRED = 'https://w3id.org/credentials#';
  const CRED_CLAIM = CRED + 'claim';
  const CRED_OPTIONAL = CRED + 'isOptional';
  const CRED_CREDENTIAL = CRED + 'credential';
  const IDENTITY = 'https://w3id.org/identity#Identity';

  self.publicAccess = {
    requested: false,
    acknowledged: false
  };

  let unregisterMediaListener;
  const credentialWidths = {
    phone: {
      select: '80vw',
      detail: '85vw'
    },
    tablet: {
      select: '25vw',
      detail: '58vw'
    },
    desktopSmall: {
      select: '20vw',
      detail: '44vw'
    },
    desktopMedium: {
      select: '20vw',
      detail: '29.5vw'
    },
    desktopLarge: {
      select: '20vw',
      detail: '20vw'
    }
  };

  self.$onInit = () => {
    brMediaQueryService.registerQuery(
      'desktopSmall', '(min-width: 980px) and (max-width: 1279px)');
    brMediaQueryService.registerQuery(
      'desktopMedium', '(min-width: 1280px) and (max-width: 1919px)');
    brMediaQueryService.registerQuery(
      'desktopLarge', '(min-width: 1920px)');

    angular.forEach(credentialWidths, (width, name) => {
      if(brMediaQueryService.isMedia(name)) {
        self.credentialWidth = width;
      }
    });

    unregisterMediaListener = brMediaQueryService.onMediaChange(
      Object.keys(credentialWidths),
      event => {
        if(event.matches) {
          self.credentialWidth = credentialWidths[event.queryName];
        }
      });
    init(self.identity);
  };

  self.$onDestroy = () => {
    unregisterMediaListener();
  };

  self.$onChanges = changes => {
    // TODO: support more granular changes; init() will perform a number of
    // updates that do not necessarily need to happen, for example, if the
    // identity changes but the library does not, then there is no need to
    // expand library properties again
    if((changes.identity && !changes.identity.isFirstChange()) ||
      (changes.library && !changes.library.isFirstChange()) ||
      (changes.query && !changes.query.isFirstChange())) {
      init(changes.identity.currentValue);
    }
  };

  self.cancel = () => {
    self.onComposed(null);
  };

  self.select = (profile, index) => {
    self.selectedIndex = index;
    self.sending = true;
    const identity = {
      '@id': self.identity.id,
      '@type': IDENTITY
    };
    identity[CRED_CREDENTIAL] = profile.credentials.map(credential => {
      return {'@graph': credential};
    });

    $q.resolve(jsonld.promises.compact(identity, CONTEXT))
      .then(profile => {
        return self.onComposed({profile: profile});
      }).catch(err => {
        // FIXME: show on UI?
        console.error('[Identity Composer] Error:', err);
      }).then(() => {
        self.sending = false;
      });
  };

  // TODO: could be improved, seems hacky
  self.scaleWidth = scale => {
    // remove the vw unit
    const width = self.credentialWidth.select.slice(0, -2);
    const scaledWidth = (scale * width).toFixed(2);
    return scaledWidth.toString() + 'vw';
  };

  self.onShowDetails = (credential, showCredential, $event) => {
    $event.stopPropagation();
    self.credential = credential;
    self.showCredentialDetails = showCredential;
  };

  function init(identity) {
    // 1. Load and compact inputs
    // 2. Make identity profile recommendations
    $q.all([
      ensureLibrary(self.library),
      compactQuery(self.query),
      compactCredentials(identity)
    ]).then(results => {
      const query = results[1];

      // TODO: Consider changing "cred:requestPublicAccess" to
      // "cred:requestPersistentAccess" with a value of "publicAccess" so we
      // can support consumers/inspectors providing their ID as a value as well
      if(jsonld.hasProperty(query, CRED + 'requestPublicAccess')) {
        self.publicAccess.requested = true;
        // FIXME: if this property is not deleted from the query, the composer
        // attempts to fulfill a request for this property
        delete query[CRED + 'requestPublicAccess'];
      }

      return compactDefinitions()
        .then(definitions => {
          return recommendProfiles(query, definitions, results[2]);
        });
    }).then(profiles => {
      // FIXME: should not need to compact, `br-credential` component should
      // handle it
      return $q.all(profiles.map(profile => {
        return $q.all(profile.credentials.map((credential, idx) => {
          return $q.resolve(jsonld.promises.compact(credential, CONTEXT))
            .then(compacted => {
              profile.credentials[idx] = compacted;
            });
        }));
      })).then(() => {
        self.profiles = profiles;
        if(self.profiles.length > 1) {
          // reduce width to account for vertical scrollbar
          self.profileContainerStyle.width = '90vw';
        }
      });
      // self.profiles = profiles;
      // console.log('profiles', profiles);
    }).catch(err => {
      // FIXME: show on UI?
      console.error('[Identity Composer] Error:', err);
    }).then(() => {
      self.loading = false;
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
      return $q.resolve(library);
    }
    // load default library
    return brCredentialLibraryService.getLibrary().then(library => {
      self.library = library;
      console.info(
        '[Identity Composer] Using default library.', library);
      return library;
    });
  }

  function compactCredentials(identity) {
    const credentials = jsonld.getValues(identity, 'credential');
    return $q.all(credentials.map(credential => {
      return $q.resolve(jsonld.promises.compact(credential['@graph'], {}));
    }));
  }

  function compactQuery(query) {
    return $q.resolve(jsonld.promises.compact(query, {}));
  }

  function compactDefinitions() {
    return $q.resolve(jsonld.promises.compact(self.library.graph, {}))
      .then(graph => {
        const definitions = {};
        angular.forEach(graph['@graph'], node => {
          // TODO: support deep query
          if(jsonld.hasValue(node, '@type', RDF_PROPERTY)) {
            definitions[node['@id']] = node;
          }
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
    for(const property in query) {
      if(property === '@context') {
        return;
      }
      const def = definitions[property] || {};
      self.requestedProperties[property] = {
        label: (RDFS_LABEL in def) ? def[RDFS_LABEL]['@value'] : property,
        show: false,
        optional: isOptional(query[property]),
        definition: def
      };
    }

    const candidates = computeCandidates(definitions, credentials);

    // no candidates, return empty set
    if(candidates.length === 0) {
      return [];
    }

    // compose identity profiles to fulfill the query
    let profiles = [];
    angular.forEach(candidates, (candidate, idx) => {
      profiles.push(computeProfile(candidate, candidates.slice(idx + 1)));
    });

    // remove any profiles with missing properties
    profiles = profiles.filter(profile => {
      return profile.missing.length === 0;
    });

    // remove any profiles that contain a superset of another profile's
    // credentials (if that other profile fulfills the query)
    profiles = profiles.filter(profile => {
      for(let i = 0; i < profiles.length; ++i) {
        const other = profiles[i];
        if(profile === other ||
          other.credentials.length >= profile.credentials.length) {
          continue;
        }
        // get what's in common between this profile and the other
        const intersection = _.intersection(
          profile.credentials, other.credentials);
        // if there's something in common -- and it's the entire other
        // profile, then drop this one as it provides more credentials
        // than are necessary to fulfill the request
        if(intersection.length > 0 &&
          _.difference(other.credentials, intersection).length === 0) {
          return false;
        }
      }
      return true;
    });

    // sort profiles by preferred selection
    return profiles.sort(compareProperties);
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
    const requested = Object.keys(self.requestedProperties);
    if(requested.length === 0) {
      // nothing requested by query
      return [];
    }

    // build candidates list by computing superfluous and missing properties
    const candidates = credentials.map(credential => {
      const claim = jsonld.getValues(credential, CRED_CLAIM)[0];
      const claimed = Object.keys(claim).filter(property => {
        return property !== '@id';
      });

      // build candidate info
      const info = {credential: credential, missing: null, superfluous: {}};
      info.provides = _.intersection(requested, claimed);
      info.missing = _.difference(requested, info.provides);
      info.superfluous.total = _.difference(claimed, info.provides);
      info.superfluous.sensitive = info.superfluous.total.filter(p => {
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
    return candidates.sort(compareProperties);
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
    const profile = {
      credentials: [candidate.credential],
      missing: _.clone(candidate.missing),
      superfluous: _.cloneDeep(candidate.superfluous)
    };

    // TODO: consider self.requestedProperties[property].optional

    // candidate fulfills query on its own
    if(profile.missing.length === 0) {
      return profile;
    }

    // for each missing property, find another candidate that can provide it
    angular.forEach(candidate.missing, p => {
      for(let i = 0; profile.missing.indexOf(p) !== -1 &&
        i < others.length; ++i) {
        // TODO: consider overlapping properties provided by other credentials
        // in the set and whether they have the same value or not
        const other = others[i];
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

  function compareProperties(a, b) {
    // 1. by number of highly sensitive superfluous properties
    let d = a.superfluous.sensitive.length - b.superfluous.sensitive.length;
    if(d !== 0) {
      return d;
    }
    // 2. by number of superfluous properties
    d = a.superfluous.total.length - b.superfluous.total.length;
    if(d !== 0) {
      return d;
    }
    // 3. by number of missing properties
    d = a.missing.length - b.missing.length;
    if(d !== 0 || !('credentials' in a)) {
      return d;
    }
    // 4. by number of credentials
    return a.credentials.length - b.credentials.length;
  }

  function isOptional(queryValue) {
    if(!angular.isObject(queryValue) ||
      !angular.isObject(queryValue[CRED_OPTIONAL])) {
      return false;
    }
    return queryValue[CRED_OPTIONAL]['@value'] === true;
  }
}
