dinerApp.service('ModalService', function ($uibModal) {

    const openModal = (templateUrl, controller, data) => {
        this.modalInstance = $uibModal.open({
            animation: true,
            templateUrl: templateUrl,
            controller: controller,
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: () => data
            }
        });
        return this.modalInstance;
    }

    this.openAddressModal = data => {
        return openModal('/web/modals/address', 'addressModalCtrl', data);
    }

    this.openEmptyCartConfirmationModal = data => {
        return openModal('/web/modals/emptyCart', 'emptyCartModalCtrl', data);
    }

    this.openBranchContactScheduleModal = data => {
        return openModal('/web/modals/branchContactSchedule', 'branchContactScheduleModalCtrl', data);
    }

    this.openDeliveryZonesModal = data => {
        return openModal('/web/modals/deliveryZones', 'deliveryZonesModalCtrl', data);
    }

    this.openPlateDetailModal = data => {
        return openModal('/web/modals/plateDetail', 'plateDetailModalCtrl', data)
    }

    this.openCheckoutCompleteModal = data => {
        return openModal('/web/modals/checkoutComplete', 'checkoutCompleteModalCtrl', data)
    }

    this.openDeliveryScheduleModal = data => {
        return openModal('/web/modals/deliverySchedule', 'deliveryScheduleModalCtrl', data)
    }

    this.openModal = function (templateUrl, controller, size, data) {
        this.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: templateUrl,
                controller: controller,
                backdrop: 'static',
                keyboard: true,
                resolve: {
                    data: () => data
            },
            size: size
    });
        return this.modalInstance;
    }
});
