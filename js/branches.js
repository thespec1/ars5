dinerApp.controller("branchesCtrl", function ($scope, DataService, NavigationService, ModalService, AddressService, DeliveryZoneService) {

    $scope.branchContacts = DataService.getActiveBranchContacts();

    $scope.branchContactsFiltered = $scope.branchContacts;

    $scope.isOpen = branchContact => DataService.isOpen(branchContact);
    $scope.getBranchContactFormattedAddress = branchContact => DataService.getBranchContactFormattedAddress(branchContact);

    function initAddressBar() {
        const input = document.getElementById('addressAutocomplete');

        const autoComplete = new google.maps.places.Autocomplete(input);
        autoComplete.setFields(['address_components', 'geometry', 'icon', 'name']);
        autoComplete.setTypes(['address']);

        autoComplete.addListener('place_changed', () => {
            filterReachableDeliveryBranchContacts(autoComplete.getPlace())
            $scope.$apply()
        });
    }

    initAddressBar();

    $scope.deliveryFilter = false;
    $scope.toggleDeliveryFilter = () => {
        $scope.deliveryFilter = !$scope.deliveryFilter;
        clearFilter();
    }

    $scope.selectBranchContact = branchContact => {
        DataService.setSelectedBranchContact(branchContact);
        $scope.$parent.$emit('showBranchContactScreen', {});
    }

    const goBackToBranchesGuide = () => {
        $scope.$parent.$emit("backToBranchesGuide");
    };

    if (NavigationService.showBranchesGuideScreen()) {
        NavigationService.setBackButtonAction(goBackToBranchesGuide);
    }

    function clearFilter() {
        const autoComplete = document.getElementById('addressAutocomplete');
        autoComplete.value = "";
        $scope.branchContactsFiltered = $scope.branchContacts;
    }

    let filterReachableDeliveryBranchContacts = (place) => {
        let reachableBranchContacts = [];

        $scope.branchContacts.forEach(bc => {
            let coordinate = place.geometry.location;
            let reachable = false;
            $scope.$apply()

            const deliveryOM = bc.orderModes.find(om => om["@type"] === "Delivery")
            const hasDelivery = deliveryOM && deliveryOM.active;

            if (bc.deliveryConfig && hasDelivery) {
                if (bc.deliveryConfig.deliveryZones && bc.deliveryConfig.deliveryZones.length > 0) {
                    bc.deliveryConfig.deliveryZones.forEach(dz => {
                        if (!dz.disabled) {
                            let shape = DeliveryZoneService.deliveryZoneToGoogleShape(dz);
                            if (DeliveryZoneService.googleContainsLocation(coordinate, shape)) {
                                reachable = true;
                            }
                        }
                    });
                } else {
                    // if bc has no delivery zones set, we set reachable to true
                    reachable = true;
                }
            }

            if (reachable) reachableBranchContacts.push(bc);
        });

        $scope.branchContactsFiltered = reachableBranchContacts;
    }
});
