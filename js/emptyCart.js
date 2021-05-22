dinerApp.controller('emptyCartModalCtrl', function ($scope, data, $uibModalInstance) {

    $scope.emptyCart = function (){
        data.emptyCart();
        $scope.cancel();
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
