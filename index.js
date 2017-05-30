/*!
 * Identity Composer module.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
import angular from 'angular';
import IdentityComposerComponent from './identity-composer-component.js';

var module = angular.module(
  'bedrock.identity-composer', ['bedrock.credential', 'bedrock.form',
    'bedrock.lazyCompile', 'bedrock.media-query', 'bedrock.modal',
    'ngAnimate']);

module.component('brIdentityComposer', IdentityComposerComponent);
