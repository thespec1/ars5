dinerApp.controller("enterpriseCtrl", function ($scope, FetchService, DataService, RequestService, $timeout, AuthService) {

  $scope.enterpriseContent = undefined;

  $scope.safeApply = function (fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  const showBranchContactsSelectionScreen = () => { $scope.enterpriseContent = '/web/branchContactSelection'; $scope.safeApply(); };
  const showBranchContactScreen = () => { $scope.enterpriseContent = '/web/branchContact'; $scope.safeApply(); };

  const branchPromise = FetchService.getBranch();
  const authPromise = AuthService.init();

  Promise.all([branchPromise, authPromise]).then(data => {
    if (DataService.aliasForBranch() && DataService.multipleBranchContacts()) {
      showBranchContactsSelectionScreen();
    } else {
      showBranchContactScreen();
    }
  }).catch((error) => {
    new Android_Toast({ content: error.message });
    $timeout(() => { window.location.href = 'https://info.luveat.com'; }, 2000);
  })

  $scope.$on("showBranchContactScreen", function (event, args) {
    event.stopPropagation();
    showBranchContactScreen();
  });

  $scope.$on("backToBranchesSelection", function (event, args) {
    event.stopPropagation();
    showBranchContactsSelectionScreen();
    AuthService.setPageLoading(true);
  });

  function getToken() {
    const query = window.location.search;
    if (query) {
      const index = query.indexOf("token=");
      let end = query.indexOf("&");

      if (index === -1) return;
      if (end === -1) end = query.length;

      const id = query.substring(index + 6, end);
      return id;
    }
  }

  function clearToken() {
    window.location.search = "";
  }

  const token = getToken()
  if (!token) registerFeedback();

  function registerFeedback() {
    var feedback = {
      refresh: performance.navigation.type,
      device: navigator.platform
    };
    let url = '/api/diner/' + DataService.getAlias() + "/feedback";
    RequestService.post(url, feedback)
      .then(() => {
        const token = getToken();
        if (token) loginWithToken(token);
      });
  }

});

