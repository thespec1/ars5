dinerApp.controller("remarkedsCtrl", function ($scope, MenuService, ModalService, DiscountService, DataService) {

    $scope.getRemarkeds = MenuService.getRemarkeds;

    $scope.remarkedClicked = function (remarked) {
        const plate = MenuService.findPlateById(remarked.remarked.id);
        plate.count = 1;
        ModalService.openPlateDetailModal(plate)
    };

    $scope.showStrikedPrice = function (remarked) {
        const plate = MenuService.findPlateById(remarked.remarked.id)
        return DiscountService.showStrikedPrice(plate);
    }

    $scope.getBasePrice = (remarked) => {
        const plate = MenuService.findPlateById(remarked.remarked.id);
        const price = plate.sizes[0].price;
        if (price === 0) return "0";
        return price;
    };

    $scope.isByGram = remarked => {
        const plate = MenuService.findPlateById(remarked.remarked.id);
        return plate.inGrams;
    };

    $scope.getOnlyPrice = (remarked) => {
        const plate = MenuService.findPlateById(remarked.remarked.id);
        const onlyPrice = DiscountService.getOnlyPrice(plate);
        if (onlyPrice === 0) return "0";

        return onlyPrice;
    };

    $scope.getCurrency = () => {
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () => {
        return DataService.getLanguageAndRegion().decimalsShow;
    }

});
