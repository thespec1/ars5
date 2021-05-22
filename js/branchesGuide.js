dinerApp.service('BranchesGuideService', function (ScreenService) {
    var branches = [];
    var moreBranchesToFetch = true;

    this.getBranches = () => {
        return branches;
    };

    this.setBranches = (val) => {
        branches = val;
    };

    this.appendBranches = (items) => {
        for (let item of items) {
            branches.push(item);
        }
    };

    this.resetBranchesGuide = () => {
        branches = [];
        moreBranchesToFetch = true;
        ScreenService.resetBranchesGuideStatus();
    };

    this.moreBranchesToFetch = () => {
        return moreBranchesToFetch;
    };

    this.setNoMoreBranchesToFetch = () => {
        moreBranchesToFetch = false;
    };
});