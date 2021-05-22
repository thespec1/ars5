dinerApp.controller("checkoutCtrl", function ($scope, $rootScope, $timeout, CartFactory, RequestService,
                                              DataService, ModalService, AddressService, GoogleAnalyticsService,
                                              DeliveryZoneService, AttributionService, AuthService, FetchService,
                                              OrderModesService, CartToOrderService, DateService) {

    // TODO: check onlinePaymentRegistered (deprecated?)

    $scope.myAddress = AddressService.getAddressObject;
    $scope.validAddress = AddressService.validAddress;

    const selectedBranchContact = DataService.getSelectedBranchContact()

    // Delivery Type
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

    $scope.selectedOrderType = OrderModesService.getOrderMode;

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

    $scope.addItems = () => {
        $rootScope.$broadcast("showMainMenu")
    }

    // authentication
    $scope.isLoggedIn = AuthService.isLoggedIn;

    $scope.user = undefined;

    $scope.selectedAddress = undefined;

    $scope.getCurrentUser = () => {
        $scope.user = AuthService.getUser();
        if (!$scope.user) return;

        const addresses = $scope.user.addresses;
        if (addresses.length > 0) {
            let currentlySelectedAddress = addresses.find(adr =>
                adr.id === $scope.selectedAddressId
            );

            if (!currentlySelectedAddress) currentlySelectedAddress = addresses[0];

            $scope.selectedAddressId = currentlySelectedAddress.id
            $scope.selectedAddressChange(currentlySelectedAddress)
        }
    }

    // handle addresses for logged in user (delivery only)
    // you should only call this if you're sure there is a user logged in
    $scope.getCurrentUserAddresses = () => {
        if (!$scope.user) return []; // should never happen
        return $scope.user.addresses;
    }

    $scope.selectedAddressChange = (address) => {
        let geocoder = new google.maps.Geocoder();
        let place = undefined;

        geocoder.geocode({'address': address.fullAddress}, function (result, status) {
            if (status === 'OK') {
                place = result[0];
                const globalAddress = place.formatted_address;
                saveGlobalAddress(place, globalAddress, address.clarifications, address.betweenStreets);
                setReachableDeliveryZone(place.geometry.location);

            } else {
                new Android_Toast({content: "Hubo algun error al contactarse con el servidor de Google. Intente nuevamente."})
            }

            $scope.$apply();
        });
    }

    const setReachableDeliveryZone = (coordinate) => {
        if (!DataService.activeBranchContactHasDeliveryZonesAvailable()) {
            DeliveryZoneService.setReachableDeliveryZone(selectedBranchContact.deliveryConfig.deliveryFee, 0);
            new Android_Toast({content: 'Llegamos a su dirección.'});
            return;
        }

        const dzs = selectedBranchContact.deliveryConfig.deliveryZones;
        const zone = DeliveryZoneService.getBestDeliveryZone(dzs, coordinate);

        if (zone !== undefined) {
            DeliveryZoneService.setReachableDeliveryZone(zone.deliveryFee, zone.minimumOrderPrice);
            new Android_Toast({content: 'Llegamos a su dirección.'});
        } else {
            DeliveryZoneService.setReachableDeliveryZone(undefined, undefined);
            new Android_Toast({content: 'No llegamos a su dirección.'});
        }

        $scope.reachableDeliveryZone = DeliveryZoneService.getReachableDeliveryZone();
    };

    const saveGlobalAddress = (place, address, clarifications, betweenStreets) => {
        if (inputValid(place, address)) {
            $scope.myAddress.address = address;
            $scope.myAddress.lat = place.geometry.location.lat();
            $scope.myAddress.lng = place.geometry.location.lng();
            $scope.myAddress.details = clarifications;
            $scope.myAddress.betweenStreets = betweenStreets;
            AddressService.saveAddressObject($scope.myAddress, false);
        }
    };

    const inputValid = (place, address) => {
        if (!address || !place || !place.geometry || !place.geometry.location || !place.geometry.location.lat || !place.geometry.location.lng) {
            new Android_Toast({content: 'Asegurese de haber ingresado la dirección correctamente.'});
            return false;
        }
        return true;
    };

    $scope.isDeletingAddress = false;
    $scope.deleteAddress = (address) => {
        if ($scope.isDeletingAddress) return;

        $scope.isDeletingAddress = true
        AuthService.deleteAddress(address)
            .then(() => {
                AuthService.init()
            })
            .catch(response => {
                new Android_Toast({contents: "Hubo un error al eliminar la dirección. Intente nuevamente"});
                console.error(response);
            })
            .finally(() => {
                $scope.isDeletingAddress = false;
            })
    }

    $scope.shouldShowDeliveryWarning = () =>
        $scope.deliverySelected() &&
        $scope.reachableDeliveryZone.minimumOrderPrice > $scope.getOrderPrice();

    $scope.userHasAtLeastOneAddress = () => {
        return $scope.getCurrentUserAddresses().length > 0;
    }
    // done

    AuthService.init();
    $scope.getCurrentUser();
    $scope.$on("AuthServiceLoadStateChange", function () {
        $scope.getCurrentUser();
        $scope.safeApply();
    })

    $scope.getBranchContactFormattedAddress = branchContact =>
        DataService.getBranchContactFormattedAddress(branchContact);

    $scope.showScheduleModal = () => {
        let data = {branchContact: selectedBranchContact};
        ModalService.openBranchContactScheduleModal(data)
    };

    $scope.showDeliveryZonesModal = () => {
        let data = {branchContact: selectedBranchContact};
        ModalService.openDeliveryZonesModal(data)
            .closed.then(() => {
            $scope.reachableDeliveryZone = DeliveryZoneService.getReachableDeliveryZone();
        });
    };

    $scope.showDeliveryScheduleModal = () => {
        let data = {branchContact: selectedBranchContact};
        ModalService.openDeliveryScheduleModal(data)
            .result.then((data) => {
            $scope.selectedDeliveryDate = data.date;
        })
    };

    $scope.getSelectedDeliveryDateText = () => {
        if ($scope.selectedDeliveryDate) {
            return DateService.dateToFullDateText($scope.selectedDeliveryDate);
        }

        return "Inmediatamente";
    }

    $scope.hasSelectedDeliveryDate = () => {
        return $scope.selectedDeliveryDate !== undefined;
    }

    $scope.clearDeliveryDate = () => {
        $scope.selectedDeliveryDate = undefined;
    }


    // ---------- LOGICA PANTALLA ------------

    const hasDeliveryZones =
        OrderModesService.deliveryAvailable() &&
        DataService.activeBranchContactHasDeliveryZones() &&
        DataService.activeBranchContactHasDeliveryZonesAvailable() &&
        AddressService.validAddress()

    if (hasDeliveryZones) {
        const coordinate = new google.maps.LatLng(AddressService.getLat(), AddressService.getLng());
        const dzs = selectedBranchContact.deliveryConfig.deliveryZones;

        const zone = DeliveryZoneService.getBestDeliveryZone(dzs, coordinate);

        if (zone !== undefined) {
            DeliveryZoneService.setReachableDeliveryZone(zone.deliveryFee, zone.minimumOrderPrice);
        }

        $scope.reachableDeliveryZone = DeliveryZoneService.getReachableDeliveryZone();
    }

    function getOrderPrice() {
        return CartFactory.getTotalCartPrice();
    }

    $scope.getOrderPrice = getOrderPrice;

    $scope.getItemPrice = (item) => {
        let price = item.price * item.quantity;
        if (item.plate.inGrams) price /= 1000;
        if (price === 0) return "0";

        return price;
    }

    $scope.order = {};
    $scope.diner = {};
    $scope.cart = CartFactory.getCart();

    const paymentType = {
        CASH: 'CASH',
        OTHER: 'OTHER',
        MERCADO_PAGO: 'MERCADO_PAGO',
        MERCADO_PAGO_CHECK_OUT_PRO: 'MERCADO_PAGO_CHECK_OUT_PRO'
    };


    $scope.isOpen = function () {
        return selectedBranchContact.deliveryConfig == undefined || selectedBranchContact.deliveryConfig.open;
    }

    $scope.deliveryNotReachable = () => {
        return !DeliveryZoneService.validReachableDeliveryZone() &&
            DataService.activeBranchContactHasDeliveryZones() &&
            OrderModesService.deliveryAvailable() &&
            AddressService.validAddress();
    };

    $scope.chargesDeliveryFeeForDeliveryZone = function () {
        return DeliveryZoneService.validReachableDeliveryZone() &&
            OrderModesService.deliveryAvailable() &&
            DataService.activeBranchContactHasDeliveryZones() &&
            DataService.activeBranchContactHasDeliveryZonesAvailable();
    };

    $scope.deliveryFeeForDeliveryZone = function () {
        return formatNumberOutput(DeliveryZoneService.getReachableDeliveryZone().deliveryFee);
    };

    $scope.chargesDeliveryFee = function () {
        return !DataService.activeBranchContactHasDeliveryZonesAvailable();
    };

    $scope.deliveryFee = function () {
        return selectedBranchContact.deliveryConfig.deliveryFee > 0 ? formatNumberOutput(selectedBranchContact.deliveryConfig.deliveryFee) : 0;
    };

    $scope.getCurrency = () => {
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () => {
        return DataService.getLanguageAndRegion().decimalsShow;
    }

    // Location reference
    $scope.getInPlaceOrderText = () => {
        return DataService.getDeliveryConfigInPlaceOrderText();
    }

    // ---- payment ---

    $scope.setCashPayment = function () {
        $scope.order.payment = paymentType.CASH;
    }

    $scope.setOtherPayment = function () {
        $scope.order.payment = paymentType.OTHER;
        if ($scope.onlinePaymentRegistered())
            $scope.setMercadoPagoPayment();
    }

    $scope.setMercadoPagoPayment = function () {
        $scope.order.payment = paymentType.MERCADO_PAGO;
        mercadoPagoInit();
    }

    $scope.setMercadoPagoCheckoutProPayment = function () {
        $scope.order.payment = paymentType.MERCADO_PAGO_CHECK_OUT_PRO;
    }

    $scope.cashPaymentSelected = function () {
        return $scope.order.payment === paymentType.CASH;
    }

    $scope.otherPaymentSelected = function () {
        return $scope.order.payment === paymentType.OTHER;
    }

    $scope.mercadoPagoPaymentSelected = function () {
        return $scope.order.payment === paymentType.MERCADO_PAGO;
    }

    $scope.mercadoPagoCheckoutProPaymentSelected = function () {
        return $scope.order.payment === paymentType.MERCADO_PAGO_CHECK_OUT_PRO;
    }

    $scope.digitalPaymentSelected = function () {
        return $scope.mercadoPagoPaymentSelected() || $scope.mercadoPagoCheckoutProPaymentSelected() || $scope.otherPaymentSelected()
    }

    $scope.selectedPaymentMethod = function () {
        return $scope.order.payment;
    }

    $scope.reachableDeliveryZone = DeliveryZoneService.getReachableDeliveryZone();
    $scope.selected = {contact: DataService.getSelectedBranchContact()};

    $scope.getDeliveryFee = () => {
        if ($scope.deliverySelected() && $scope.chargesDeliveryFeeForDeliveryZone()) return $scope.deliveryFeeForDeliveryZone();
        if ($scope.deliverySelected() && $scope.chargesDeliveryFee()) return $scope.deliveryFee();

        return 0;
    }

    $scope.totalOrderPrice = () => getOrderPrice() + $scope.getDeliveryFee()


    function paymentTypeEnabled(type) {
        const dt = OrderModesService.getCurrentBranchOrderMode();
        const pt = dt.paymentTypes[type]
        return pt && pt.active;
    }

    $scope.acceptsCashPayment = () => paymentTypeEnabled("cash")
    $scope.acceptsOnlinePayment = () => paymentTypeEnabled("card")

    $scope.onlinePaymentRegistered = function () {
        return selectedBranchContact.deliveryConfig.onlinePaymentRegistered;
    }

    $scope.canGeneratePaymentURL = function () {
        return $scope.otherPaymentSelected() && $scope.onlinePaymentRegistered();
    }


    if ($scope.acceptsOnlinePayment()) {
        $scope.setOtherPayment();
    } else {
        $scope.setCashPayment();
    }

    function inputsValid(disablePrint) {
        function toast(toast) {
            if (!disablePrint) new Android_Toast(toast)
        }

        if (!$scope.isOpen()) {
            new toast({content: "El restaurant está cerrado."})
            return false;
        }

        if ($scope.isLoggedIn()) {
            if ($scope.deliverySelected() && $scope.getCurrentUserAddresses().length < 1) {
                new toast({content: "Debe tener al menos una dirección valida para poder realizar el pedido."})
                return false;
            }

            if ($scope.cashPaymentSelected() && !Number($scope.order.cashAmount)) {
                new toast({content: "Debe indicar el monto con el que va a pagar."})
                return false;
            }
        } else {
            if (!$scope.diner.name) {
                new toast({content: 'Debe ingresar su nombre para poder realizar el pedido.'});
                return false;
            }
            if (!$scope.diner.email) {
                new toast({content: 'Debe ingresar su email para poder realizar el pedido.'});
                return false;
            }
            if (!isValidEmail()) {
                new toast({content: 'El email ingresado es invalido.'});
                return false;
            }
            if (getFullIntlTelephone() === "") {
                new toast({content: 'Debe ingresar su número telefónico para poder realizar el pedido.'});
                return false;
            }

            if ($scope.inPlaceOrderSelected()) {
                if (!$scope.order.locationReference) {
                    new toast({content: `Debe ingresar su ${$scope.getInPlaceOrderText()} para poder realizar el pedido.`});
                    return false;
                }
            }

            if ($scope.deliverySelected()) {
                if (!$scope.myAddress().address) {
                    new toast({content: 'Debe ingresar su dirección para poder realizar el pedido.'});
                    return false;
                }
            }
        }

        if ($scope.cashPaymentSelected()) {
            if (!$scope.order.cashAmount) {
                new toast({content: 'Debe ingresar con cuanto abona para poder realizar el pedido.'});
                return false;
            }
            if ($scope.order.cashAmount < $scope.totalOrderPrice()) {
                new toast({content: 'El monto con el cual abonará no puede ser menor al precio del pedido.'});
                return false;
            }
        }

        return true;
    }

    $scope.inputsValid = inputsValid


    function isValidEmail() {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String($scope.diner.email).toLowerCase());
    }

    const MP_ERROR_MAP = {
        "pending_contingency": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",
        "pending_review_manual": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",

        "cc_rejected_bad_filled_card_number": "El número de la tarjeta de crédito no es válido",
        "cc_rejected_bad_filled_date": "La fecha de vencimiento no coincide con la de la tarjeta.",
        "cc_rejected_bad_filled_other": "Algún dato ingresado no corresponde con los de la tarjeta.",
        "cc_rejected_bad_filled_security_code": "El código de seguridad no coincide con el de la tarjeta.",
        "cc_rejected_blacklist": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",
        "cc_rejected_call_for_authorize": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",
        "cc_rejected_card_disabled": "La tarjeta de crédito que está intentando usar no está activada.",
        "cc_rejected_card_error": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",
        "cc_rejected_duplicated_payment": "Ya existe un pago reciente por este monto con esta tarjeta. Revisa tu casilla de mails.",

        "cc_rejected_high_risk": "Tu tarjeta de crédito fue rechazada por Mercado Pago.",
        "cc_rejected_insufficient_amount": "No hay suficientes fondos en tu tarjeta.",
        "cc_rejected_invalid_installments": "La cantidad de cuotas seleccionadas no es valida.",
        "cc_rejected_max_attempts": "Llegaste al tope de intentos para esta tarjeta.",

        "cc_rejected_other_reason": "Tu tarjeta de crédito fue rechazada por Mercado Pago."
    }

    const MP_INPUT_ERROR_MAP = {
        "205": "Por favor ingrese el número de tarjeta.",
        "208": "Por favor ingrese el mes de expiración de la tarjeta.",
        "209": "Por favor ingrese el año de expiración de la tarjeta.",
        "212": "Por favor ingrese el tipo de documento.",
        "213": "Por favor ingrese el subtipo de documento.",
        "214": "Por favor ingrese su número de documento.",
        "220": "Hubo un error al identificar el banco.",
        "221": "Por favor ingrese la identificación de su tarjeta.",
        "224": "Por favor ingrese el código de seguridad de su tarjeta.",
        "E301": "El número de tarjeta que ha ingresado no es válido.",
        "E302": "El código de seguridad que ha ingresado no es válido.",
        "316": "El nombre que ha ingresado no es válido.",
        "322": "El tipo de documento es inválido.",
        "323": "El subtipo de documento es inválido.",
        "324": "El número de documento es inválido.",
        "325": "El mes de expiración de la tarjeta es inválido",
        "326": "El año de expiración de la tarjeta es inválido",
        "other": "Hubo un error al comprobar los datos. Por favor, revise los datos ingresados e intente nuevamente."
    }


    $scope.generateOrder = function () {
        if (inputsValid()) {

            if ($scope.deliverySelected() && DataService.activeBranchContactHasDeliveryZonesAvailable() && $scope.deliveryNotReachable()) {
                new Android_Toast({content: "No se puede generar este pedido, no llegamos a la dirección de envío que ingresó."});
            } else if ($scope.deliverySelected() && DataService.activeBranchContactHasDeliveryZonesAvailable() && $scope.chargesDeliveryFeeForDeliveryZone() && !$scope.isOrderPriceOverDeliveryZoneMinimumOrderPrice()) {
                new Android_Toast({content: "No se puede generar este pedido, el monto del pedido debe ser mayor a $" + DeliveryZoneService.getReachableDeliveryZone().minimumOrderPrice + "."});
            }

            $scope.disableCheckoutButton = true;
            const selectedBranchContactID = DataService.getSelectedBranchContact().id;

            function isCurrentlySelectedBranchOpen() {
                const branches = DataService.getActiveBranchContacts();
                const branch = branches.find(branch => branch.id === selectedBranchContactID);

                return DataService.isOpen(branch);
            }

            let dinerOrder = {};

            FetchService.getBranch()
                .then(() => {
                    if (!isCurrentlySelectedBranchOpen()) {
                        throw {message: "El restaurant está cerrado.", fireAnalytics: false};
                    }

                    if (!$scope.mercadoPagoPaymentSelected()) {
                        return new Promise(resolve => resolve(""));
                    } else {
                        return getCardTokenPromise();
                    }
                })
                .then(cardToken => {
                    return registerOrder(cardToken);
                })
                .then(response => {
                    dinerOrder = response.data
                    return AuthService.persistAddresses();
                })
                .then(() => {

                    let data = {
                        dinerOrder,
                        wasCashPayment: $scope.cashPaymentSelected(),
                        wasMercadoPagoPayment: $scope.mercadoPagoPaymentSelected() && $scope.hasMercadoPago(),
                        wasOtherPayment: $scope.otherPaymentSelected() && !$scope.hasMercadoPago(),
                        wasMercadoPagoCheckoutProPayment: $scope.mercadoPagoCheckoutProPaymentSelected() && $scope.hasMercadoPago()
                    }

                    if (!$scope.mercadoPagoCheckoutProPaymentSelected())
                        new Android_Toast({content: "Orden registrada con éxito! En breve te enviaremos un mail de confirmación."})
                    else
                        data.mercadoPagoPublicKey = selectedBranchContact.deliveryConfig.onlinePayment.publicKey;

                    ModalService.openCheckoutCompleteModal(data)
                })
                .catch(err => {
                    // error formulario MP
                    const causes = err.cause;

                    if (causes) {
                        const cause = causes[0];
                        let causeMessage = MP_INPUT_ERROR_MAP[cause.code];
                        if (!causeMessage) causeMessage = MP_INPUT_ERROR_MAP["other"];
                        new Android_Toast({content: causeMessage});
                        console.error(causes);
                        return;
                    }

                    const raw = err.data != null ? err.data.message : null;
                    if (raw) {
                        let clean = MP_ERROR_MAP[raw];

                        if (!clean) clean = raw;

                        new Android_Toast({content: clean});
                        console.error(err);
                        return;
                    }

                    console.error(err)
                })
                .finally(() => {
                    if (dinerOrder.code === null) {
                        dinerOrder.code = "UNDEFINED";
                    }

                    if (!$scope.mercadoPagoCheckoutProPaymentSelected())
                    {
                        fireAnalyticsPurchaseEvent(dinerOrder.code);
                        $scope.safeApply();
                    }

                    $scope.disableCheckoutButton = false;
                })
        }
    }

    $scope.isOrderPriceOverDeliveryZoneMinimumOrderPrice = () => {
        return DeliveryZoneService.getReachableDeliveryZone().minimumOrderPrice < getOrderPrice()
    }

    function registerOrder(cardToken) {
        let diner = $scope.diner;
        if ($scope.user) {
            diner.mobileNumber = $scope.user.cellPhone;
        } else {
            diner.mobileNumber = getFullIntlTelephone();
        }

        // the names of ordertypes changed in the backend when we changed to multimenu
        // but we still need the old names for the order panel
        const orderTypeMap = {
            TAKEAWAY: "TAKE_AWAY_ORDER",
            DELIVERY: "DELIVERY_ORDER",
            INPLACE: "IN_PLACE_ORDER"
        }

        let payment = {};

        if ($scope.cashPaymentSelected()) {
            payment = {
                "@type": "CashPayment",
                amount: $scope.totalOrderPrice(),
                cashAmount: $scope.order.cashAmount
            };
        } else {
            if ($scope.mercadoPagoPaymentSelected()) {
                payment = {
                    "@type": "MercadoPagoPayment",
                    amount: $scope.totalOrderPrice(),
                    token: cardToken,
                    paymentMethod: document.getElementById("paymentMethodId").value
                };
            } else if ($scope.mercadoPagoCheckoutProPaymentSelected()) {
                payment = {
                    "@type": "MercadoPagoCheckoutProPayment",
                    amount: $scope.totalOrderPrice(),
                    paymentBeingProcessed: true
                };
            } else {
                payment = {
                    "@type": "OtherPayment",
                    amount: $scope.totalOrderPrice()
                };
            }
        }


        let body = {
            type: orderTypeMap[$scope.selectedOrderType()],
            price: $scope.totalOrderPrice(),
            deliveryFee: $scope.getDeliveryFee(),
            paymentType: $scope.selectedPaymentMethod(),
            branchContact: {id: selectedBranchContact.id},
            mobileNumber: getFullIntlTelephone(),
            diner: diner,
            address: $scope.myAddress().address,
            clarifications: $scope.myAddress().details,
            betweenStreets: $scope.myAddress().betweenStreets,
            attribution: AttributionService.getAttributionObject(),
            orderedPlates: CartToOrderService.cartToOrder(),
            payment,
            comment: $scope.restaurantComment,
            scheduledDate: $scope.selectedDeliveryDate,
            locationReference: $scope.order.locationReference
        }

        let url = `/api/order`;
        return RequestService.post(url, body);
    }

    const fireAnalyticsPurchaseEvent = (orderId) => {
        GoogleAnalyticsService.firePurchaseEvent(orderId, getOrderPrice(), $scope.selectedOrderType(), $scope.totalOrderPrice() - getOrderPrice());
    }

    // Cellphone selector Logic
    $scope.intlTelInput = {};

    const initializeIntlTelInput = (telInputId) => {
        const input = document.getElementById(telInputId);

        $scope.intlTelInput[telInputId] = intlTelInput(input, {
            initialCountry: DataService.getLanguageAndRegion().isoCode,
            preferredCountries: ["ar", "uy"],
            autoHideDialCode: false,
            formatOnDisplay: true,
            separateDialCode: true
        });

        input.addEventListener("input", () => {
            $scope.$apply();
        })
    }
    initializeIntlTelInput("intlCheckoutPhone");

    const getFullIntlTelephone = () => {
        if ($scope.user) return $scope.user.cellPhone;
        return $scope.intlTelInput.intlCheckoutPhone.getNumber();
    }

    const formatNumberOutputString = (value, nicCode) => {

        if (typeof value === 'string' || value instanceof String)
            value = value.replace(',', '.');
        value = parseFloat(parseFloat(value).toFixed(2))

        if ($scope.isDecimalsShow())
            return value.toLocaleString(nicCode);
        else
            return parseFloat(Math.trunc(value)).toLocaleString(nicCode)

    }

    function formatNumberOutput(value) {
        if ($scope.isDecimalsShow())
            return value;
        else
            return Math.trunc(value)
    }

    $scope.shouldHideYourDataHeader = () => $scope.takeAwaySelected() && $scope.isLoggedIn();

    /* --------------------- MERCADOPAGO --------------------- */
    function mercadoPagoInit() {
        if (!hasMercadoPago()) return;

        $timeout(function () {
            window.Mercadopago.setPublishableKey(selectedBranchContact.deliveryConfig.onlinePayment.publicKey);
            window.Mercadopago.getIdentificationTypes();
            // document.getElementById("cardNumber").addEventListener("change", guessPaymentMethod);
        });
    }

    mercadoPagoInit();


    function guessPaymentMethod(event) {
        let cardnumber = document.getElementById("cardNumber").value;
        if (cardnumber.length >= 6) {
            let bin = cardnumber.substring(0, 6);
            window.Mercadopago.getPaymentMethod({
                "bin": bin
            }, setPaymentMethod);
        }
    }

    function setPaymentMethod(status, response) {
        if (status == 200) {
            let paymentMethod = response[0];
            document.getElementById("paymentMethodId").value = paymentMethod.id;

            // $scope.paymentMethod = paymentMethod.payment_type_id;
            // $scope.paymentMethod.image = paymentMethod.secure_thumbnail;
            // $scope.paymentMethod.image = "https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif"
            $scope.$apply();
            // getIssuers(paymentMethod.id);
        } else {
            alert(`payment method info error: ${response}`);
        }
    }

    function getCardTokenPromise() {
        let $form = document.getElementById("paymentForm");
        return new Promise((resolve, reject) => {
            window.Mercadopago.clearSession();
            window.Mercadopago.createToken($form, (status, response) => {
                if (status == 200 || status == 201) {
                    let form = document.getElementById("paymentForm");
                    let card = document.createElement("input");
                    card.setAttribute("name", "token");
                    card.setAttribute("type", "hidden");
                    card.setAttribute("value", response.id);
                    form.appendChild(card);
                    resolve(card.value);
                } else {
                    reject(response)
                }
            });
        })
    }

    $scope.getUserEmail = () => {
        if ($scope.isLoggedIn()) {
            return $scope.user.email;
        } else {
            return $scope.diner.email;
        }
    }

    function hasMercadoPago() {
        return selectedBranchContact.deliveryConfig.onlinePayment.providerName === "MERCADO_PAGO"
    }

    $scope.hasMercadoPago = hasMercadoPago;

    $scope.scheduledOrderAvailable = () => {
        return OrderModesService.getCurrentBranchOrderMode().scheduledOrderEnabled &&
            selectedBranchContact.deliveryConfig.workingDays.length > 0;
    }


    // toda la parte de orderText fue deprecada, pero el código permanece por las dudas
    // deprecated
    //---------- GENERACION DE PEDIDO -------------
    // function addBranchInfo() {
    //     if (DataService.getActiveBranchContacts() > 1) {
    //         return ` para el local ${selectedBranchContact.name} - ${$scope.getBranchContactFormattedAddress(selectedBranchContact)}`;
    //     } else {
    //         return '';
    //     }
    // }
    //
    // function generateFirstLine(code, type) {
    //     let text = `Hola! Este es un pedido de *${type}*`;
    //     if (code != undefined) text = `Hola! Este es el pedido ${code} de *${type}*`;
    //     return text;
    // }
    //
    // function generateLuveatSourceText(){
    //     let text = '';
    //     if (AttributionService.isLuveatSource()) text += `*Pedido procesado por Luveat*\r\n\r\n`;
    //     return text;
    // }
    //
    // function generateDeliveryHeader(code) {
    //     let text = generateFirstLine(code, 'DELIVERY');
    //     text += addBranchInfo();
    //     if ($scope.diner.name) {
    //         text += `\r\n`;
    //         text += `\r\nA nombre de: *${$scope.diner.name}*`;
    //     }
    //     text += "\r\n";
    //     text += `\r\nNúmero: *${getFullIntlTelephone()}*`;
    //     text += "\r\n";
    //
    //     text += `\r\nDirección de envío: *${$scope.myAddress().address}* \r\n`;
    //     if ($scope.myAddress().details) text += `Aclaraciones: *${$scope.myAddress().details}*\r\n`;
    //     if ($scope.myAddress().betweenStreets) text += `Entrecalles: *${$scope.myAddress().betweenStreets}*\r\n`;
    //     return text;
    // }
    //
    // function generateTakeAwayHeader(code) {
    //     let text = generateFirstLine(code, 'TAKE AWAY');
    //     text += addBranchInfo();
    //     text += "\r\n";
    //     text += `\r\nA nombre de: *${$scope.diner.name}*`;
    //
    //     text += "\r\n";
    //     text += `\r\nNúmero: *${getFullIntlTelephone()}*`;
    //     text += "\r\n";
    //     return text;
    // }
    //
    // function generateInPlaceOrderHeader(code) {
    //     let text = "Hola! Este es un pedido *EN EL LOCAL*";
    //     if (code != undefined) text = `Hola! Este es el pedido ${code} *EN EL LOCAL*`;
    //
    //     text += addBranchInfo();
    //     text += "\r\n";
    //     text += "\r\nPara la mesa:\r\n"
    //     text += `*${$scope.order.tableNumber}* \r\n`;
    //
    //     text += `\r\nA nombre de: *${$scope.diner.name}*`;
    //
    //     text += "\r\n";
    //     text += `\r\nNúmero: *${getFullIntlTelephone()}*`;
    //     text += "\r\n";
    //
    //     return text;
    // }
    //
    // function orderText(code) {
    //     let text = window.encodeURIComponent(generateHeader(code));
    //     text += CartFactory.stringifyCartToWsp();
    //     text += window.encodeURIComponent(addDeliveryCharge());
    //     text += window.encodeURIComponent(addPaymentInfo());
    //     return text;
    // }
    //
    // function generateHeader(code) {
    //     if ($scope.user) $scope.diner.name = $scope.user.name;
    //
    //     let text = generateLuveatSourceText();
    //
    //     if ($scope.inPlaceOrderSelected()) text += generateInPlaceOrderHeader(code);
    //     if ($scope.deliverySelected()) text += generateDeliveryHeader(code);
    //     if ($scope.takeAwaySelected()) text += generateTakeAwayHeader(code);
    //
    //     return text;
    // }
    //
    // function addPaymentInfo() {
    //     let text = "";
    //     if ($scope.cashPaymentSelected()) {
    //         text += "\r\n";
    //         text += `\r\nAbono en efectivo con ${$scope.getCurrency()} ${formatNumberOutputString($scope.order.cashAmount, "es")}`;
    //         let dif = parseFloat($scope.order.cashAmount.replace(',','.')) - $scope.totalOrderPrice();
    //         text += `\r\n\r\nVuelto: ${$scope.getCurrency()} ` + formatNumberOutputString(dif, "es");
    //     }
    //     if ($scope.otherPaymentSelected() && !$scope.onlinePaymentRegistered()) {
    //         text += "\r\n";
    //         text += `\r\nPago con tarjeta/otro`;
    //     }
    //     else if ($scope.otherPaymentSelected() && $scope.onlinePaymentRegistered()) {
    //         text += "\r\n";
    //         text += `\r\nPago con MercadoPago`;
    //     }
    //     return text;
    // }
    //
    // function addDeliveryCharge() {
    //     let text = "";
    //     if ($scope.deliverySelected() && $scope.chargesDeliveryFeeForDeliveryZone()) {
    //         text += "\r\n";
    //         text += `\r\nCosto de envío ${$scope.getCurrency()} ${formatNumberOutputString($scope.deliveryFeeForDeliveryZone(),"es")}`;
    //         text += "\r\n";
    //         text += `\r\n*Total ${$scope.getCurrency()} ${formatNumberOutputString($scope.totalOrderPrice(), "es")}*`;
    //     }else if ($scope.deliverySelected() && $scope.chargesDeliveryFee()){
    //         text += "\r\n";
    //         text += `\r\nCosto de envío ${$scope.getCurrency()} ${formatNumberOutputString($scope.deliveryFee(),"es")}`;
    //         text += "\r\n";
    //         text += `\r\n*Total ${$scope.getCurrency()} ${formatNumberOutputString($scope.totalOrderPrice(), "es")}*`;
    //     }
    //     return text;
    // }

    /***** MercadoPago CheckOut Pro *******/


    // Inicializa el checkout



});
