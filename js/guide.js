// TODO delete this
dinerApp.controller("guideCtrl", function ($scope, ModalService, AddressService, DataService, $timeout, ScreenService, BranchesGuideService, RequestService) {

    $scope.addressService = AddressService;

    $scope.getBranchContactOrderOptions = branchContact => {
        let str = "";

        // if (!this.hasOrderOptions(branchContact)) {
        //     return "Menú informativo";
        // }

        if (branchContact.deliveryConfig.inPlaceOrder) str += "Pedidos en el local - ";
        if (branchContact.deliveryConfig.deliveryOrder) str += "Delivery - ";
        if (branchContact.deliveryConfig.takeAwayOrder) str += "Take Away - ";
        if (str.length > 0) str = str.slice(0, -3);
        return str;
    };

    $scope.getBranchContactFormattedAddress = branchContact => DataService.getBranchContactFormattedAddress(branchContact);

    $timeout(function () {
        ScreenService.setPreviousBranchesGuideOffset();
    });

    $scope.showAddressModal = () => {
        var data = {};
        ModalService.openAddressModal(data)
            .closed
            .then(function () {
                $scope.resetingList = true;
                $timeout(() => { $scope.resetingList = false; }, 1000);
            });
    };

    $scope.resetingList = false;

    $scope.getBranches = BranchesGuideService.getBranches;
    $scope.fetchingBranches = false;

    $scope.addItems = () => {
        if (BranchesGuideService.moreBranchesToFetch()) {
            $scope.fetchingBranches = true;
            let obj = {
                lat: AddressService.getLat(),
                lng: AddressService.getLng(),
                pagingOption: {
                    offset: $scope.getBranches().length,
                    pageSize: 10
                }
            }
            RequestService.post('/api/menu/near', obj)
                .success(data => {
                    BranchesGuideService.appendBranches(data.commerces);
                    if (data.pageSize == 0) BranchesGuideService.setNoMoreBranchesToFetch();
                    $scope.fetchingBranches = false;
                })
                .error(error => {
                    $scope.fetchingBranches = false;
                });
        }
    };

    $scope.branchContactClicked = (branchContact) => {
        let alias = (branchContact.branchContact.alias) ? branchContact.branchContact.alias : branchContact.branch.alias;
        DataService.setAlias(alias);
        ScreenService.saveBranchesGuideOffset();
        $scope.$parent.$emit('goToBranchContact', {});
    };
});