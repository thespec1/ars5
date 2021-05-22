dinerApp.controller("mainCtrl", function (DataService, $scope, NavigationService, PersistDataService, $timeout, CartFactory,
                                          RequestService, AttributionService, AuthService, OrderModesService, $location) {
    $scope.authLoading = () => AuthService.isLoading();
    $scope.isLoggedIn = false;

    $scope.safeApply = function (fn) {
        const phase = this.$root.$$phase;
        if (phase == "$apply" || phase == "$digest") {
            if (fn && (typeof (fn) === "function")) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    function addBackActionIfComingFromMarketplace() {
        const search = $location.search();
        const mkp = search.mkp;

        if (mkp) {
            NavigationService.setBackButtonAction(() => history.go(-2));
            $location.search("mkp", undefined);
            AttributionService.setSource("marketplace");
        }
    }

    addBackActionIfComingFromMarketplace();

    // auth
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

    function loginWithToken() {
        const token = getToken();
        if (!token) return;
        AuthService.loginWithToken(token)
            .then(() => {
                new Android_Toast({content: "Login exitoso!"});
                clearToken();
            })
            .catch(error => {
                if (error.data.message) {
                    new Android_Toast({content: error.data.message});
                }

                setTimeout(clearToken, 2000);
            });
    }

    loginWithToken();

    $scope.$on("AuthServiceLoadStateChange", function () {
        $scope.isLoggedIn = AuthService.isLoggedIn();
        $scope.safeApply();
    });

    const alias = window.location.pathname.split("/")[2];

    const showEnterpriseScreen = () => {
        $scope.content = "/web/enterprise";
    };
    const showGuideScreen = () => {
        $scope.content = "/web/guide";
    };

    if (alias) {
        DataService.setAlias(alias);
        NavigationService.setEnterpriseEntrance();
        showEnterpriseScreen();
        getCustomLogoPath(alias);
    } else {
        NavigationService.setGuideEntrance();
        showGuideScreen();
    }

    initializeData();

    $scope.showBackButton = NavigationService.showBackButton;
    $scope.backButtonClicked = NavigationService.backButtonAction;

    $(window).on("beforeunload", function () {
        PersistDataService.persistData();
    });

    window.addEventListener("pagehide", function () {
        PersistDataService.persistData();
    });


    PersistDataService.retrieveData();

    setIncomingSource();

    function setIncomingSource() {

        if (!AttributionService.sourceExist()) AttributionService.setSourceFromQueryParam();

    }

    function getCustomLogoPath(alias) {
        const url = "/api/diner/" + alias + "/customLogo";
        RequestService.get(url)
            .success(data => {
                if (data.fileImageUrl) {
                    $scope.customLogoPath = data.fileImageUrl;
                }

            });
    }

    function initializeData() {
        const url = "/api/diner/initialization";
        RequestService.get(url)
            .success(data => {
                const initialization = data;

                DataService.getSetInitialization(initialization);

                if (initialization.googlePlacesKey) {
                    let script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "https://maps.googleapis.com/maps/api/js?key=" + initialization.googlePlacesKey + "&libraries=places,drawing,geometry";
                    document.head.appendChild(script);
                }

                if (initialization.googleAnalyticsKey) {
                    let script = document.createElement("script");
                    script.async = true;
                    script.src = "https://www.googletagmanager.com/gtag/js?id=" + initialization.googleAnalyticsKey;
                    document.head.appendChild(script);

                    script = document.createElement("script");
                    script.innerHTML = getGoogleAnalyticsScript(initialization.googleAnalyticsKey);
                    document.head.appendChild(script);
                }

                if (initialization.facebookPixelId) {
                    let script = document.createElement("script");
                    script.innerHTML = getFacebookPixelScript(initialization.facebookPixelId);
                    document.head.appendChild(script);
                }

            });
    }


    function getGoogleAnalyticsScript(googleAnalyticsId) {
        return "window.dataLayer = window.dataLayer || [];" +
            "function gtag() {" +
            "dataLayer.push(arguments);}" +
            "gtag('js', new Date());" +
            `gtag('config','${googleAnalyticsId}');`;
    }

    function getFacebookPixelScript(facebookPixelId) {
        return "!function (f, b, e, v, n, t, s) {" +
            "if (f.fbq) return;\n" +
            "n = f.fbq = function () {\n" +
            "n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)};" +
            "if (!f._fbq) f._fbq = n;" +
            "n.push = n;" +
            "n.loaded = !0;" +
            "n.version = '2.0';" +
            "n.queue = [];" +
            "t = b.createElement(e);" +
            "t.async = !0;" +
            "t.src = v;" +
            "s = b.getElementsByTagName(e)[0];" +
            "s.parentNode.insertBefore(t, s)" +
            "}(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');" +
            `fbq('init', '${facebookPixelId}');` +
            "fbq('track', 'PageView');";
    }


    // jQuery(document).ready(function ($) {

    //     var $trigger = $('#trigger'),
    //         $content_wrapper = $('#body, #content');

    //     //open-close lateral menu clicking on the menu icon
    //     $trigger.on('click', function (event) {
    //         $scope.$apply();
    //         event.preventDefault();
    //         $content_wrapper.toggleClass('offcanvas_open').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
    //         $('#offcanvas').toggleClass('offcanvas_open');
    //     });

    //     //close lateral menu clicking outside the menu itself
    //     $content_wrapper.on('click', function (event) {
    //         if (!$(event.target).is('#trigger, #trigger i, #trigger p')) {
    //             $content_wrapper.removeClass('offcanvas_open').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
    //             $('#offcanvas').removeClass('offcanvas_open');
    //         }
    //     });

    // });


    $timeout(function () {
        setWindowHeight();
    });

    $(window).resize(function () {
        setWindowHeight();
    });

    function setWindowHeight() {
        $("#container").css("height", $(window).height() - $("#navbar").height());
        $(".offcanvas_nav").css("height", $("#container").height() - $("#powered").height());
    }

    $scope.$on("goToBranchContact", function (event, args) {
        showEnterpriseScreen();
    });

    $scope.$on("backToBranchesGuide", function (event, args) {
        DataService.clearData();
        CartFactory.emptyCart();
        showGuideScreen();
    });

    $scope.openLandingPage = () => {
        document.location.href = `https://info.luveat.com`;
    };

    $scope.goToLogin = () => {
        $scope.$broadcast("showAuthThroughMainCart");
    };

    $scope.logOut = () => {
        AuthService.logOut();
    };

    $scope.showLoginButton = () => OrderModesService.hasOrderMode();
});
