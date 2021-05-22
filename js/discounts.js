dinerApp.controller("discountsCtrl", function ($scope, DiscountService, ScreenService, $timeout) {

    $scope.discounts = DiscountService.getDiscounts();

    $timeout(function () {
        ScreenService.setPreviousDiscountsOffset();
    });

    $scope.discountClicked = function (discount) {
        DiscountService.setDiscount(discount);
        ScreenService.saveDiscountsOffset();
        $scope.$parent.$emit('discountClicked', {});
    };

});
