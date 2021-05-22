dinerApp.factory("CartFactory", function (DataService) {
    var orders = [];
    var totalCartPrice = 0;

    var cart = {
        getCart: function () {
            return orders;
        },
        calculateTotalPrice: function () {
            totalCartPrice = 0;
            for (let order of orders) {
                let itemPrice = 0;
                if (order.plate.inGrams) {
                    itemPrice = formatNumberOutput(order.price * order.quantity / 1000)
                } else {
                    itemPrice = formatNumberOutput(order.price) * order.quantity;
                }
                totalCartPrice += itemPrice;
            }
        },
        getTotalCartPrice: function () {
            return totalCartPrice;
        },
        addIndividualOrder: function (order) {
            for (var actualOrder of orders) {
                if (actualOrder.formattedName == order.formattedName) {
                    if (actualOrder.comment == order.comment) {
                        actualOrder.quantity += order.quantity;
                        this.calculateTotalPrice();
                        return;
                    }
                }
            }
            var orderCopy = {};
            angular.copy(order, orderCopy)
            orders.push(orderCopy);
            this.calculateTotalPrice();
        },
        increaseOrderQuantity: function (order, amount) {
            if (!amount) amount = 1;
            order.quantity += amount;
            this.calculateTotalPrice();
        },
        decreaseOrderQuantity: function (order, amount) {
            if (!amount) amount = 1
            if (order.quantity <= amount) {
                this.removeOrder(order);
            } else {
                order.quantity -= amount;
            }
            this.calculateTotalPrice();
        },
        removeOrder: function (order) {
            var ordersAux = [];
            for (var or of orders) {
                if (or !== order) {
                    ordersAux.push(or);
                }
            }
            orders = ordersAux;
            this.calculateTotalPrice();
        },
        emptyCart: function () {
            orders = [];
            this.calculateTotalPrice();
        },
        isEmpty: function () {
            return orders.length == 0;
        },
        setCart: function (cart) {
            orders = cart;
            this.calculateTotalPrice();
        },
        stringifyCartToWsp: function () {
            var text = "\r\nDetalle del pedido:";

            for (let order of orders) {
                text += `\r\n(${DataService.getLanguageAndRegion().currency} ${formatNumberOutputString((formatNumberOutput(order.price) * order.quantity), "es")}) ${order.quantity} x ${order.formattedName} \r\n`;
                if (order.comment) text += `-${order.comment} \r\n`;
            }

            text += `\r\n*Total Pedido ${DataService.getLanguageAndRegion().currency} ${formatNumberOutputString(totalCartPrice, "es")}*`;
            text = window.encodeURIComponent(text);
            return text;
        }
    }
    return cart;

    function formatNumberOutputString(value, nicCode) {

        if (typeof value === 'string' || value instanceof String)
            value = value.replace(',', '.');
        value = parseFloat(parseFloat(value).toFixed(2))

        if (DataService.getLanguageAndRegion().decimalsShow)
            return value.toLocaleString(nicCode);
        else
            return parseFloat(Math.trunc(value)).toLocaleString(nicCode)

    }

    function formatNumberOutput(value) {

            let decimalsShow = DataService.getLanguageAndRegion() !== undefined && DataService.getLanguageAndRegion().decimalsShow

            if (decimalsShow)
                return value;
            else
                return Math.trunc(value)
    }
})
