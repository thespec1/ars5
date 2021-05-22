dinerApp.controller("registerCtrl", function ($scope, DataService, AuthService) {
    $scope.loading = false;

    $scope.submitRegister = () => {
        const name = $scope.name;
        const surname = $scope.surname;
        const password = $scope.password;
        const phone = $scope.intlTelInput.usertel.getNumber()

        $scope.loading = true;
        AuthService.register(name, surname, password, phone)
        .then(result => {
            if (result) {
                new Android_Toast({ content: "Cuenta creada con éxito! Ya puede hacer login." })
                $scope.$parent.$parent.$emit('showPassword', {});
                $scope.$parent.$parent.$apply()
            }
            else new Android_Toast({ content: "Hubo un error en los datos... intenta de nuevo." })
        }).catch(response => {
            new Android_Toast({ content: "Hubo un error del servidor. Intenta de nuevo mas tarde." })
            console.error(response)
        }).finally(() => {
            $scope.loading = false;
        })
    }

    $scope.intlTelInput = {};

    const initializeIntlTelInput = (telInputId) => {
        $scope.intlTelInput[telInputId] = intlTelInput(document.getElementById(telInputId), {
            initialCountry: DataService.getLanguageAndRegion().isoCode,
            preferredCountries: ["ar", "uy"],
            autoHideDialCode: false,
            formatOnDisplay: true,
            separateDialCode: true
        });
    }

    initializeIntlTelInput("usertel");

    $scope.enableRegisterButton = () => {
        const inputs = [
            $scope.name,
            $scope.surname,
            $scope.password,
            $scope.intlTelInput.usertel.getNumber()
        ];

        const allValidInputs = inputs.every(input => typeof input === "string" && input.length > 2);

        return !$scope.loading && allValidInputs;
    }
});
