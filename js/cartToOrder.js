dinerApp.service('CartToOrderService', function (CartFactory) {
    this.cartToOrder = () => {
        const cart = CartFactory.getCart();
        return cart.map(order => plateToOrderPlate(order))
    }

    function plateToOrderPlate(order) {
        const plate = order.plate;
        return {
            name: plate.name,
            orderedPlateId: plate.id,
            orderedSize: sizeToOrderSize(order.selectedSize.size),
            orderedGarnishes: garnishGroupsToOrderGarnish(plate),
            appliedDiscount: discountToOrderDiscount(plate),
            count: order.quantity,
            comment: order.comment,
            inGrams: plate.inGrams
        }
    }

    function sizeToOrderSize(size) {
        return {
            name: size.name,
            price: size.price,
            orderedSizeId: size.id
        }
    }

    function garnishGroupsToOrderGarnish(plate) {
        return plate.garnishGroups
            .flatMap(garnishGroup => garnishGroupToOrderGarnish(garnishGroup))
            .filter(e => e !== null && e !== undefined);
    }

    // GarnishGroup: { id: number, garnishes: Garnish[] }
    // Garnish: { id: number, selected?: boolean, name: string }
    function garnishGroupToOrderGarnish(garnishGroup) {
        const selected = garnishGroup.garnishes.filter(g => g.selected)

        if (selected.length === 0) return undefined;

        return selected.map(garnish => ({
            name: garnish.name,
            price: garnish.price,
            count: garnish.count,
            orderedGarnishId: garnish.id,
            orderedGarnishGroupId: garnishGroup.id,
        }))
    }

    function discountToOrderDiscount(plate) {
        if (plate.activeDiscount) {
            const discount = angular.copy(plate.activeDiscount);
            delete discount.activeDiscount; // sometimes it is duplicated???
            delete discount.id;
            delete discount.plates;
            delete discount.schedule;
            delete discount.menu;

            const discountTypeMap = {
                "PERCENT": "Percent",
                "FINAL_PRICE": "FinalPrice",
                "FIXED": "Fixed"
            }

            discount["@type"] = discountTypeMap[discount.type];

            delete discount.type;
            return discount;
        }

        return undefined;
    }
});
