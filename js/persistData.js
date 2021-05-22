dinerApp.service('PersistDataService', function (CartFactory, DataService, AddressService, AttributionService, OrderModesService) {

    this.persistData = function () {
        localStorage.setItem('address', AddressService.persistData());


        if (this.inRetrievalTime()) {

            if (!AttributionService.isEmpty()) localStorage.setItem('source', AttributionService.getSource())

            if (!CartFactory.isEmpty()) {
                localStorage.setItem('cart', JSON.stringify(CartFactory.getCart()));
                localStorage.setItem('cartAlias', DataService.getAlias());
                localStorage.setItem('menuID', OrderModesService.getCurrentBranchOrderMode().menu.id);
                localStorage.setItem('orderTypeID', OrderModesService.getCurrentBranchOrderMode().id);
            }
        }
    }

    this.retrieveData = function () {
        const isRefresh = performance.navigation.type;
        if (localStorage.getItem('address') && isRefresh) AddressService.retrieveData(localStorage.getItem('address'));
        
        if (localStorage.getItem('cart') != null && localStorage.getItem('cartAlias') == DataService.getAlias() && isRefresh) {
            CartFactory.setCart(JSON.parse(localStorage.getItem('cart')));
        }

        if (localStorage.getItem('source') && isRefresh) {
            AttributionService.setSource(localStorage.getItem('source'))
        }

        const menuID = localStorage.getItem('menuID');
        if (menuID && isRefresh) {
            OrderModesService.setLastMenuID(Number(menuID));
        }

        const orderTypeID = localStorage.getItem('orderTypeID');
        if (orderTypeID && isRefresh) {
            OrderModesService.setLastOrderModeID(Number(orderTypeID));
        }


        localStorage.clear();
        localStorage.setItem('cartRetrievalTime', new Date());
    }

    this.MAX_TIME_CART_MINS = 60; // 15 minutes

    this.inRetrievalTime = function () {
        let persistenceTime = Date.parse(localStorage.getItem('cartRetrievalTime'));
        let now = new Date();
        var diffMs = (now - persistenceTime); // milliseconds
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        return diffMins < this.MAX_TIME_CART_MINS;
    }

});
