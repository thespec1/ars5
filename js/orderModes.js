// TODO rename to ordermode
dinerApp.service("OrderModesService", function ($rootScope, DataService, FetchService, MenuService, DiscountService, CartFactory) {
    // for use as a dictionary
    const ORDER_MODES = {
        INPLACE: "INPLACE",
        DELIVERY: "DELIVERY",
        TAKEAWAY: "TAKEAWAY",
        INFORMATIVE: "INFORMATIVE"
    };

    // Contains categories, remarkeds & discounts
    const menus = {
        [ORDER_MODES.INPLACE]: undefined,
        [ORDER_MODES.DELIVERY]: undefined,
        [ORDER_MODES.TAKEAWAY]: undefined,
        [ORDER_MODES.INFORMATIVE]: undefined
    }

    this.setMenu = (orderMode, menu) => menus[orderMode] = menu;

    // one of ORDER_MODES
    let orderMode = undefined;

    // contains orderModes with @type and, most importantly, menu id and name
    let currentBranchOrderModes = {};

    // used for checking if cart should be cleared when changing menus or loading app
    let lastMenuID = undefined;
    let lastOrderModeID = undefined;

    const getSelectedBC = () => DataService.getSelectedBranchContact();

    function orderModeAvailable(orderMode) {
        return currentBranchOrderModes[orderMode] &&
            currentBranchOrderModes[orderMode].active

    }

    this.getInPlaceOrderModeOrderReference = function (){
       return currentBranchOrderModes[ORDER_MODES.INPLACE].orderText;
    }

    this.inPlaceOrderAvailable = function () {
        return orderModeAvailable(ORDER_MODES.INPLACE)
    };

    this.deliveryAvailable = function () {
        return orderModeAvailable(ORDER_MODES.DELIVERY)
    };

    this.takeAwayAvailable = function () {
        return orderModeAvailable(ORDER_MODES.TAKEAWAY)
    };

    // changes orderType, menu, and checks if cart should be emptied
    function setOrder(orderType) {
        const oldOrderType = orderMode;
        orderMode = orderType;

        function updateCart(oldOrderType, newOrderType) {
            // get old menu ID
            let oldMenuID;
            if (oldOrderType) {
                const oldOM = currentBranchOrderModes[oldOrderType]
                const oldMenu = oldOM.menu
                oldMenuID = oldMenu.id;
            } else {
                oldMenuID = lastMenuID;
            }


            // get new menu ID
            const newOM = currentBranchOrderModes[newOrderType];
            if (!newOM) return;
            const newMenu = newOM.menu;
            const newMenuID = newMenu.id;

            // compare
            if (newMenuID && oldMenuID && oldMenuID !== newMenuID) {
                CartFactory.emptyCart();
            }
        }

        if (menus[orderMode] === undefined) {
            const bc = getSelectedBC();
            menus[orderMode] = "LOADING";
            return FetchService.getMenu(bc.alias, orderType)
                .then(response => {
                    menus[orderType] = response.data
                    MenuService.setMenu(menus[orderMode].categories);
                    MenuService.setRemarkeds(menus[orderMode].remarkeds);
                    DiscountService.setDiscounts(menus[orderMode].discounts);
                    updateCart(oldOrderType, orderType);
                    // TODO find a better way to do this
                    $rootScope.$apply()
                })
                .catch(err => {
                    menus[orderMode] = undefined;
                    orderType = oldOrderType;
                    // TODO
                    new Android_Toast({content: "Error al traer el menu."});
                })
        } else {
            MenuService.setMenu(menus[orderMode].categories);
            MenuService.setRemarkeds(menus[orderMode].remarkeds);
            DiscountService.setDiscounts(menus[orderMode].discounts);
            updateCart(oldOrderType, orderType);
        }

        return new Promise(resolve => resolve());
    }

    this.setOrder = (ot) => {
        const methods = this.orderModesAvailable();
        if (!methods.includes(ot)) {
            throw new Error("Se intentó usar un tipo de envío invalido.");
        }
        return setOrder(ot);
    }

    this.setInPlaceOrder = () => setOrder(ORDER_MODES.INPLACE);
    this.setDeliveryOrder = () => setOrder(ORDER_MODES.DELIVERY);
    this.setTakeAwayOrder = () => setOrder(ORDER_MODES.TAKEAWAY);

    this.inPlaceOrderSelected = () => orderMode === ORDER_MODES.INPLACE;
    this.deliverySelected = () => orderMode === ORDER_MODES.DELIVERY;
    this.takeAwaySelected = () => orderMode === ORDER_MODES.TAKEAWAY;

    this.orderModesAvailable = function () {
        let methods = [];
        if (this.inPlaceOrderAvailable()) methods.push(ORDER_MODES.INPLACE);
        if (this.deliveryAvailable()) methods.push(ORDER_MODES.DELIVERY);
        if (this.takeAwayAvailable()) methods.push(ORDER_MODES.TAKEAWAY);
        return methods;
    }

    this.paymentMethodsAvailable = function () {
        const om = this.getCurrentBranchOrderMode();
        return Object.values(om.paymentTypes).filter(p => p.active);
    }

    this.orderModesAvailableAmount = function () {
        return this.orderModesAvailable().length;
    }

    this.hasOrderMode = function () {
        return this.orderModesAvailable().length && this.paymentMethodsAvailable().length;
    }

    this.selectFirstMode = () => {
        if (lastOrderModeID) {
            const om = Object.values(currentBranchOrderModes).find(om => om.id === lastOrderModeID)
            if (om && om.active) {
                return setOrder(om["@type"].toUpperCase())
            }
        }

        if (this.deliveryAvailable()) orderMode = ORDER_MODES.DELIVERY;
        else orderMode = this.orderModesAvailable()[0];

        if (orderMode === undefined) orderMode = ORDER_MODES.INFORMATIVE;
        return setOrder(orderMode)
    }

    this.getOrderMode = () => orderMode;

    this.setCurrentBranchOrderModes = (oms) => {
        currentBranchOrderModes = oms;

        Object.entries(currentBranchOrderModes).forEach(e => {
            const om = e[1];
            om.paymentTypes = om.paymentTypes
                .reduce((acc, pt) => {
                    acc[pt["@type"].toLowerCase()] = pt;
                    return acc;
                }, {})

        })

        menus[ORDER_MODES.INPLACE] = undefined;
        menus[ORDER_MODES.DELIVERY] = undefined;
        menus[ORDER_MODES.TAKEAWAY] = undefined;
        menus[ORDER_MODES.INFORMATIVE] = undefined;
    };

    this.getCurrentBranchOrderModes = () => currentBranchOrderModes;
    this.getCurrentBranchOrderMode = () => currentBranchOrderModes[this.getOrderMode()];

    this.getMenuLoading = () => {
        return Object.values(menus).some(value => value === "LOADING")
    };

    this.setLastMenuID = (id) => {
        lastMenuID = id;
    }

    this.getLastMenuID = () => lastMenuID;

    this.setLastOrderModeID = (id) => {
        lastOrderModeID = id;
    }

    this.getLastOrderModeID = () => lastOrderModeID;

    /*
     * this is a bit of a mess
     * we have a plateID gotten from queryparams and we have to find the following:
     * 1) the menu that contains that plate
     * 2) the plate itself
     * however, since branchContacts have many ordermodes, and those have exactly one menu
     * there is a possibility that no ordermode has this plate. also, we have to bring in every
     * menu until we find one that contains this plate. so this function does the following:
     *
     * first, in the `order` array, we set up the order we want to check the ordermodes in
     * then, we check if we have the menu stored in our local cache
     * if we have it, great, search in there. otherwise go fetch it
     * after searching, if we haven't found it we should move on to the next ordermode.
     * however, fetching a menu is a promise, and we don't have async/await.
     * because of this the whole function works recursively, so that during the `then` callback we determine
     * if we need to fetch the next menu or not, and then we fetch it. we also skip any inactive ordermodes
     *
     * if we exhaust the ordermodes and we don't find the plate, then we just return undefined.
     */
    this.findMenuWithPlateID = (id) => {
        const findPlateInMenu = menu => {
            if (!menu.categories) return undefined;

            for (const category of menu.categories) {
                for (const plate of category.plates) {
                    if (plate.id === id) return plate;
                }
            }
        }

        const order = [orderMode, ORDER_MODES.DELIVERY, ORDER_MODES.INPLACE, ORDER_MODES.TAKEAWAY]

        function searchOM(index) {
            const om = order[index]
            if (index >= order.length) {
                return undefined;
            }

            if (!om || !currentBranchOrderModes[om].active) {
                return searchOM(index + 1);
            }

            if (!menus[om]) {
                return setOrder(om).then(() => {
                    const plate = findPlateInMenu(menus[om]);
                    if (!plate) return searchOM(index + 1);
                    return plate;
                })
            } else {
                const plate = findPlateInMenu(menus[om]);
                if (!plate) return searchOM(index + 1);
                return new Promise(resolve => resolve(plate))
            }
        }

        return searchOM(0);
    }
});
