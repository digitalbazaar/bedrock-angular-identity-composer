/*!
 * Identity Composer.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'jsonld'], function(angular, jsonld) {

'use strict';

/* @ngInject */
function brIdentityComposer(brTestFormLibraryService) {
  return {
    restrict: 'E',
    scope: {
      allCredentials: '=brCredentialData',
      consumerQuery: '=brConsumerQuery'
    },
    /* jshint multistr: true */
    template: '\
      <ng-switch on="displaySelected"> \
        <div ng-switch-when="false"> \
          <h3>A credential consumer is requesting the following information:</h3> \
          <p> \
            Click each item and select a credential you would like to use \
            to fulfill the request. \
          </p> \
          <div class="btn-group" role="group" aria-label="..."> \
            <button \
              ng-repeat="type in consumerQuery" \
              type="button" \
              class="btn btn-default" \
              ng-click="selectType(type)" \
              value="{{ type }}"> \
                <ng-switch on="credentialMeta[type][\'selected\']"> \
                  <span ng-switch-when="-1" class="fa fa-question-circle fa-lg" \
                    aria-hidden="true"></span> \
                  <span ng-switch-default class="fa fa-check-circle fa-lg \
                    text-success"></span> \
                </ng-switch> \
                <big>{{ type }}</big> \
              </button> \
              <button \
                type="button" class="btn btn-default" \
                ng-disabled="selectionIncomplete" \
                ng-click="showSelected()"><big>Done</big></button> \
          </div> \
          <div ng-repeat="(key, credentialType) in credentialData track by key"> \
            <div ng-show="credentialMeta[key][\'show\']"> \
              <h1>{{ key }} Header</h1> \
              <div class="input-group" \
                ng-repeat="credential in credentialType.credentials track by $index"> \
                <span class="input-group-addon"> \
                  <input ng-model="credentialMeta[key][\'selected\']" \
                    type="radio" value="{{ $index }}"> \
                </span> \
                <br-form \
                  br-model="credential" \
                  br-groups="credentialType.groups" \
                  br-options="{editable: false}"></br-form> \
              </div> \
            </div> \
          </div> \
        </div> \
        <div ng-switch-when="true"> \
          <h2>This is the credential information that will be sent to the \
            credential consumer.</h2> \
          <pre>{{ selectedCredentials|json }}</pre> \
        </div> \
        </ng-switch> \
      </div>',
    link: function(scope, element, attrs) {

      scope.init = function() {
        scope.credentialMeta = {};
        scope.selectionIncomplete = true;
        scope.displaySelected = false;
        scope.selectedCredentials = [];

        for(var type in scope.consumerQuery) {
          var currentType = scope.consumerQuery[type];
          scope.credentialMeta[currentType] = {};
          scope.credentialMeta[currentType]['show'] = false;
          scope.credentialMeta[currentType]['selected'] = -1;
        };

        scope.credentialData = {};

        for(var type in scope.consumerQuery) {
          var currentType = scope.consumerQuery[type];
          scope.credentialData[currentType] = {};
          scope.credentialData[currentType]['credentials'] = [];
          scope.credentialData[currentType]['groups'] = [];
          // locate credentials that matche the query terms
          for(var credential in scope.allCredentials) {
            if(jsonld.hasProperty(
              scope.allCredentials[credential].claim,
              scope.consumerQuery[type])) {
              scope.credentialData[currentType]['credentials'].push(
                scope.allCredentials[credential]);
            }
          };
        };

        brTestFormLibraryService.getLibrary().then(function(library) {
          scope.library = library;
          for(var typedCollection in scope.credentialData) {
            var credentialTypes = [];
            for(var credential in scope
              .credentialData[typedCollection]['credentials']) {
              var currentCredential = scope
                .credentialData[typedCollection]['credentials'][credential];
              for(var credentialType in currentCredential.type) {
                if(credentialTypes.indexOf(
                  currentCredential.type[credentialType]) == -1) {
                  credentialTypes.push(
                    currentCredential.type[credentialType]
                  );
                }
              }
            }
            for(var type in credentialTypes) {
              scope.credentialData[typedCollection]['groups']
                .push(library.groups[credentialTypes[type]]);
            }
          }
          scope.$apply();
        });
      };

      scope.makeSelection = function(typeName, id) {
        var index = scope.credentialData[typeName]['credentials']
          .map(function(credential) {return credential.id;}).indexOf(id);
        scope.credentialMeta[typeName]['selected'] = index;
      };

      scope.updateSelected = function() {
        for(var type in scope.consumerQuery) {
          var typeName = scope.consumerQuery[type];
          if(angular.isDefined(scope.credentialMeta) &&
            scope.credentialMeta[typeName]['selected'] > -1) {
              var selectedCredentialIndex = scope
                .credentialMeta[typeName]['selected'];
              var selectedCredential = scope
                .credentialData[typeName]['credentials'][selectedCredentialIndex];
              for(var typeInner in scope.consumerQuery) {
                if(type !== typeInner &&
                  jsonld.hasProperty(
                    selectedCredential.claim, scope.consumerQuery[typeInner])) {
                    var typeInnerName = scope.consumerQuery[typeInner];
                    if(scope.credentialMeta[typeInnerName]['selected'] == -1) {
                      scope.makeSelection(typeInnerName, selectedCredential.id);
                    }
                }
              }
          }
        }
      };

      scope.checkAll = function() {
        for(var type in scope.credentialMeta) {
          if(scope.credentialMeta[type]['selected'] == -1 ) return true;
        }
        return false;
      };

      scope.$watch(function() { return scope.credentialMeta}, function() {
        scope.selectionIncomplete = scope.checkAll();
        scope.updateSelected();
      }, true);

      scope.$watch(function() { return scope.consumerQuery}, function() {
        scope.init();
      }, true);

      scope.hideAllCredentialTypes = function() {
        for(var typeIndex in scope.credentialMeta) {
          scope.credentialMeta[typeIndex]['show'] = false;
        }
      };

      scope.selectType = function(type) {
        scope.hideAllCredentialTypes();
        scope.credentialMeta[type]['show'] = true;
      };

      scope.showSelected = function() {
        scope.hideAllCredentialTypes();
        for(var type in scope.consumerQuery) {
          var typeName = scope.consumerQuery[type];
          var selectedCredentialIndex =
            scope.credentialMeta[typeName]['selected'];
          var selectedCredential = scope
            .credentialData[typeName]['credentials'][selectedCredentialIndex];
          var matches = scope.selectedCredentials.filter(function(credential) {
            return credential.id === selectedCredential.id;
          });
          if(matches.length === 0) {
            scope.selectedCredentials.push(selectedCredential);
          }
        }
        scope.displaySelected = true;
      };

    }  // end link
  };
}

return {brIdentityComposer: brIdentityComposer};

});
