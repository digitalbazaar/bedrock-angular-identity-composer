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
          <div ng-repeat="(property, choice) in choices track by property"> \
            <div ng-show="choice.show"> \
              <h4>Select a credential for <strong>{{property}}</strong>:</h4> \
              <ul class="list-unstyled"> \
                <li class="br-selectable well" \
                  ng-class="{\'br-selected\': choice.selected === option.credential}" \
                  ng-repeat="option in choice.options track by $index" \
                  ng-click="choice.selected = option.credential"> \
                  <!-- TODO: replace with br-credential-thumbnail --> \
                  <div class="section"> \
                    <h3 class="headline" style="margin-top: 5px"> \
                      {{option.credential.name || \'Credential\'}} \
                      <span class="btn-group pull-right"> \
                        <button type="button" \
                          class="btn btn-default" \
                          ng-click="$event.stopPropagation(); showCredential(option)"> \
                          <i class="fa fa-trophy fa-lg"></i> \
                        </button> \
                      </span> \
                    </h3> \
                  </div> \
                  <div> \
                    <pre>{{property}}: {{option.credential.claim[property] | json}}</pre> \
                    <!-- <br-form br-lazy-compile="choice.show" \
                      br-model="option.credential.claim" \
                      br-groups="option.groups" \
                      br-options="{editable: false}"></br-form> --> \
                  </div> \
                </li> \
              </ul> \
            </div> \
          </div> \
          <!-- TODO: remove once br-credential-thumbnail is available --> \
          <stackable-modal stackable="modal.show" \
            br-lazy-compile="modal.show" \
            br-lazy-id="br-identity-composer-modal"> \
            <br-modal br-title="Credential Details"> \
              <div name="br-modal-body"> \
                <!-- TODO: replace br-form with br-credential --> \
                <br-form br-lazy-compile="modal.show" \
                  br-model="modal.credential" \
                  br-groups="modal.groups" \
                  br-options="{editable: false}"></br-form> \
              </div> \
              <div name="br-modal-footer"> \
                <button type="button" \
                  class="btn btn-default stackable-cancel">Close</button> \
              </div> \
            </br-modal> \
          </stackable-modal> \
        </div> \
      </div>',
    link: Link
  };

  function Link(scope, element, attrs) {
    scope.modal = {show: false};

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

    // TODO: remove once br-credential-thumbnail is available
    scope.showCredential = function(option) {
      scope.modal.show = true;
      scope.modal.credential = option.credential;
      scope.modal.groups = option.credentialGroups;
    };

    function init() {
      // TODO: credentials need to be compacted to appropriate context
      // either here or externally
      // TODO: consumer needs to be compacted to appropriate context, here
      // or externally

      // TODO: remove brTestFormLibraryService; only used for testing,
      // determine how to build groups without it or integrate it
      // into the module instead of implementing it as a test service
      brTestFormLibraryService.getLibrary().then(function(library) {
        scope.choices = {};
        scope.identity = null;
        scope.composed = false;
        scope.library = library;

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
          choice.options = _.chain(scope.credentials).filter(
            function(credential) {
              return jsonld.hasProperty(credential.claim, property);
            }).map(function(credential) {
              // TODO: should be handled by br-credential instead
              // pick out groups that match credential types
              var types = _.flatten(jsonld.getValues(credential, 'type'));
              var credentialGroups = _.values(_.pick(library.groups, types));
              return {
                credential: credential,
                credentialGroups: credentialGroups,
                groups: groups
              };
            }).value();
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
