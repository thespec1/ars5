dinerApp.controller("branchContactCtrl", function ($scope, ConfigService, NavigationService, DataService,
                                                   ModalService, $timeout, FetchService, AuthService, MenuService,
                                                   DiscountService, OrderModesService, $location) {
    const branchContact = DataService.getSelectedBranchContact();

    let dts = branchContact.orderModes;

    if (typeof branchContact.orderModes === typeof []) {
        dts = dts.reduce((acc, dt) => {
            acc[dt["@type"].toUpperCase()] = dt
            return acc;
        }, {})
    }

    OrderModesService.setCurrentBranchOrderModes(dts);
    OrderModesService.selectFirstMode()
        .then(() => {
            AuthService.setPageLoading(false)
            showMainView();
        })
        // .catch((error) => {
        //     new Android_Toast({content: error.message});
        //     $timeout(() => {
        //         window.location.href = 'https://info.luveat.com';
        //     }, 2000);
        // });

    $scope.menuLoading = () => OrderModesService.getMenuLoading()


    const showTabsScreen = () => {
        $scope.branchContactContent = '/web/tabs';
        $scope.safeApply()
    };
    const showMenuScreen = () => {
        $scope.branchContactContent = '/web/menu';
        $scope.safeApply()
    };
    const showDiscountScreen = () => {
        $scope.branchContactContent = '/web/main/discount';
        $scope.safeApply()
    };


    function showCheckoutCompleteModalIfMercadoPagoCheckoutProPaymentSuccess() {
        const mercadoPagoCheckoutProPayment = $location.search();
        if (mercadoPagoCheckoutProPayment.external_reference && mercadoPagoCheckoutProPayment.payment_id) {
            const dinerOrder = JSON.parse(mercadoPagoCheckoutProPayment.external_reference);
            dinerOrder.payment.accredited = true;
            dinerOrder.payment.paymentStatus = mercadoPagoCheckoutProPayment.status;
            dinerOrder.payment.paymentBeingProcessed = false;
            dinerOrder.payment.providerId = mercadoPagoCheckoutProPayment.payment_id;

            FetchService.updatePayment(dinerOrder.payment)
                .then(() => {
                    ModalService.openCheckoutCompleteModal({dinerOrder: dinerOrder, wasMercadoPagoPayment: true})
                })
        }
    }

    // should not show tabs when both payment types are disabled for current order mode
    const showMainView = (doNotShowModal) => {
        if (OrderModesService.hasOrderMode()) {
            const bc = DataService.getSelectedBranchContact();
            if (!DataService.isOpen(bc) && !doNotShowModal)
                ModalService.openBranchContactScheduleModal({branchContact: bc});
            showTabsScreen();
        } else {
            showMenuScreen();
        }
        showCheckoutCompleteModalIfMercadoPagoCheckoutProPaymentSuccess();
    };


    $scope.hasOrderMode = () => OrderModesService.hasOrderMode()
    $scope.currentDT = () => OrderModesService.getCurrentBranchOrderMode();

    function updateTabsOrNoTabs() {
        showMainView(true);
    }

    // hace lo mismo que showmainview, pero para order types y cada vez que cambia
    $scope.$watch($scope.currentDT, updateTabsOrNoTabs)
    $scope.$watch($scope.menuLoading, updateTabsOrNoTabs)


    // ------- view initialized -----
    $scope.$on("showDiscounts", function (event, args) {
        event.stopPropagation();
        NavigationService.setBackButtonAction(showMainView);
        showDiscountScreen();
    });

    $scope.$on("showBranchContactMainView", function (event, args) {
        event.stopPropagation();
        showMainView();
    });

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
