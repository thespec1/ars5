dinerApp.controller('addressModalCtrl', function ($scope, $uibModalInstance, $timeout, AddressService, data) {


    let map;

    let autoComplete;

    let marker;

    let input;

    $scope.myAddress = {};

    const myLatLng = { lat: -34.583796, lng: -58.439640 };

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

            }
        };

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: new google.maps.LatLng(myLatLng.lat, myLatLng.lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        initializeMarkerMap();

        input = document.getElementById('addressAutocomplete');

        autoComplete = new google.maps.places.Autocomplete(input);
        autoComplete.bindTo('bounds', map);
        autoComplete.setFields(['address_components', 'geometry', 'icon', 'name']);
        autoComplete.setTypes(['address']);

        autoComplete.addListener('place_changed', () => setMarkerMap());

    });


    const setMarkerMap = () => {

        if (marker) marker.setMap(null);

        let place = autoComplete.getPlace();
        if (place.geometry) {
            applyMarkerMap(place.geometry.location);
        } else {

            let geocoder = new google.maps.Geocoder();

            geocoder.geocode({
                    'address': input.value
                },
                function (result, status) {
                    if (status === 'OK') {
                        applyMarkerMap(result[0].geometry.location);
                        input.value = result[0].formatted_address;
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


    const inputValid = (place, address) => {
            if (!address || !place || !place.geometry || !place.geometry.location || !place.geometry.location.lat || !place.geometry.location.lng) {
                new Android_Toast({content: 'Asegurese de haber ingresado la dirección correctamente.'});
                return false;
            }
            return true;
        }
    ;

    $scope.saveAddress = () => {

        let place = autoComplete.getPlace();
        let address = input.value;

        if (!place || !place.geometry) {

            let geocoder = new google.maps.Geocoder();

            geocoder.geocode({'address': address},
                function (result, status) {
                    if (status === 'OK') {
                        place = result[0];
                        address = place.formatted_address;
                        saveGlobalAddress(place, address);
                        $uibModalInstance.dismiss('cancel');
                    } else {
                        inputValid(place, address);
                    }
                });

        } else {
            saveGlobalAddress(place, address);
            $uibModalInstance.dismiss('cancel');
        }
    };

    const saveGlobalAddress = (place, address) => {
        if (inputValid(place, address)) {
            $scope.myAddress.address = address;
            $scope.myAddress.lat = place.geometry.location.lat();
            $scope.myAddress.lng = place.geometry.location.lng();
            AddressService.saveAddressObject($scope.myAddress, true);
        }
    };



    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };
})
;
