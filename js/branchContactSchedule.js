dinerApp.controller('branchContactScheduleModalCtrl', function ($scope, data, $uibModalInstance) {

    $scope.branchContact = data.branchContact;

    var translationDay = { MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miercoles', THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sabado', SUNDAY: 'Domingo' };

    $scope.enums = Object.keys(translationDay);

    $scope.getViewDay = function (enumDay) {
        // let day = $scope.branchContact.deliveryConfig.workingDays.filter((day) => day.dayOfWeek == enumDay)[0];
        // if (!day) return;
        // return translationDay[day.dayOfWeek];
        return translationDay[enumDay]
    }
    $scope.workingHours = function (enumDay) {
        let day = $scope.branchContact.deliveryConfig.workingDays.filter((day) => day.dayOfWeek == enumDay)[0];
        if (!day) return ["Cerrado"];
        let workings = [];
        for (let workingHour of day.workingHours) {
            let start = new Date(workingHour.startAt);
            let end = new Date(workingHour.endAt);
            workings.push(`${getTwoDigitsNumber(start.getHours())}:${getTwoDigitsNumber(start.getMinutes())} - ${getTwoDigitsNumber(end.getHours())}:${getTwoDigitsNumber(end.getMinutes())}`.trim());
        }
        return workings;
    };

    function getTwoDigitsNumber(number) {
        return (number < 10) ? "0" + number : number;
    }

    $scope.isOpen = function () {
        return $scope.branchContact.deliveryConfig == undefined || $scope.branchContact.deliveryConfig.open;
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
