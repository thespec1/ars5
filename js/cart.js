dinerApp.controller("cartCtrl", function ($scope, $rootScope, NavigationService, CartFactory, ModalService, GoogleAnalyticsService, DataService) {

    NavigationService.hideBackButton();

    function updateCart() {
        $scope.individualOrders = CartFactory.getCart();
        $scope.totalCartPrice = CartFactory.getTotalCartPrice();
        if ($scope.totalCartPrice === 0) $scope.totalCartPrice = "0";
    }

    updateCart();

    $scope.cantDecrease = (order) => order.quantity <= 1;
    $scope.cantIncrease = (order) => order.quantity >= 9951;

    $scope.editPlate = (order) => {
        order.isEditing = true;
        ModalService.openPlateDetailModal(order)
            .closed
            .then(updateCart)
    }

    $scope.increaseQuantity = function (order) {
        const amount = order.plate.inGrams ? 50 : 1;
        CartFactory.increaseOrderQuantity(order, amount);

        $scope.individualOrders = CartFactory.getCart();
        $scope.totalCartPrice = CartFactory.getTotalCartPrice();

        fireAnalyticsAddToCartEvent(order.plate, amount, order.price);
    }

    $scope.decreaseQuantity = function (order) {
        const amount = order.plate.inGrams ? 50 : 1;
        CartFactory.decreaseOrderQuantity(order, amount);
        $scope.individualOrders = CartFactory.getCart();
        $scope.totalCartPrice = CartFactory.getTotalCartPrice();

        fireAnalyticsRemoveFromCartEvent(order.plate, amount, order.price);
    }

    $scope.removeOrder = function (order) {
        const quantity = order.quantity;
        CartFactory.removeOrder(order);

        $scope.individualOrders = CartFactory.getCart();
        $scope.totalCartPrice = CartFactory.getTotalCartPrice();

        fireAnalyticsRemoveFromCartEvent(order.plate, quantity, order.price);
    }


    $scope.showEmptyConfirmation = function () {
        var data = { emptyCart: $scope.emptyCart };
        ModalService.openEmptyCartConfirmationModal(data);
    };

    $scope.emptyCart = function () {

        fireAnalyticsEmptyCartEvent(CartFactory.getCart(), CartFactory.getTotalCartPrice());

        CartFactory.emptyCart();
        $scope.individualOrders = CartFactory.getCart();
        $scope.totalCartPrice = CartFactory.getTotalCartPrice();
    }

    $scope.showCheckOut = function (category) {
        $scope.$parent.$emit('showCheckOut', {});
    }


    const fireAnalyticsAddToCartEvent = (plate, iOrderQuantity, iOrderPrice) =>{
        GoogleAnalyticsService.fireAddToCartEvent(plate, iOrderQuantity, iOrderPrice);
    }

    const fireAnalyticsRemoveFromCartEvent = (plate, iOrderQuantity, iOrderPrice) =>{
        GoogleAnalyticsService.fireRemoveFromCartEvent(plate, iOrderQuantity, iOrderPrice);
    }


    const fireAnalyticsEmptyCartEvent = (iOrders, iOrdersTotalPrice) =>{
        GoogleAnalyticsService.fireEmptyCartEvent(iOrders, iOrdersTotalPrice);
    }

    $scope.getCurrency = () =>{
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () =>{
        return DataService.getLanguageAndRegion().decimalsShow;
    }

    $scope.addItems = () => {
        $rootScope.$broadcast("showMainMenu")
    }

    $scope.getItemTotalPrice = (order) => {
        let price = order.price * order.quantity;
        if (order.plate.inGrams) price /= 1000;
        if (price === 0) return "0";

        return price;
    }

    $scope.getOrderQuantity = (order) => {
        if (order.plate.inGrams) return `${order.quantity}gr`
        return order.quantity;
    }
});
