dinerApp.controller("mainDiscountCtrl", function ($scope, NavigationService) {

    $scope.discountContent = '/web/discounts';

    $scope.$on("discountClicked", function (event, args) {
        event.stopPropagation();
        showDiscountScreen();
    });

    const goToBranchContactScreen = () => {
        $scope.$parent.$emit('showBranchContactMainView', {});
    };

    $scope.$on("discountBackClicked", function (event, args) {
        event.stopPropagation();
        $scope.discountContent = '/web/discounts';
        NavigationService.setBackButtonAction(goToBranchContactScreen);
    });

    $scope.$on("plateClickedFromDiscount", function (event, args) {
        event.stopPropagation();
        $scope.discountContent = '/web/plates/detail';
        NavigationService.setBackButtonAction(showDiscountScreen);
    });

    function showDiscountScreen(){
        $scope.discountContent = '/web/discount';
    }

});
