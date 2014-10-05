angular.module('vso-activity', ['ngCookies'])
    .service('activitySvc', function($http) {
        this.getVsoUrl = function getVsoUrl() {
            return $http.get('/api/get-vso-url').then(function(result) {
                return result.data.url;
            });
        };
        this.getActivity = function getActivity(author, since) {
            author = author || '';
            var url = '/api/get-activity?author=' + author;
            if (since) url += '&since=' + encodeURI(moment(since, 'MM DD YYYY').unix());
            return $http.get(url).then(function(result) {
                return result.data;
            });
        };
    })
    .service('authorFilterSvc', function() {
        this.filter = '';
    })
    .controller('activityCtrl', function(authorFilterSvc, activitySvc, $cookies) {
        var vm = this;
        vm.allActivity = [];
        vm.filterString = '';
        var date = moment().subtract(7, 'days');
        vm.filterDate = date.format('M/D/YYYY');
        vm.auth = function(token) {
            $cookies.auth_token = token;
            vm.showAuth = false;
            vm.loadActivity(vm.filterString, vm.filterDate);
        };
        vm.showAuth = !$cookies.auth_token;
        activitySvc.getVsoUrl().then(function(url) { vm.vsoUrl = url; }).catch(function() {});

        vm.loadActivity = function loadActivity(author, since) {
            activitySvc.getActivity(author, since).then(function(activity) { vm.allActivity = activity }).catch(function() {});
        };

        if (!vm.showAuth) {
            vm.loadActivity(vm.filterString, vm.filterDate);
        }
    });
