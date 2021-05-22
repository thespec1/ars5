dinerApp.service('ScreenService', function () {

    const getOffset = elementId => {
        return $(elementId).scrollTop();
    }

    const goToPreviousOffset = (elementId, offset) => {
        $(elementId).animate({ scrollTop: offset }, 0);
    }

    // --------------------- menu -------------------

    var categoriesOffset = undefined;
    var platesOffset = undefined;

    var plateListId = '#plates';
    var categoriesListId = '#categories';

    var lastMenuScreen = undefined;
    var lastTabScreen = undefined;

    var remarkedClicked = false;

    this.wasRemarkedClicked = () => { return remarkedClicked; }

    this.remarkedClicked = () => { remarkedClicked = true; };
    this.clearRemarkedClicked = () => { remarkedClicked = false; };

    this.saveCategoriesOffset = function () {
        categoriesOffset = getOffset(categoriesListId);
    };

    this.setPreviousCategoriesOffset = function () {
        if (categoriesOffset != undefined) {
            goToPreviousOffset(categoriesListId, categoriesOffset);
            categoriesOffset = undefined;
        }
    };

    this.savePlatesOffset = function () {
        platesOffset = getOffset(plateListId);
    };

    this.setPreviousPlatesOffset = function () {
        if (platesOffset != undefined) {
            goToPreviousOffset(plateListId, platesOffset);
            platesOffset = undefined;
        }
    };

    this.saveMenuState = function (route) {
        lastMenuScreen = route;
        if (route == '/web/categories') this.saveCategoriesOffset();
        if (route == '/web/plates') this.savePlatesOffset()
    };

    this.getMenuPreviousState = function () {
        var aux = lastMenuScreen;
        lastMenuScreen = undefined;
        return aux;
    };

    this.deleteMenuStatus = function () {
        categoriesOffset = 0;
        platesOffset = undefined;
        lastMenuScreen = undefined;
        remarkedClicked = false;
    };

    this.saveTabsState = function (route) {
        lastTabScreen = route;
    };

    this.getLastTabState = function () {
        var aux = lastTabScreen;
        lastTabScreen = undefined;
        return aux;
    };

    // --------------------- discounts -------------------


    var discountsOffset = undefined;
    var discountOffset = undefined;

    var discountsId = '#discounts';
    var discountId = '#discount';

    this.saveDiscountOffset = function () {
        discountOffset = getOffset(discountId);
    };

    this.setPreviousDiscountOffset = function () {
        if (discountOffset != undefined) {
            goToPreviousOffset(discountId, discountOffset);
            discountOffset = undefined;
        }
    };

    this.saveDiscountsOffset = function () {
        discountsOffset = getOffset(discountsId);
    };

    this.setPreviousDiscountsOffset = function () {
        if (discountsOffset != undefined) {
            goToPreviousOffset(discountsId, discountsOffset);
            discountsOffset = undefined;
        }
    };

    // --------------------- guide -------------------

    var branchesGuideId = "#guideScreen";
    var branchesGuideOffset = undefined;

    this.saveBranchesGuideOffset = function () {
        branchesGuideOffset = getOffset(branchesGuideId);
    };

    this.setPreviousBranchesGuideOffset = function () {
        if (branchesGuideOffset != undefined) {
            goToPreviousOffset(branchesGuideId, branchesGuideOffset);
            branchesGuideOffset = undefined;
        }
    };

    this.resetBranchesGuideStatus = function () {
        branchesGuideOffset = 0;
        goToPreviousOffset(branchesGuideId, branchesGuideOffset);
    };

})