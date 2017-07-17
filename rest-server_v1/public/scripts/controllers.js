'use strict';

angular.module('myHelloWorld')
    .controller('HomeController', ['$rootScope', '$scope', 'AuthFactory', 'ngDialog', '$localStorage', 'TweetSearchFactory', function($rootScope, $scope, AuthFactory, ngDialog, $localStorage, TweetSearchFactory) {
        $scope.loggedIn = false;
        $scope.tweet = {};

        if (AuthFactory.isAuthenticated()) {
            $scope.loggedIn = true;
		}

        $rootScope.$on('login:Successful', function() {
            $scope.loggedIn = AuthFactory.isAuthenticated();

        });

        $rootScope.$on('logout:Successful', function() {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.tweets = [];
            $scope.tweet.tweetSearchString = '';

        });

        $scope.openLogin = function() {
            ngDialog.open({
                template: 'views/login.html',
                scope: $scope,
                className: 'ngdialog-theme-default',
                controller: "LoginController"
            });
        };


        $scope.searchTweet = function() {
            var tweets = TweetSearchFactory.findTweets($scope.tweet.tweetSearchString);
            console.log("search result for tweet " + tweets);
            $scope.myTxt = tweets;
            $scope.tweets = tweets;
           
        }

    }])

    .controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function($scope, $state, $rootScope, ngDialog, AuthFactory) {

        $scope.loggedIn = false;
        $scope.username = '';

        if (AuthFactory.isAuthenticated()) {
            $scope.loggedIn = true;
            $scope.username = AuthFactory.getUsername();
        }



        $scope.logOut = function() {
            AuthFactory.logout();
            $scope.loggedIn = false;
            $scope.username = '';
        };

        $rootScope.$on('login:Successful', function() {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });

        $rootScope.$on('registration:Successful', function() {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });

        $scope.stateis = function(curstate) {
            return $state.is(curstate);
        };

    }])

    .controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.loginData = $localStorage.getObject('userinfo', '{}');

        $scope.doLogin = function() {
            if ($scope.rememberMe)
                $localStorage.storeObject('userinfo', $scope.loginData);

            AuthFactory.login($scope.loginData);

            ngDialog.close();

        };

        $scope.openRegister = function() {
            ngDialog.open({
                template: 'views/register.html',
                scope: $scope,
                className: 'ngdialog-theme-default',
                controller: "RegisterController"
            });
        };

    }])

    .controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function($scope, ngDialog, $localStorage, AuthFactory) {

        $scope.register = {};
        $scope.loginData = {};

        $scope.doRegister = function() {
            console.log('Doing registration', $scope.registration);

            AuthFactory.register($scope.registration);

            ngDialog.close();

        };
    }]);