dinerApp.controller("menuController", function ($scope, $timeout, NavigationService, ScreenService, ModalService, MenuService, OrderModesService, $location) {
    const categoriesScreen = '/web/categories';
    const platesScreen = '/web/plates';
    const plateDetailScreen = '/web/plates/detail';

    const showScreen = screen => $scope.menuContent = screen;
    const isScreen = screen => $scope.menuContent === screen;

    const setMainScreen = () => {
        showScreen(ScreenService.getMenuPreviousState());
        if (isScreen(undefined)) showScreen(categoriesScreen);
        if (isScreen(categoriesScreen)) setCategoriesBackButton();
        if (isScreen(platesScreen)) NavigationService.setBackButtonAction(goBackToCategories);
        if (isScreen(plateDetailScreen)) setPlateDetailBackCutton();
    }

    setMainScreen();

    function setPlateDetailBackCutton() {
        if (ScreenService.wasRemarkedClicked()) {
            NavigationService.setBackButtonAction(goBackFromRemarked);
        } else {
            NavigationService.setBackButtonAction(goBackToPlates);
        }
    }

    function setMenuAndShowPlateFromQueryParams() {
        const search = $location.search()
        const plate = Number(search.plate);
        const orderMode = search.om;

        if (orderMode) {
            try {
                OrderModesService.setOrder(orderMode.toUpperCase());
            } catch (e) {
                new Android_Toast({content: e.message});
            } finally {
                $location.search("om", undefined);
            }
        }

        if (plate) {
            OrderModesService.findMenuWithPlateID(plate)
                .then(showPlate)
                .catch(e => new Android_Toast({content: e.message}))
                .finally(() => $location.search("plate", undefined));
        }
    }

    function showPlate(plate) {
        if (!plate) return;
        plate.count = 1;
        ModalService.openPlateDetailModal(plate);
    }

    setMenuAndShowPlateFromQueryParams();

    $scope.$on("categoryClicked", function (event, args) {
        event.stopPropagation();
        showScreen(platesScreen);
        NavigationService.setBackButtonAction(goBackToCategories);
    });

    function setCategoriesBackButton() {
        if (NavigationService.showBranchContactSelectionScreen()) {
            NavigationService.setBackButtonAction(goBackToBranchesSelection);
        } else if (NavigationService.showBranchesGuideScreen()) {
            NavigationService.setBackButtonAction(goBackToBranchesGuide);
        } else {
            // NavigationService.hideBackButton();
        }
    }

    $scope.$on('backToDefaultMenu', function (event, args) {
        ScreenService.deleteMenuStatus();
        $scope.$broadcast("scrollCategoriesToTop");
        goBackToCategories();
    });

    function goBackToBranchesSelection() {
        ScreenService.deleteMenuStatus();
        $scope.$broadcast("scrollCategoriesToTop");
        $scope.$parent.$emit("backToBranchesSelection");
    };

    function goBackToBranchesGuide() {
        ScreenService.deleteMenuStatus();
        $scope.$broadcast("scrollCategoriesToTop");
        $scope.$parent.$emit("backToBranchesGuide");
    };

    function goBackToCategories() {
        $scope.menuContent = categoriesScreen;
        setCategoriesBackButton();
    };

    $scope.$on("plateClicked", function (event, args) {
        event.stopPropagation();
        showScreen(plateDetailScreen);
        NavigationService.setBackButtonAction(goBackToPlates);
    });

    function goBackToPlates() {
        showScreen(platesScreen);
        NavigationService.setBackButtonAction(goBackToCategories);
    };

    $scope.$on("plateAddedToCart", function (event, args) {
        event.stopPropagation();
        showScreen(plateDetailScreen);
        NavigationService.setBackButtonAction(goBackToCategories);
    });

    $scope.$on("$destroy", function () {
        ScreenService.saveMenuState($scope.menuContent);
    });


    function goBackFromRemarked() {
        $scope.menuContent = categoriesScreen;
        ScreenService.clearRemarkedClicked();
        setCategoriesBackButton();
    };


    $scope.$on('remarkedClicked', (event) => {
        event.stopPropagation();
        ScreenService.remarkedClicked();
        showScreen(plateDetailScreen);
        NavigationService.setBackButtonAction(goBackFromRemarked);
    });

});
