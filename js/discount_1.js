dinerApp.controller("discountCtrl", function ($scope, MenuService, ModalService, NavigationService, DiscountService, ScreenService, $timeout, ConfigService, DataService, OrderModesService) {

    $scope.showPrices = ConfigService.showPrices;
    $scope.discount = DiscountService.getDiscount();
    $scope.discount.plates = DiscountService.getDiscount().plates.map(plate => {
        const realPlate = MenuService.findPlateById(plate.id)
        realPlate.count = 1;
        return realPlate;
    })

    $scope.canOrder = () => OrderModesService.hasOrderMode() && DataService.isOpen(DataService.getSelectedBranchContact());

    NavigationService.setBackButtonAction(backClicked);

    $timeout(function () {
        ScreenService.setPreviousDiscountOffset();
    });

    $scope.showDiscountScheduleModal = function () {
        var data = { discount: $scope.discount };
        ModalService.openDiscountScheduleModal(data);
    };

    $scope.plateClicked = function (plate) {
        ModalService.openPlateDetailModal(plate)
        // MenuService.setPlate(plate);
        // ScreenService.savePlatesOffset();
        // $scope.$parent.$emit('plateClicked', {});
    };

    $scope.getOnlyPrice = function (plate){
        return DiscountService.getOnlyPrice(plate);
    }

    $scope.getCurrency = () =>{
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () =>{
        return DataService.getLanguageAndRegion().decimalsShow;
    }

    function backClicked() {
        $scope.$parent.$emit('discountBackClicked', {});
    }

    $scope.increaseCount = (plate) => {
        plate.count += 1;
    }

    $scope.decreaseCount = (plate) => {
        plate.count -= 1;
    }

    $scope.cantDecrease = (plate) => plate.count <= 1;
    $scope.cantIncrease = (plate) => false

    $scope.showStrikedPrice = function (plate) {
        return DiscountService.showStrikedPrice(plate);
    }
});
