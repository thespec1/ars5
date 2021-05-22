dinerApp.controller('checkoutCompleteModalCtrl', function ($scope, $uibModalInstance, data, DataService, CartFactory, $timeout, RequestService) {
    $scope.hasCallPhone = DataService.activeBranchContactHasCallPhone;
    $scope.hasWspPhone = DataService.activeBranchContactHasWspPhone;

    // orderCode, wasCashPayment, wasMercadoPagoPayment, wasOtherPayment
    // acá está toda la lógica
    $scope.dinerOrder = data.dinerOrder
    const mercadoPagoPublicKey = data.mercadoPagoPublicKey;


    $timeout(() => {
        openMercadoPagoCheckoutProPaymentModalIfShould();
    }, 5000);

    function openMercadoPagoCheckoutProPaymentModalIfShould() {
        if (data.wasMercadoPagoCheckoutProPayment) {

            new Promise((resolve, reject) => {
                RequestService.get(`/api/diner/dinerorder/${$scope.dinerOrder.id}/mercadopagopreference`)
                    .success(response => {
                        resolve(response);
                    })
                    .error(error => {
                        new Android_Toast({content: error})
                        reject(error);
                    });
            }).then( response => {
                const mp = new window.MercadoPago(mercadoPagoPublicKey);
                mp.checkout({
                    preference: {
                        id: response.split("pref_id=")[1]
                    },
                    autoOpen: true,
                    theme: {
                        elementsColor: '#9C1EAFFF'
                    },
                    redirect: true
                });

            })


        }
    }

    function clearStorage() {
        localStorage.clear();
        localStorage.setItem('cartRetrievalTime', new Date());
        CartFactory.emptyCart();
    }

    $scope.callPhone = () => {
        document.location.href = `tel:${DataService.getSelectedBranchContact().callPhone}`;
    };

    $scope.openWspPhone = () => {
        document.location.href = `https://api.whatsapp.com/send?phone=${DataService.getSelectedBranchContact().whatsAppPhone}`;
    };

    $scope.wasCashPayment = () => {
        return data.wasCashPayment;
    }
    $scope.wasMercadoPagoPayment = () => {
        return data.wasMercadoPagoPayment;
    }

    $scope.wasMercadoPagoCheckoutProPayment = () => {
        return data.wasMercadoPagoCheckoutProPayment;
    }

    $scope.wasOtherPayment = () => {
        return data.wasOtherPayment;
    }

    $scope.cancel = function () {
        if ($scope.wasMercadoPagoCheckoutProPayment())
            $uibModalInstance.dismiss('cancel');
        else {
            clearStorage();
            location.reload();
            window.location.search = "";
        }
    };


})
