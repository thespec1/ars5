dinerApp.controller("platesCtrl", function ($scope, MenuService, ScreenService, $timeout, DiscountService, ConfigService, DataService, ModalService, OrderModesService) {

    function plateInGrams(plate) {
        return plate.inGrams;
    }

    $scope.plateInGrams = plateInGrams;

    $scope.listMarginBottom = {
        "margin-bottom": OrderModesService.hasOrderMode() ? "100px" : "0px"
    }

    $scope.showPrices = ConfigService.showPrices;

    $scope.category = MenuService.getCategory();

    $scope.category.plates = $scope.category.plates.map(plate => {
        if ($scope.plateInGrams(plate)) {
            plate.count = 50;
        } else {
            plate.count = 1;
        }

        return plate
    })

    $scope.canOrder = () => OrderModesService.hasOrderMode() && DataService.isOpen(DataService.getSelectedBranchContact());

    $scope.allPlatesWithoutPic = function () {
        let allPlatesWithoutPic = true;
        for (let plate of $scope.category.plates) {
            if (plate.withImage) allPlatesWithoutPic = false;
        }
        return allPlatesWithoutPic;
    }

    $scope.plateClicked = function (plate) {
        ModalService.openPlateDetailModal(plate)
        // MenuService.setPlate(plate);
        // ScreenService.savePlatesOffset();
        // $scope.$parent.$emit('plateClicked', {});
    }

    $timeout(function () {
        ScreenService.setPreviousPlatesOffset();
    });

    $scope.getDiscountRender = function (plate) {
        return DiscountService.getDiscountTemplate(plate);
    }

    $scope.getDiscountPillText = function (plate) {
        return DiscountService.getDiscountPillText(plate);
    };

    $scope.showStrikedPrice = function (plate) {
        return DiscountService.showStrikedPrice(plate);
    }

    $scope.getOnlyPrice = function (plate){
        return DiscountService.getOnlyPrice(plate);
    }

    $scope.getCurrency = () =>{
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () =>{
        return DataService.getLanguageAndRegion().decimalsShow;
    }

    $scope.increaseCount = (plate) => {
        if ($scope.plateInGrams(plate)) {
            plate.count += 50;
        } else {
            plate.count += 1;
        }
    }

    $scope.decreaseCount = (plate) => {
        if ($scope.plateInGrams(plate)) {
            plate.count -= 50;
        } else {
            plate.count -= 1;
        }
    }

    $scope.cantDecrease = (plate) => plate.count <= 1;
    $scope.cantIncrease = (plate) => false
});
