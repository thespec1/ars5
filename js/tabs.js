dinerApp.controller("tabsCtrl", function ($rootScope, $scope, $timeout, ScreenService, CartFactory, NavigationService) {

    $scope.tabContent = ScreenService.getLastTabState();
    if ($scope.tabContent == undefined) $scope.tabContent = "/web/menu";

    // $("#tabScreen").css("height", $("#tabScreen").parent().height());
    // $("#tabContent").css("height", $("#tabScreen").parent().parent().height() - $("#tabs").height());

    $scope.$on("showMainCart", function () {
        $scope.selectTab("/web/mainCart");
    });

    // this event is a bit of a mess so i want to explain it:
    // to go to the login view we need to tell the cart view, which needs its controller instantiated
    // if we are already in the cart view this is easy, just broadcast the event
    // if we are not, we need to first go to the cart view, wait until it loads and then broadcast
    // we use a zero-timeout to make sure it is the last thing it does after the tab is loaded
    // and we deregister the event as soon as we are sure we're on the right page
    $scope.$on("showAuthThroughMainCart", function () {
        if ($scope.tabContent === "/web/mainCart") {
            $scope.$broadcast("showAuth");
        } else {
            $scope.selectTab("/web/mainCart");
            const deregister = $rootScope.$on("$includeContentLoaded", function(event, template) {
                if (template === "/web/cart") {
                    deregister();
                    $timeout(() => $scope.$broadcast("showAuth"));
                }
            })
        }
    });

    $scope.$on("showMainMenu", function () {
        $scope.selectTab("/web/menu");
        NavigationService.unhideBackButton();
    });

    $scope.selectTab = function (route) {
        if (route === "/web/menu") {
            NavigationService.unhideBackButton();
        }

        $scope.lastContent = $scope.tabContent;
        if ($scope.tabContent === "/web/menu" && route === "/web/menu") {
            $scope.$broadcast("backToDefaultMenu");
        } else {
            $scope.tabContent = route;
        }
    };

    $scope.$on("$destroy", function () {
        ScreenService.saveTabsState($scope.tabContent);
    });


    $scope.cartItemsAmount = () => {
        return CartFactory.getCart().length;
    };

    $scope.cartHasItems = () => {
        return $scope.cartItemsAmount() > 0;
    };
});
