dinerApp.controller("plateDetailCtrl", function ($scope, MenuService, CartFactory, DiscountService, NavigationService, $timeout, ConfigService, GoogleAnalyticsService, DataService, ModalService) {

    $scope.requestEnabled = ConfigService.requestEnabled;
    $scope.showPrices = ConfigService.showPrices;

    $timeout(function () {

        if ($scope.plate.withImage) {
            var targetDiv = document.querySelector('#bigOne');
            targetDiv.style.background = `url(${$scope.plate.fileImageUrl})`;
        }
    });

    $scope.getOnlyPrice = function (plate) {
        return DiscountService.getOnlyPrice(plate);
    }

    $scope.getDiscountRender = function (plate) {
        return DiscountService.getDiscountTemplate(plate);
    };

    $scope.showDiscount = function () {
        return DiscountService.showDiscount($scope.plate);
    };

    $scope.showDiscountPill = function () {
        return DiscountService.showDiscountPill($scope.plate);
    };

    $scope.getDiscountPillText = function () {
        return DiscountService.getDiscountPillText($scope.plate);
    };

    $scope.getDiscountedPrice = function (price) {
        if ($scope.plate.activeDiscount) {
            return DiscountService.getDiscountedPrice($scope.plate, price);
        } else {
            return price;
        }
    };

    $scope.showStrikedPrice = function (plate) {
        return DiscountService.showStrikedPrice(plate);
    }

    selectPlate();
    $("html, #content").animate({scrollTop: 0}, 0);

    $scope.decreaseQuantity = function () {
        if ($scope.quantity > 1) $scope.quantity--;
    }

    $scope.increaseQuantity = function () {
        if ($scope.quantity < 36) $scope.quantity++;
    }

    function initializeVariables() {
        $scope.selectedSize = {size: $scope.plate.sizes[0]};

        $scope.quantity = 1;

        $scope.individualOrder = {};
        $scope.individualOrder.plate = $scope.plate;
        $scope.individualOrder.quantity = $scope.quantity;
        $scope.individualOrder.garnishes = [];
        $scope.individualOrder.price = getSizePrice($scope.plate.sizes[0].price);
        $scope.individualOrder.comment = undefined;
    }

    function getSizePrice(price) {
        if ($scope.showDiscount()) {
            return $scope.getDiscountedPrice(price);
        } else {
            return price;
        }
    }

    function selectPlate() {
        $scope.plate = {};
        angular.copy(MenuService.getPlate(), $scope.plate);
        if ($scope.plate.garnishGroups) {
            for (var group of $scope.plate.garnishGroups) {
                group.clickedGarnishes = 0;
                for (var garnish of group.garnishes) {
                    if (garnish.selected) {
                        delete garnish.selected;
                    }
                }
            }
        }
        initializeVariables()
    }

    $scope.updateOrderPrice = function (size) {
        $scope.selectedSize.size = size;
        $scope.individualOrder.price = getSizePrice(size.price);
        $scope.individualOrder.price += calculateGarnishesPrice();
    };

    function calculateGarnishesPrice() {
        let garnishesPrice = 0;
        if ($scope.plate.garnishGroups) {
            for (var group of $scope.plate.garnishGroups) {
                for (var garnish of group.garnishes) {
                    if (garnish.selected && garnish.price) {
                        garnishesPrice += garnish.price;
                    }
                }
            }
        }
        return garnishesPrice;
    }

    function addGarnishToIndividualOrder(garnish, group) {
        group.clickedGarnishes++;
        var newGarnish = {};
        angular.copy(garnish, newGarnish);
        delete newGarnish.selected;
        $scope.individualOrder.garnishes.push(newGarnish);
        if (garnish.price) $scope.individualOrder.price += garnish.price;
    }

    function deleteGarnishFromIndividualOrder(garnish, group) {
        group.clickedGarnishes--;
        var garnishes = [];
        for (var orderGarnish of $scope.individualOrder.garnishes) {
            if (orderGarnish.id != garnish.id) {
                garnishes.push(orderGarnish);
            }
        }
        $scope.individualOrder.garnishes = garnishes;
        if (garnish.price) $scope.individualOrder.price -= garnish.price;
    }

    $scope.checkClickableOptions = function (garnish, group) {
        if (garnish.selected) {
            if (group.clickedGarnishes < group.maxGarnishAmount) {
                addGarnishToIndividualOrder(garnish, group);
            } else {
                garnish.selected = false;
                new Android_Toast({content: 'Ya se ha seleccionado el máximo de opcionales permitidos en este grupo.'});
            }
        } else {
            if (group.clickedGarnishes > 0) {
                deleteGarnishFromIndividualOrder(garnish, group);
            }
        }
    };

    function noErrors() {
        if ($scope.plate.garnishGroups) {
            for (var group of $scope.plate.garnishGroups) {
                if (group.clickedGarnishes < group.minGarnishAmount) {
                    new Android_Toast({content: 'Revise que haya agregado la cantidad correcta de opcionales.'});
                    return false;
                }
            }
        }
        return true;
    }

    $scope.addToCart = function () {
        if (noErrors()) {
            const bc = DataService.getSelectedBranchContact();
            if (DataService.isOpen(bc)) {
                formatName($scope.individualOrder);
                new Android_Toast({content: 'Item agregado a pedido!'});
                $scope.individualOrder.quantity = $scope.quantity;
                // $scope.individualOrder.price = $scope.individualOrder.price.toFixed(0);
                CartFactory.addIndividualOrder($scope.individualOrder);

                fireAnalyticsAddToCartEvent($scope.plate, $scope.individualOrder.quantity, $scope.individualOrder.price);

                plateAddedToCart();
            } else {
                ModalService.openBranchContactScheduleModal({branchContact: bc});
            }
        }
    };

    function plateAddedToCart() {
        NavigationService.backButtonAction();
    }

    function formatName(order) {
        order.garnishes.sort(function (a, b) {
            return a.id - b.id;
        });
        order.formattedName = '';
        if (order.garnishes.length != 0) {
            order.formattedName += " con ";
        }
        for (var garnish of order.garnishes) {
            order.formattedName += garnish.name + ", ";
        }
        if (order.formattedName.length >= 2) {
            order.formattedName = order.formattedName.substring(0, order.formattedName.length - 2);
        }
        if (order.formattedName.lastIndexOf(", ") > 0) {
            order.formattedName = order.formattedName.substring(0, order.formattedName.lastIndexOf(", ")) + " y " + order.formattedName.substring(order.formattedName.lastIndexOf(", ") + 2, order.formattedName.length);
        }
        var sizeName = "";
        if ($scope.plate.sizes.length > 1) sizeName = " " + $scope.selectedSize.size.name;
        order.formattedName = order.plate.name + sizeName + order.formattedName;
    }

    $scope.plateWithOnePrice = function () {
        return $scope.plate.sizes.length === 1;
    }

    const fireAnalyticsAddToCartEvent = (plate, iOrderQuantity, iOrderPrice) => {
        GoogleAnalyticsService.fireAddToCartEvent(plate, iOrderQuantity, iOrderPrice);
    }

    $scope.getCurrency = () =>{
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () =>{
        return DataService.getLanguageAndRegion().decimalsShow;
    }

});
