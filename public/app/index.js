angular.module('vso-activity', [])
    .service('activitySvc', function($http) {
        this.getActivity = function getActivity(who) {
            return $http.get('/api/get-activity/').then(function(result) {
                console.log(result);
                return result;
            });
        };
    })
    .controller('activityCtrl', function(activitySvc) {
        var vm = this;
        vm.activity = [];
        vm.getActivity = function getActivity(who) {
            activitySvc.getActivity(who).then(function(result) {
                vm.activity = result;
            })
        }
    });