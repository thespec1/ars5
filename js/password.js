dinerApp.controller("passwordCtrl", function ($scope, $timeout, AuthService) {
    $scope.email = AuthService.getCleanEmail()
    $scope.loading = false;
    $scope.loadingEmail = false;
    $scope.emailSent = false;


    $scope.loginWithPassword = () => {
        $scope.loading = true;
        AuthService.loginWithPassword($scope.password, $scope.email)
        .then(result => {
            if (result) {
                AuthService.init();
                new Android_Toast({ content: "Login exitoso!" });
                $scope.$emit("showCart", {});
                $scope.$parent.$parent.$apply();
            }
            else {
                new Android_Toast({ content: "Hubo un error en los datos... intenta de nuevo." });
            }
        }).catch(response => {
            new Android_Toast({ content: "Hubo un error del servidor. Intenta de nuevo mas tarde." });
            console.error(response);
        }).finally(() => {
            $scope.loading = false;
            $scope.$apply()
        })
    }

    $scope.loginWithEmail = () => {
        $scope.loadingEmail = true;
        AuthService.loginWithEmail($scope.email)
            .then(() => {
                $scope.emailSent = true;
                $timeout(() => {
                    $scope.loadingEmail = false;
                    $scope.emailSent = false;
                }, 1000 * 60)
            }).catch(() => {
                new Android_Toast({ content: "Hubo un error del servidor. Intenta de nuevo mas tarde." });
                $scope.loadingEmail = false;
            }).finally(() => {
                $scope.$apply()
            })
    }

    $scope.enablePasswordLoginButton = () => !$scope.loading && typeof $scope.password === "string" && $scope.password.length > 2
    $scope.enableEmailLoginButton = () => !$scope.loadingEmail && !$scope.emailSent
});
