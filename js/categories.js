dinerApp.controller("categoriesCtrl", function ($scope, ScreenService, MenuService, DiscountService, $timeout, DataService, ConfigService, OrderModesService) {

    $scope.menu = MenuService.getMenu;

    $scope.requestEnabled = ConfigService.requestEnabled;

    const updateHeaderLoadedState = () => {
        return $scope.headerLoaded = DataService.headerLoaded;
    }
    $scope.$on("headerLoadStateChange", updateHeaderLoadedState)
    updateHeaderLoadedState()

    $scope.isOpen = function () {
        return DataService.isOpen(DataService.getSelectedBranchContact());
    }

    $scope.listMarginBottom = {
        "margin-bottom": OrderModesService.hasOrderMode() ? "100px" : "0px"
    }

    $scope.headerContent = '/web/header';
    $scope.remarkedContent = '/web/remarkeds';

    $scope.categoryClicked = function (category) {
        MenuService.setCategory(category);
        ScreenService.saveCategoriesOffset();
        $scope.$parent.$emit('categoryClicked', {});
    }

    $timeout(function () {
        ScreenService.setPreviousCategoriesOffset();
    });

    $scope.$on('scrollCategoriesToTop', function (event, args) {
        ScreenService.setPreviousCategoriesOffset();
    });

    $scope.categoryContainsAtLeastOnePlateWithDiscount = function (category) {
        return DiscountService.atLeastOnePlateWithDiscount(category.plates)
    };

    $scope.categoryGetGreatestDiscount = function (category) {
        const plateWithGreatestPercentDiscount = DiscountService.greatestPercentDiscount(category.plates)

        if (plateWithGreatestPercentDiscount) return plateWithGreatestPercentDiscount.activeDiscount.percentage;
    }

    $scope.allCatsWithoutPic = function () {
        let allCatsWithImg = true;
        for (let category of $scope.menu()) {
            if (category.withImage) allCatsWithImg = false;
        }
        return allCatsWithImg;
    }

    $scope.deliveryAvailable = OrderModesService.deliveryAvailable;
    $scope.inPlaceOrderAvailable = OrderModesService.inPlaceOrderAvailable;
    $scope.takeAwayAvailable = OrderModesService.takeAwayAvailable;

    $scope.setDeliveryOrder = OrderModesService.setDeliveryOrder;
    $scope.setInPlaceOrder = OrderModesService.setInPlaceOrder;
    $scope.setTakeAwayOrder = OrderModesService.setTakeAwayOrder;

    $scope.deliverySelected = OrderModesService.deliverySelected;
    $scope.inPlaceOrderSelected = OrderModesService.inPlaceOrderSelected;
    $scope.takeAwaySelected = OrderModesService.takeAwaySelected;

    $scope.orderModesAvailable = OrderModesService.orderModesAvailable;
    $scope.orderModesAvailableAmount = OrderModesService.orderModesAvailableAmount;
});
