angular.module('vso-activity', [])
    .service('activitySvc', function($http) {
        this.getActivity = function getActivity() {
            return $http.get('/api/get-activity/').then(function(result) {
                console.log(result.data);
                return result.data;
            });
        };
    })
    .controller('activityCtrl', function(activitySvc) {
        var vm = this;
        vm.allActivity = [];
        activitySvc.getActivity().then(function(activity) { console.log(activity); vm.allActivity = activity });
    });