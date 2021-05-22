dinerApp.controller("headerCtrl", function ($scope, $rootScope, $timeout, DataService, DiscountService, ModalService, GoogleAnalyticsService, OrderModesService) {

    $scope.branchContact = DataService.getSelectedBranchContact();
    $scope.branch = DataService.getBranch();

    function emitHeaderLoaded() {
        DataService.setHeaderLoaded(true);
        $rootScope.$broadcast("headerLoadStateChange")
    }
    emitHeaderLoaded();

    function getBGImage() {
        if ($scope.branchContact.bannerImageUrl) return `linear-gradient(rgba(0, 0, 0, .6), rgba(0, 0, 0, .6)), url(${$scope.branchContact.bannerImageUrl})`;
        else return "url(/assets/images/restaurant_default_banner.png)";
    }

    $scope.headerBG = {
        'background-color': `black`,
        'background-image': getBGImage(),
        'background-position': 'center',
        'background-size': 'cover'
    };

    $scope.openBubbleColor = {
        "background-color": DataService.isOpen($scope.branchContact) ? "#47b247" : "#e54545"
    }

    $scope.clickableScheduleButton = {
        "cursor": DataService.activeBranchContactHasSchedule() ? "pointer" : "default",
        "text-decoration": DataService.activeBranchContactHasSchedule() ? "underline" : "none"
    }

    $scope.shouldShowScheduleChevron = () => DataService.activeBranchContactHasSchedule();

    $scope.showScheduleModal = () => {
        if (!DataService.activeBranchContactHasSchedule()) return;

        const data = { branchContact: $scope.branchContact };
        ModalService.openBranchContactScheduleModal(data);
    };

    $scope.showDeliveryZonesModal = () => {
        var data = { branchContact: $scope.branchContact };
        ModalService.openDeliveryZonesModal(data);
    };

    $scope.getBranchContactFormattedAddress = branchContact => DataService.getBranchContactFormattedAddress(branchContact);

    $scope.hasSchedule = DataService.activeBranchContactHasSchedule;

    $scope.getCustomMessage = () => DataService.getCustomMessage();
    $scope.showDiscountsMenuEntry = DiscountService.showDiscountsMenuEntry;

    $scope.hasCallPhone = DataService.activeBranchContactHasCallPhone;

    $scope.hasWspPhone = DataService.activeBranchContactHasWspPhone;

    $scope.hasFb = DataService.activeBranchHasFb;

    $scope.hasIg = DataService.activeBranchHasIg;

    $scope.hasDeliveryZones = () => DataService.activeBranchContactHasDeliveryZones()

    $scope.hasDeliveryZonesAvailable = () => DataService.activeBranchContactHasDeliveryZonesAvailable();

    $scope.deliveryAvailable = () => OrderModesService.deliveryAvailable();

    $scope.social = DataService.getSocial();


    const call = (phone) => {
        document.location.href = `tel:${phone}`;
    };

    const generateWspShareMsg = () => {
        let text = "Esta carta es para ti! \r\n\r\n"
        text += window.location.hostname + `/menu/${DataService.getAlias()}`;
        text = window.encodeURIComponent(text);
        return text;
    }

    const whatsapp = phone => {
        document.location.href = `https://api.whatsapp.com/send?phone=${phone}`;
    };

    $scope.callPhone = () => {
        call($scope.branchContact.callPhone);
    };

    $scope.openWspPhone = () => {
        GoogleAnalyticsService.fireWhatsappButtonPressEvent();
        whatsapp($scope.branchContact.whatsAppPhone);
    };

    $scope.showDiscountsScreen = () => {
        $scope.$parent.$emit('showDiscounts', {});
    };


    $scope.openFb = () => {
        document.location.href = `http://facebook.com/${$scope.social.facebook}`;
    }

    $scope.openIg = () => {
        document.location.href = `http://www.instagram.com/${$scope.social.instagram}`;
    }

    $scope.shareWsp = function () {
        document.location.href = `https://api.whatsapp.com/send?text=${generateWspShareMsg()}`;
    }

    $scope.hasAtLeastOneIcon = function () {
        return $scope.hasIg() || $scope.hasFb() || $scope.hasCallPhone()
            || $scope.hasWspPhone() || $scope.hasSchedule() || $scope.showDiscountsMenuEntry();
    };

    $scope.shareBoxOpen = false;
    let animating = false;
    const ANIMATION_DURATION_MS = 600 * 0.9; // make the js time smaller since timeouts are generally longer

    $scope.isShareBoxOpen = () => $scope.shareBoxOpen;

    $scope.toggleShareBox = () => {
        if (animating) return;

        animating = true;
        $timeout(() => {
            animating = false;
        }, ANIMATION_DURATION_MS)

        if ($scope.shareBoxOpen) {
            // leaving
            const container = document.getElementById("menuSocialsIconContainer")
            // https://stackoverflow.com/questions/22093141/adding-class-via-js-wont-trigger-css-animation
            container.classList.remove("menuSocialsIconContainerAnimation")
            void container.offsetWidth; // reading the property requires a recalc
            container.classList.add("menuSocialsIconContainerAnimationReverse")

            $timeout(() => {
                $scope.shareBoxOpen = !$scope.shareBoxOpen;
            }, ANIMATION_DURATION_MS)
        } else {
            // entering
            $scope.shareBoxOpen = !$scope.shareBoxOpen;
        }
    }

});
