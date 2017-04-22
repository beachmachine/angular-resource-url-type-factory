# Angular ResourceUrlTypeFactory

Angular ResourceUrlTypeFactory is an AngularJS library that helps you creating ui-router url matcher types that
resolve the ID component in a URL to the actual resource instance. This way you do not need to bother with fetching
the data in your controllers, redirecting to 404 pages when the fetch was unsuccessful, and dealing with all the 
permission stuff. You just have the resource instance available in your `$stateParams`.

**Note:** This library is for AngularJS 1.x only!


## Dependencies

Angular ResourceUrlTypeFactory depends on AngularJS 1.x.


## Installation

* Via `npm`: `npm install --save angular-resource-url-type-factory`
* Via `git`: `git clone git@github.com:beachmachine/angular-resource-url-type-factory.git`


## Examples

### Type definition

In the following example shows how to define a resource url type, how to use it in your route definitions, and how
to access the data in your controller. We assume we have a resource service called `MemberResourceService` defined to 
make calls to our RESTful API.

Following libraries may be helpful for you creating resource services:
* [angular-resource-factory](https://www.npmjs.com/package/angular-resource-factory): A factory build upon $resource 
  helping you to interact with RESTful APIs with advanced features as caches and data stores.
* [angular-resource](https://www.npmjs.com/package/angular-resource): A factory which creates a resource object that 
  lets you interact with RESTful server-side data sources.

To make things a bit clearer, this is the data we assume to get from our RESTful API:
````json
[
  {
    "pk": 1,
    "url": "http://example.api/member/1/",
    "creation_date": "2017-01-11T06:00:00Z",
    "last_modification_date": "2017-01-12T08:00:00Z",
    "name": "Example Member 1"
  },
  {
    "pk": 2,
    "url": "http://example.api/member/2/",
    "creation_date": "2017-01-11T06:00:00Z",
    "last_modification_date": "2017-01-12T08:00:00Z",
    "name": "Example Member 2"
  }
]
````

This is how to define the ui-router url matcher type for that resource:
````javascript
var module = angular.module('shared');

module.config(
    function (ResourceUrlTypeFactoryServiceProvider) {
        ResourceUrlTypeFactoryServiceProvider.registerType(
            'member', // name of the new type
            /\d+/, // regex to match the identifier in the URL
            'pk', // attribute name on the instance to get the identifier from
            // function (with injection pattern) that is used to fetch the instance from the RESTful API. Should return 
            // a promise, a `$resource` instance, or a regular object. `$pk` is the string from the URL matched by the
            // type definition.
            function ($pk, MemberResourceService) {
                return MemberResourceService.get({pk: $pk});
            }
        );
    }
);
````

Now we can use the defined type in our route definitions:
```javascript
var module = angular.module('app');

module.config(
    function ($stateProvider) {
        $stateProvider
            .state('member', {
                url: '/member/{mymember:member}/',
                component: 'memberView'
            });
    }
);
```

The user now can go the the path `"/member/1/"`, ResourceUrlTypeFactory fetches the data from the RESTful API, publishes
the resource instance on the `$stateParams`, and transitions to the `member` state. This is how to use the data in
your controller then:
```javascript
var module = angular.module('app');

module.component('memberView', {
    controller: 'MemberViewController'
});

module.controller('MemberViewController',
    function ($stateParams) {
        // Logs "Member name is: Example Member 1"
        console.log("Member name is: " + $stateParams.mymember.name);
    }
);
```


## Contributions

* Andreas Stocker <andreas@stocker.co.it>, Main developer


## License

Angular ResourceUrlTypeFactory,
Copyright 2016 Andreas Stocker,
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
