dinerApp.controller('deliveryZonesModalCtrl', function ($scope, $uibModalInstance, $timeout, AddressService, DeliveryZoneService, data, DataService, AuthService, CartFactory) {
    // processPlace -> setReachableDeliveryZone -> saveGlobalAddress -> temporarilySaveAddressToCurrentUser

    $scope.branchContact = data.branchContact;
    $scope.deliveryZone = DeliveryZoneService.getReachableDeliveryZone();
    $scope.paymentProgress = { width: "0%" }
    updatePaymentProgress();

    let map;

    let myLatLng;

    let autoComplete;

    let marker;

    let input;

    $scope.myAddress = {};

    $timeout(() => {
        const initializeMarkerMap = () => {

            if (AddressService.validAddress()) {
                let markerPosition = new google.maps.LatLng(AddressService.getLat(), AddressService.getLng());

                if (marker) marker.setMap(null);

                marker = new google.maps.Marker({
                    position: markerPosition
                });

                marker.setMap(map);
                marker.setVisible(true);

                map.setCenter(markerPosition);
                map.setZoom(15);

                $scope.myAddress.address = AddressService.getAddress();
                $scope.myAddress.betweenStreets = AddressService.getBetweenStreets();
                $scope.myAddress.details = AddressService.getDetails();

                // setReachableDeliveryZone(markerPosition);

            }
        };

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: new google.maps.LatLng($scope.branchContact.gaddress.lat, $scope.branchContact.gaddress.lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });


        if ($scope.hasDeliveryZonesAvailable()) drawDeliveryZones();


        initializeMarkerMap();

        input = document.getElementById('addressAutocomplete');

        // autoComplete = new google.maps.places.SearchBox(input);

        autoComplete = new google.maps.places.Autocomplete(input);
        autoComplete.bindTo('bounds', map);
        autoComplete.setFields(['address_components', 'geometry', 'icon', 'name']);
        autoComplete.setTypes(['address']);


        autoComplete.addListener('place_changed', () => setMarkerMap());


    });


    const setMarkerMap = () => {

        $scope.directionNotFetched = false;

        DeliveryZoneService.setReachableDeliveryZone(undefined, undefined);
        if (marker) marker.setMap(null);

        let place = autoComplete.getPlace();
        if (place.geometry) {
            const address = input.value;
            processPlace(place, address, true);
            applyMarkerMap(place.geometry.location);
        } else {
            let autocompleteService = new google.maps.places.AutocompleteService();

            let geocoder = new google.maps.Geocoder();

            geocoder.geocode({
                    'address': input.value
                },
                function (result, status) {
                    if (status === 'OK') {
                        place = result[0];
                        const address = place.formatted_address;

                        processPlace(place, address, true);
                        updatePaymentProgress();
                        applyMarkerMap(result[0].geometry.location);
                        input.value = address;
                    }
                });
        }
    };

    const applyMarkerMap = (coordinate) => {
        map.panTo(coordinate);
        map.setZoom(15);
        marker = new google.maps.Marker({
            position: coordinate
        });
        marker.setMap(map);
        marker.setVisible(true);
    };

    const setReachableDeliveryZone = (coordinate) => {
        if (!$scope.hasDeliveryZonesAvailable()) {
            DeliveryZoneService.setReachableDeliveryZone($scope.branchContact.deliveryConfig.deliveryFee, 0);
            return true;
        }

        const dzs = $scope.branchContact.deliveryConfig.deliveryZones;
        const zone = DeliveryZoneService.getBestDeliveryZone(dzs, coordinate);
        const reached = zone !== undefined;

        if (reached) {
            DeliveryZoneService.setReachableDeliveryZone(zone.deliveryFee, zone.minimumOrderPrice);
            new Android_Toast({content: 'Llegamos a su dirección.'});
        } else {
            new Android_Toast({content: 'No llegamos a su dirección.'});
        }

        return reached;
    };

    const inputValid = (place, address) => {
        if (!address || !place || !place.geometry || !place.geometry.location || !place.geometry.location.lat || !place.geometry.location.lng) {
            new Android_Toast({content: 'Asegurese de haber ingresado la dirección correctamente.'});
            return false;
        }
        return true;
    };

    function processPlace(place, address, keepOpen) {
        const reaches = setReachableDeliveryZone(place.geometry.location);

        if (reaches) {
            saveGlobalAddress(place, address);
            updatePaymentProgress();
            if (!keepOpen) {
                temporarilySaveAddressToCurrentUser(address, place);
                $uibModalInstance.dismiss("cancel");
            } else {
                $scope.$apply();
            }
        } else {
            $timeout(() => {
                AddressService.reset();
                DeliveryZoneService.setReachableDeliveryZone(undefined, undefined);
            })
        }

        $scope.directionNotFetched = false;
    }

    $scope.saveAddress = () => {

        if (!$scope.myAddress.details)
            new Android_Toast({content: "Para continuar debe incluir los detalles de su Piso/Depto/Etc"});
        else{
            $scope.directionNotFetched = true;

            let place = autoComplete.getPlace();
            let address = input.value;

            if (!place || !place.geometry) {
                let geocoder = new google.maps.Geocoder();
                geocoder.geocode({'address': address},
                    function (result, status) {
                        if (status === 'OK') {
                            place = result[0];
                            address = place.formatted_address;

                            processPlace(place, address);
                        } else {
                            new Android_Toast({ contents: "Error al contactarse con el servidor de Google. Intente nuevamente."})
                        }

                        $scope.$apply(() => $scope.directionNotFetched = false);
                    });
            } else {
                processPlace(place, address);
            }
        }

    };

    function temporarilySaveAddressToCurrentUser(address, place) {
        if (AuthService.isLoggedIn()) {
            let response = {
                fullAddress: address,
                clarifications: $scope.myAddress.details,
                betweenStreets: $scope.myAddress.betweenStreets
            };

            for (let component of place.address_components) {
                for (let type of component.types) {
                    switch (type) {
                        case "street_number":
                            response.number = component.long_name;
                            break;
                        case "route":
                            response.street = component.long_name;
                            break;
                        case "administrative_area_level_1":
                            response.city = component.long_name;
                            break;
                        case "administrative_area_level_2":
                            response.locality = component.long_name;
                            break;
                        case "country":
                            response.countryCode = component.short_name;
                            response.country = component.long_name;
                            break;
                    }
                }
            }
            response.lat = place.geometry.location.lat();
            response.lng = place.geometry.location.lng();
            AuthService.addAddress(response);
        }
    }

    const saveGlobalAddress = (place, address) => {
        if (inputValid(place, address)) {
            $scope.myAddress.address = address;
            $scope.myAddress.lat = place.geometry.location.lat();
            $scope.myAddress.lng = place.geometry.location.lng();
            AddressService.saveAddressObject($scope.myAddress, false);
        }
    };

    const drawDeliveryZones = () => {

        $scope.branchContact.deliveryConfig.deliveryZones.forEach(dz => {
            if (!dz.disabled) {
                let shape = DeliveryZoneService.deliveryZoneToGoogleShape(dz);
                dz.gShape = shape;
                shape.setMap(map);
            }
        });

    };

    // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
        const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
        const r = parseInt(color.substring(0, 2), 16); // hexToR
        const g = parseInt(color.substring(2, 4), 16); // hexToG
        const b = parseInt(color.substring(4, 6), 16); // hexToB
        const uicolors = [r / 255, g / 255, b / 255];
        const c = uicolors.map((col) => {
            if (col <= 0.03928) {
                return col / 12.92;
            }
            return Math.pow((col + 0.055) / 1.055, 2.4);
        });
        const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        return (L > 0.179) ? darkColor : lightColor;
    }

    $scope.getDeliveryZoneFillColorStyle = function (deliveryZone) {
        const textColor = pickTextColorBasedOnBgColorAdvanced(deliveryZone.fillColor, "#ffffff", "#000000")
        return {"background-color": deliveryZone.fillColor, "color": textColor};
    };


    $scope.hasDeliveryZonesAvailable = function () {
        return DataService.activeBranchContactHasDeliveryZonesAvailable();
    }

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.getCurrency = () =>{
        return DataService.getLanguageAndRegion().currency;
    }

    $scope.isDecimalsShow = () =>{
        return DataService.getLanguageAndRegion().decimalsShow;
    }

    function updatePaymentProgress() {
        const price = CartFactory.getTotalCartPrice();
        const cost = $scope.deliveryZone.minimumOrderPrice;
        const percentage = Math.min(price / cost * 100, 100);
        $scope.paymentProgress = { width: percentage + "%" }
    }

    $scope.orderPrice = CartFactory.getTotalCartPrice;
    $scope.hasItemsInCart = () => CartFactory.getCart().length > 0;

    $scope.shouldShowDeliveryProgress = () => {
        return $scope.hasDeliveryZonesAvailable() &&
            AddressService.validAddress() &&
            DeliveryZoneService.validReachableDeliveryZone();
    };
});
