dinerApp.controller("plateDetailModalCtrl", function ($scope, $location, data, $uibModalInstance, $timeout, DiscountService, DataService, ConfigService, MenuService, CartFactory, NavigationService, GoogleAnalyticsService, ModalService, OrderModesService) {
    function plateInGrams() {
        return $scope.plate.inGrams
    }

    $scope.plateInGrams = plateInGrams;


    // if we are editing an order we send the whole thing, but we need a plate to show
    // and we need to store the old order to delete it after
    if (data.isEditing) {
        $scope.plate = {
            ...MenuService.findPlateById(data.plate.id),
            ...data.plate,
            count: data.quantity
        };

        data.fileImageUrl = $scope.plate.fileImageUrl;

        $timeout(() => {
            delete data.isEditing;
            $scope.previousPlate = data;
            $scope.individualOrder = data;
            $scope.selectedSize = {};
            $scope.quantity = data.quantity;

            // since ng-model does shallow comparison we need to find the same object and not a copy
            const identicalSize = $scope.plate.sizes.find(size => size.id === data.selectedSize.size.id)
            $scope.updateOrderPrice(identicalSize)

            $scope.$apply()
        })
    } else {
        $scope.plate = data;

        if ($scope.plate.inGrams && $scope.quantity < 50) $scope.quantity = 50;

        $timeout(selectPlate);
    }

    if (plateInGrams() && !data.isEditing) {
        $scope.plate.count = 200;
    } else if (!plateInGrams() && !data.isEditing)
        $scope.plate.count = 1;

    $scope.headerStyle = {
        "background-color": "#7c178b",
        "background-position": "center",
        "background-repeat": "no-repeat",
        "background-size": "cover",
        "border-top-left-radius": "2em",
        "border-top-right-radius": "2em",
        "color": "white",
        "position": "relative",

        "min-height": "136px",
        "background-image": `url(${data.fileImageUrl})`,
        "padding": "0",
    };

    $scope.headerExpanded = false;
    let animating = false;
    const ANIMATION_DURATION_MS = 595;

    $scope.toggleHeaderHeight = () => {
        if (animating) return;

        animating = true;
        $timeout(() => {
            animating = false;
        }, ANIMATION_DURATION_MS)

        const header = document.getElementById("plateDetailModalHeader");
        const darkener = document.getElementById("darkener");
        if ($scope.headerExpanded) {
            // leaving
            // https://stackoverflow.com/questions/22093141/adding-class-via-js-wont-trigger-css-animation
            header.classList.remove("menuPlateDetailEnlargeAnimation")
            void header.offsetWidth; // reading the property requires a recalc
            header.classList.add("menuPlateDetailEnlargeAnimationReverse")

            darkener.classList.remove("darkenerDisableAnimation")
            void header.offsetWidth; // reading the property requires a recalc
            darkener.classList.add("darkenerDisableAnimationReverse")

            $timeout(() => {
                $scope.headerExpanded = !$scope.headerExpanded;
            }, ANIMATION_DURATION_MS)
        } else {
            // entering
            $scope.headerExpanded = !$scope.headerExpanded;

            header.classList.remove("menuPlateDetailEnlargeAnimationReverse")
            void header.offsetWidth; // reading the property requires a recalc
            header.classList.add("menuPlateDetailEnlargeAnimation")

            darkener.classList.remove("darkenerDisableAnimationReverse")
            void header.offsetWidth; // reading the property requires a recalc
            darkener.classList.add("darkenerDisableAnimation")
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
        $location.search("q", undefined);
    };

    $scope.requestEnabled = () => OrderModesService.hasOrderMode() && DataService.isOpen(DataService.getSelectedBranchContact());
    $scope.showPrices = ConfigService.showPrices;

    $scope.getOnlyPrice = function (plate) {
        return DiscountService.getOnlyPrice(plate);
    };

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
    };

    function initializeVariables() {
        $scope.selectedSize = {size: data.sizes[0]};

        $scope.quantity = data.count;

        $scope.individualOrder = {};
        $scope.individualOrder.plate = $scope.plate;
        $scope.individualOrder.quantity = $scope.quantity;
        $scope.individualOrder.garnishes = [];
        $scope.individualOrder.price = getSizePrice(data.sizes[0].price);
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
        if ($scope.plate.garnishGroups) {
            for (var group of $scope.plate.garnishGroups) {
                group.clickedGarnishes = 0;
                for (var garnish of group.garnishes) {
                    if (garnish.selected) {
                        delete garnish.selected;
                        delete garnish.count;
                    }
                }
            }
        }
        initializeVariables();
    }

    $scope.updateOrderPrice = function (size) {
        $scope.selectedSize.size = size;
        $scope.individualOrder.price = getSizePrice(size.price);
        $scope.individualOrder.price += calculateGarnishesPrice();
    };

    $scope.addToCart = function () {
        if (noErrors()) {
            const bc = DataService.getSelectedBranchContact();
            if (DataService.isOpen(bc)) {

                if ($scope.previousPlate) {
                    const order = $scope.previousPlate;
                    const quantity = order.quantity;
                    CartFactory.removeOrder(order);

                    fireAnalyticsRemoveFromCartEvent(order.plate, quantity, order.price);
                }

                formatName($scope.individualOrder);
                new Android_Toast({content: "Item agregado a pedido!"});
                $scope.individualOrder.quantity = $scope.quantity;
                $scope.individualOrder.selectedSize = {size: $scope.selectedSize.size};
                // $scope.individualOrder.price = $scope.individualOrder.price.toFixed(0);

                // HACK
                for (const group of $scope.individualOrder.plate.garnishGroups) {
                    for (const garnish of group.garnishes) {
                        const found = $scope.individualOrder.garnishes.find(g => g.id === garnish.id)
                        if (found) {
                            garnish.count = found.count;
                        }
                    }
                }


                CartFactory.addIndividualOrder($scope.individualOrder);

                fireAnalyticsAddToCartEvent($scope.plate, $scope.individualOrder.quantity, $scope.individualOrder.price);

                plateAddedToCart();
            } else {
                ModalService.openBranchContactScheduleModal({branchContact: bc});
            }
        }
    };

    function plateAddedToCart() {
        window.history.pushState({}, document.title, window.location.pathname);
        // if (NavigationService.showBackButton()) NavigationService.backButtonAction();
        $scope.cancel();
    }

    function formatName(order) {
        order.garnishes.sort(function (a, b) {
            return a.id - b.id;
        });
        order.formattedName = "";
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
    };

    const fireAnalyticsAddToCartEvent = (plate, iOrderQuantity, iOrderPrice) => {
        GoogleAnalyticsService.fireAddToCartEvent(plate, iOrderQuantity, iOrderPrice);
    };

    const fireAnalyticsRemoveFromCartEvent = (plate, iOrderQuantity, iOrderPrice) => {
        GoogleAnalyticsService.fireRemoveFromCartEvent(plate, iOrderQuantity, iOrderPrice);
    }

    $scope.getCurrency = () => {
        return DataService.getLanguageAndRegion().currency;
    };

    $scope.isDecimalsShow = () => {
        return DataService.getLanguageAndRegion().decimalsShow;
    };

    $scope.decreaseCount = () => {
        $scope.plate.count -= 50;
    }

    $scope.increaseCount = () => {
        $scope.plate.count += 50;
    }

    $scope.$watch('plate.count', () => {
        $scope.plate.count = Math.min(Math.max(1, $scope.plate.count), 9999);
        $scope.quantity = $scope.plate.count;
    })

    /* GARNISHES */
    function calculateGarnishesPrice() {
        let garnishesPrice = 0;
        if ($scope.plate.garnishGroups) {
            for (var group of $scope.plate.garnishGroups) {
                for (var garnish of group.garnishes) {
                    if (garnish.selected && garnish.price) {
                        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
                        garnishesPrice += garnish.price * g.count;
                    }
                }
            }
        }
        return garnishesPrice;
    }

    function addGarnishToIndividualOrder(garnish, group) {
        group.clickedGarnishes++;

        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        if (g) return;

        const newGarnish = angular.copy(garnish);
        delete newGarnish.selected;
        if (!newGarnish.count) newGarnish.count = 1;
        $scope.individualOrder.garnishes.push(newGarnish);

        if (garnish.price) $scope.individualOrder.price += garnish.price;

    }

    function deleteGarnishFromIndividualOrder(garnish, group) {
        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        group.clickedGarnishes -= g.count;

        $scope.individualOrder.garnishes = $scope.individualOrder.garnishes.filter(g => g.id !== garnish.id);
        if (garnish.price) $scope.individualOrder.price -= garnish.price;

    }

    $scope.checkClickableOptions = function (garnish, group, maintainCount) {
        if (garnish.selected) {
            if (group.clickedGarnishes < group.maxGarnishAmount) {
                addGarnishToIndividualOrder(garnish, group);
                if (!maintainCount) garnish.count = 1;
            } else {
                garnish.selected = false;
                new Android_Toast({content: "Ya se ha seleccionado el máximo de opcionales permitidos en este grupo."});
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
                    new Android_Toast({content: "Revise que haya agregado la cantidad correcta de opcionales."});
                    return false;
                }
            }
        }
        return true;
    }

    $scope.showGarnishCounter = (group, garnish) => {
        return garnish.selected && group.multiSelectEnabled && group.maxGarnishAmount > 1;
    }

    $scope.garnishCount = (group, garnish) => {
        if (!$scope.individualOrder) return 0;
        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        return g.count;
    }

    $scope.decreaseGarnishCount = (group, garnish) => {
        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        g.count -= 1;
        group.clickedGarnishes -= 2; // la proxima funcion va a sumar 1
        $scope.checkClickableOptions(garnish, group, true);
        $scope.updateOrderPrice($scope.selectedSize.size);
    }

    $scope.increaseGarnishCount = (group, garnish) => {
        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        g.count += 1;
        $scope.checkClickableOptions(garnish, group, true);
        $scope.updateOrderPrice($scope.selectedSize.size);
    }

    $scope.cantDecreaseGarnish = (group, garnish) => {
        if (!$scope.individualOrder) return true;
        const g = $scope.individualOrder.garnishes.find(g => g.id === garnish.id);
        return g.count <= 1;
    }

    $scope.cantIncreaseGarnish = (group, garnish) => {
        if (!$scope.individualOrder) return true;
        return group.clickedGarnishes >= group.maxGarnishAmount;
    }

    $scope.getItemTotalPrice = () => {
        if (!$scope.individualOrder) return "0";
        let price = $scope.individualOrder.price * $scope.quantity;
        if ($scope.individualOrder.plate.inGrams) price /= 1000;

        return price;
    }
});
