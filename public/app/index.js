angular.module('vso-activity', [])
    .service('activitySvc', function($http) {
        this.getActivity = function getActivity() {
            return $http.get('/api/get-activity/').then(function(result) {
                return result.data;
            });
        };
    })
    .service('authorFilterSvc', function() {
        this.filter = '';
    })
    .filter('authorFilter', function(authorFilterSvc) {
        return function(commits) {
            var lowerSearch = authorFilterSvc.filter.toLowerCase();
            return Object.keys(commits).map(function(key) {
                return commits[key];
            }).filter(function(commit) {
                return -1 != commit.Author.Email.toLowerCase().indexOf(lowerSearch)
                    || -1 != commit.Author.Name.toLowerCase().indexOf(lowerSearch)
                    || -1 != commit.MessageShort.toLowerCase().indexOf(lowerSearch);
            });
        };
    })
    .controller('activityCtrl', function(authorFilterSvc, activitySvc) {
        var vm = this;
        vm.allActivity = [];
        vm.filterSvc = authorFilterSvc;
        vm.authorMatch= function filterMatch(value, index) {
            console.log(arguments);
            return -1 !== item.Sha.indexOf(vm.filter);
        };
        activitySvc.getActivity().then(function(activity) { vm.allActivity = activity });
    });