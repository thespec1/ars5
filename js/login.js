dinerApp.controller("loginCtrl", function ($scope, AuthService) {
    $scope.loading = false;

    $scope.goToPassword = function () {
        $scope.$parent.$emit('showPassword', {});
    }

    $scope.goToRegister = function () {
        $scope.$parent.$emit('showRegister', {});
    }

    $scope.submitEmail = () => {
        const email = $scope.email;
        $scope.loading = true;

        AuthService.mailExists(email)
        .then(result => {
            if (result) $scope.goToPassword();
            else $scope.goToRegister();
        }).catch(result => {
            let content = result.data.message;
            if (!content) content = "Hubo un error del servidor. Intenta de nuevo mas tarde."

            new Android_Toast({ content });
        }).finally(() => {
            $scope.loading = false;
            $scope.$apply()
        })
    }

    // https://stackoverflow.com/a/9204568
    $scope.validEmail = function(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    $scope.enableLoginButton = () =>
        !$scope.loading && typeof $scope.email === "string" &&
        $scope.email.length > 2 && $scope.validEmail($scope.email)
});
