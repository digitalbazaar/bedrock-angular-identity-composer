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
function brIdentityComposer(brTestFormLibraryService) {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      credentials: '=brCredentials',
      consumerQuery: '=brConsumerQuery',
      identity: '=ngModel'
    },
    /* jshint multistr: true */
    template: '\
      <div> \
        <div ng-if="identity"> \
          <h2>This is the credential information that will be sent to the \
            credential consumer.</h2> \
          <pre>{{identity | json}}</pre> \
        </div> \
        <div ng-if="!identity"> \
          <h3>A credential consumer is requesting the following information:</h3> \
          <p> \
            Click each item and select a credential you would like to use \
            to fulfill the request. \
          </p> \
          <div class="btn-group" role="group"> \
            <button ng-repeat="(property, value) in consumerQuery" \
              type="button" class="btn btn-default" \
              ng-click="showChoice(property)"> \
              <span ng-if="!choices[property].selected" \
                class="fa fa-question-circle"></span> \
              <span ng-if="choices[property].selected" \
                class="fa fa-check-circle text-success"></span> \
              {{property}} \
            </button> \
            <button \
              type="button" class="btn btn-default" \
              ng-disabled="!composed" \
              ng-click="showIdentity()">Done</button> \
          </div> \
          <div ng-repeat="(key, choice) in choices track by key"> \
            <div ng-show="choice.show"> \
              <h4>Select a credential for <strong>{{key}}</strong>:</h4> \
              <ul class="list-unstyled"> \
                <li class="br-credential-hover well" \
                  ng-class="{\'br-credential-selected\': choice.selected === credential}" \
                  ng-repeat="credential in choice.credentials track by $index" \
                  ng-click="choice.selected = credential"> \
                  <br-form br-lazy-compile="choice.show" \
                    br-model="credential" \
                    br-groups="choice.groups" \
                    br-options="{editable: false}"></br-form> \
                </li> \
              </ul> \
            </div> \
          </div> \
        </div> \
      </div>',
    link: Link
  };

  function Link(scope, element, attrs) {
    scope.$watch(function() {return scope.consumerQuery}, function() {
      if(scope.consumerQuery) {
        init();
      }
    }, true);

    scope.$watch(function() {return scope.choices}, function() {
      if(scope.choices) {
        updateChoices();
      }
    }, true);

    scope.showChoice = function(property) {
      hideAllChoices();
      scope.choices[property].show = true;
    };

    scope.showIdentity = function() {
      hideAllChoices();
      // TODO: add identity `id` and context
      scope.identity = {};
      scope.identity.credentials = _.uniq(
        _.map(scope.choices, function(choice) {
          return choice.selected;
        }));
    };

    function init() {
      // TODO: credentials need to be compacted to appropriate context
      // either here or externally
      // TODO: consumer needs to be compacted to appropriate context, here
      // or externally

      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it
      brTestFormLibraryService.getLibrary().then(function(library) {
        scope.choices = {};
        scope.identity = null;
        scope.composed = false;
        scope.library = library;

        // build choice information
        for(var property in scope.consumerQuery) {
          var info = scope.choices[property] = {
            show: false,
            selected: null
          };
          // filter credentials that match the query property
          info.credentials = scope.credentials.filter(function(credential) {
            return jsonld.hasProperty(credential.claim, property);
          });
          // pick out groups that match credential types
          var types = _.flatten(_.map(info.credentials, function(credential) {
            return jsonld.getValues(credential, 'type');
          }));
          info.groups = _.values(_.pick(library.groups, types));
        }

        scope.$apply();
      });
    }

    function updateChoices() {
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
