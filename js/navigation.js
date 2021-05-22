dinerApp.service("NavigationService", function (DataService) {
    var showBackButton = false;
    const backButtonActionStack = [];
    var backButtonAction = undefined;

    this.setBackButtonAction = action => {
        if (backButtonAction) {
            backButtonActionStack.push(backButtonAction);
        }

        backButtonAction = action;

        showBackButton = true;
    };

    this.hideBackButton = () => {
        showBackButton = false;
    };

    this.unhideBackButton = () => {
        showBackButton = true;
    };

    this.showBackButton = () => {
        return showBackButton;
    };

    this.backButtonAction = () => {
        backButtonAction();

        backButtonAction = backButtonActionStack.pop();

        if (!backButtonAction) {
            showBackButton = false;
        }
    };

    // -------------- habilitacion de back button para entrada como guia -----------
    var guideEntrance = false;

    this.showBranchContactSelectionScreen = () => {
        return DataService.aliasForBranch() && DataService.multipleBranchContacts();
    };

    this.showBranchesGuideScreen = () => {
        return guideEntrance;
    };

    this.setGuideEntrance = () => {
        guideEntrance = true;
    };

    this.setEnterpriseEntrance = () => {
        guideEntrance = false;
    };

});
