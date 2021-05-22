dinerApp.controller("mainCartCtrl", function ($scope, NavigationService, AuthService) {
    const cartScreen = '/web/cart'
    const checkoutScreen = '/web/checkout'
    const userAuthScreen = '/web/user/auth';

    $scope.cartContent = cartScreen;

    $scope.$on("showCart", function (event, args) {
        event.stopPropagation();
        $scope.cartContent = cartScreen;
        NavigationService.hideBackButton();
    })

    $scope.$on("showCheckOut", function (event, args) {
        event.stopPropagation();
        $scope.cartContent = checkoutScreen;
        NavigationService.setBackButtonAction(goBackToCart);
    });

    $scope.$on("showAuth", function (event, args) {
        if (event.stopPropagation) event.stopPropagation();
        $scope.cartContent = userAuthScreen
        NavigationService.setBackButtonAction(goBackToCart)
    })

    $scope.goToAuth = () => {
        $scope.cartContent = userAuthScreen
        NavigationService.setBackButtonAction(goBackToCart)
    }

    $scope.goBackToCart = goBackToCart;

    function goBackToCart() {
        $scope.cartContent = cartScreen;
        NavigationService.hideBackButton();
    }


});
