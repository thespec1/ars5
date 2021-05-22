var dinerApp = angular.module('diner', ['ui.bootstrap', 'infinite-scroll']);

dinerApp.config(function($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    })
})

dinerApp.run(["$locale", function ($locale) {
    $locale.NUMBER_FORMATS.DECIMAL_SEP = ",";
    $locale.NUMBER_FORMATS.GROUP_SEP = ".";
}]);


dinerApp.filter('decimals', function () {
    return function (input, decimals, locale) {
        // por alguna razon hay veces que input es undefined?
        if (!input) return;
        if (decimals > 0)
            return parseFloat((input).toFixed(decimals)).toLocaleString(locale);
        else
            return Math.trunc(input).toLocaleString(locale);
    };
});
