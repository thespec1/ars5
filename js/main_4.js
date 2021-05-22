dinerApp.controller("dinerAuthCtrl", function ($scope, NavigationService, ScreenService, FetchService, AuthService) {
    const userLoginScreen = "/web/user/login";
    const userPasswordScreen = "/web/user/password";
    const userRegisterScreen = "/web/user/register";

    const showScreen = screen => $scope.authContent = screen;

    FetchService.getCurrentLoggedInUser();

    $scope.$on("showPassword", function (event, args) {
        event.stopPropagation();
        showScreen(userPasswordScreen);
        NavigationService.setBackButtonAction($scope.goToLogin);
        $scope.$apply();
    });

    $scope.$on("showRegister", function (event, args) {
        event.stopPropagation();
        showScreen(userRegisterScreen);
        NavigationService.setBackButtonAction($scope.goToLogin);
        $scope.$apply();
    });

    $scope.goToLogin = () => {
        showScreen(userLoginScreen);
        NavigationService.setBackButtonAction($scope.goBackToCart);
    };

    $scope.goToLogin();
});
