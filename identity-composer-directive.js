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
      credentials: '=brCredentials',
      consumerQuery: '=brConsumerQuery'
    },
    /* jshint multistr: true */
    template: '\
      <div> \
        <div ng-if="displaySelected"> \
          <h2>This is the credential information that will be sent to the \
            credential consumer.</h2> \
          <pre>{{selectedCredentials | json}}</pre> \
        </div> \
        <div ng-if="!displaySelected"> \
          <h3>A credential consumer is requesting the following information:</h3> \
          <p> \
            Click each item and select a credential you would like to use \
            to fulfill the request. \
          </p> \
          <div class="btn-group" role="group"> \
            <button ng-repeat="(property, value) in consumerQuery" \
              type="button" class="btn btn-default" \
              ng-click="selectType(property)"> \
              <span ng-if="credentialMeta[property].selected === -1" \
                class="fa fa-question-circle"></span> \
              <span ng-if="credentialMeta[property].selected !== -1" \
                class="fa fa-check-circle text-success"></span> \
              {{property}} \
            </button> \
            <button \
              type="button" class="btn btn-default" \
              ng-disabled="selectionIncomplete" \
              ng-click="showSelected()">Done</button> \
          </div> \
          <div ng-repeat="(key, credentialType) in credentialData track by key"> \
            <div ng-show="credentialMeta[key].show"> \
              <h1>{{key}} Header</h1> \
              <div class="input-group" \
                ng-repeat="credential in credentialType.credentials track by $index"> \
                <span class="input-group-addon"> \
                  <input ng-model="credentialMeta[key].selected" \
                    type="radio" value="{{$index}}"> \
                </span> \
                <br-form \
                  br-model="credential" \
                  br-groups="credentialType.groups" \
                  br-options="{editable: false}"></br-form> \
              </div> \
            </div> \
          </div> \
        </div> \
      </div>',
    link: Link
  };

  function Link(scope, element, attrs) {
    scope.init = function() {
      scope.credentialMeta = {};
      scope.selectionIncomplete = true;
      scope.displaySelected = false;
      scope.selectedCredentials = [];
      scope.credentialData = {};

      for(var property in scope.consumerQuery) {
        scope.credentialMeta[property] = {};
        scope.credentialMeta[property].show = false;
        scope.credentialMeta[property].selected = -1;

        scope.credentialData[property] = {};
        scope.credentialData[property].credentials = [];
        scope.credentialData[property].groups = [];
        // locate credentials that match the query terms
        scope.credentials.forEach(function(credential) {
          if(jsonld.hasProperty(credential.claim, property)) {
            scope.credentialData[property].credentials.push(credential);
          }
        });
      }

      // TODO: remove brTestFormLibraryService; only used for testing
      brTestFormLibraryService.getLibrary().then(function(library) {
        scope.library = library;
        for(var property in scope.credentialData) {
          var credentialTypes = [];
          scope.credentialData[property].credentials.forEach(
            function(credential) {
            jsonld.getValues(credential, 'type').forEach(function(type) {
              if(credentialTypes.indexOf(type) === -1) {
                credentialTypes.push(type);
              }
            });
          });
          for(var type in credentialTypes) {
            var group = library.groups[credentialTypes[type]];
            if(group) {
              scope.credentialData[property].groups.push(group);
            }
          }
        }
        scope.$apply();
      });
    };

    scope.makeSelection = function(typeName, id) {
      var index = scope.credentialData[typeName].credentials
        .map(function(credential) {return credential.id;}).indexOf(id);
      scope.credentialMeta[typeName].selected = index;
    };

    scope.updateSelected = function() {
      for(var property in scope.consumerQuery) {
        if(angular.isDefined(scope.credentialMeta) &&
          scope.credentialMeta[property].selected > -1) {
          var selectedCredentialIndex = scope
            .credentialMeta[property].selected;
          var selectedCredential = scope
            .credentialData[property].credentials[selectedCredentialIndex];
          for(var propertyInner in scope.consumerQuery) {
            if(property !== propertyInner &&
              jsonld.hasProperty(selectedCredential.claim, propertyInner)) {
              if(scope.credentialMeta[propertyInner].selected == -1) {
                scope.makeSelection(propertyInner, selectedCredential.id);
              }
            }
          }
        }
      }
    };

    scope.checkAll = function() {
      for(var type in scope.credentialMeta) {
        if(scope.credentialMeta[type].selected === -1 ) {
          return true;
        }
      }
      return false;
    };

    scope.$watch(function() {return scope.credentialMeta}, function() {
      scope.selectionIncomplete = scope.checkAll();
      scope.updateSelected();
    }, true);

    scope.$watch(function() {return scope.consumerQuery}, function() {
      scope.init();
    }, true);

    scope.hideAllCredentialTypes = function() {
      for(var typeIndex in scope.credentialMeta) {
        scope.credentialMeta[typeIndex].show = false;
      }
    };

    scope.selectType = function(type) {
      scope.hideAllCredentialTypes();
      scope.credentialMeta[type].show = true;
    };

    scope.showSelected = function() {
      scope.hideAllCredentialTypes();
      for(var property in scope.consumerQuery) {
        var selectedCredentialIndex =
          scope.credentialMeta[property].selected;
        var selectedCredential = scope
          .credentialData[property].credentials[selectedCredentialIndex];
        var matches = scope.selectedCredentials.filter(function(credential) {
          return credential.id === selectedCredential.id;
        });
        if(matches.length === 0) {
          scope.selectedCredentials.push(selectedCredential);
        }
      }
      scope.displaySelected = true;
    };
  }
}

return {brIdentityComposer: brIdentityComposer};

});
