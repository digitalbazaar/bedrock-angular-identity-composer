# bedrock-angular-identity-composer

An [AngularJS][] module that provides a widget for composing an view of
an identity from a set of credentials.

## Quick Examples

```html
<br-identity-composer ng-model="model.identity"
  br-identity-template="model.template" br-credentials="model.credentials">
</br-identity-composer>
```

TODO: Explain the problem this widget is meant to solve: a "query" or
"template" is given for a desired limited view of an identity. A set of
credentials that can fulfill that query/instantiate that view is given. The
widget can be used to compose those credentials together and it will give
hints for what's missing from the view and which credentials can be chosen
to complete it -- and what extra information (if any) will be sent along
with those credentials that wasn't requested.

## Setup

```
bower install bedrock-angular-identity-composer
```

Installation of the module followed by a restart of your [bedrock][] server is
sufficient to make the module available to your application.

To manually add **bedrock-angular-identity-composer** as a dependency:

```js
angular.module('myapp', ['bedrock.identity-composer']);
```

<!-- ## How It Works

TODO: -->


[bedrock]: https://github.com/digitalbazaar/bedrock
[bedrock-angular]: https://github.com/digitalbazaar/bedrock-angular
[bower]: http://bower.io/
[AngularJS]: https://github.com/angular/angular.js
