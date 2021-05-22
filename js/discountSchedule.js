dinerApp.controller('discountScheduleModalCtrl', function ($scope, data, $uibModalInstance) {

    $scope.discount = data.discount;

    $scope.spanishDaysMap = new Map();

    $scope.spanishDaysMap.set('MONDAY', 'Lunes');
    $scope.spanishDaysMap.set('TUESDAY', 'Martes');
    $scope.spanishDaysMap.set('WEDNESDAY', 'Miercoles');
    $scope.spanishDaysMap.set('THURSDAY', 'Jueves');
    $scope.spanishDaysMap.set('FRIDAY', 'Viernes');
    $scope.spanishDaysMap.set('SATURDAY', 'Sabado');
    $scope.spanishDaysMap.set('SUNDAY', 'Domingo');
    $scope.spanishDaysMap.set('ALL', 'Todos los dias');


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
