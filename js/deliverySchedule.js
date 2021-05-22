dinerApp.controller("deliveryScheduleModalCtrl", function ($scope, $uibModalInstance, data, DateService) {

    $scope.dates = [];
    const today = new Date();
    today.setDate(today.getDate() + 1);

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const spanishDayOfWeek = DateService.dateToSpanishDayOfWeek(date);
        const englishDayOfWeek = DateService.dayOfWeekSpanishToEnglish(spanishDayOfWeek);

        const workingDay = data.branchContact.deliveryConfig.workingDays.find(day => day.dayOfWeek === englishDayOfWeek);
        if (!workingDay) continue;

        const id = date.getDay();

        $scope.dates.push({
            id,
            date,
            label: DateService.dateToDateText(date),
            hours: []
        });

        $scope.selectedDate = $scope.dates[0];
    }

    const HALF_HOUR = 30 * 60000;
    for (const date of $scope.dates) {
        const day = data.branchContact.deliveryConfig.workingDays[date.id];

        if (!day) continue;
        date.hours = [];

        for (const hours of day.workingHours) {
            const startAt = new Date(hours.startAt);
            const endAt = new Date(hours.endAt);

            endAt.setDate(startAt.getDate());

            let startAtTime = startAt.getTime();
            let endAtTime = endAt.getTime();

            if (endAtTime < startAtTime) {
                endAtTime += 24 * 60 * 60000;
            }

            do {
                startAtTime += HALF_HOUR;
                const hour = new Date(startAtTime);
                date.hours.push({
                    hour,
                    label: DateService.dateToTimeText(hour)
                });
            } while (startAtTime + HALF_HOUR < endAtTime);
        }

        $scope.selectedTime = $scope.selectedDate.hours[0];
    }

    $scope.cancel = () => {
        $uibModalInstance.dismiss(undefined);
    };

    $scope.confirm = () => {
        DateService.copyDateInto($scope.selectedTime.hour, $scope.selectedDate.date);
        $uibModalInstance.close({date: $scope.selectedTime.hour});
    };

    $scope.$watch("selectedDate", () => {
        if (!$scope.selectedDate) return;
        $scope.selectedTime = $scope.selectedDate.hours[0];
    })
});
