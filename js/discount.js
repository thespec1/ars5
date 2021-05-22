dinerApp.service('DiscountService', function (DataService) {
    var discounts;
    var discount;

    this.getDiscount = function () {
        return discount;
    };

    this.setDiscount = function (value) {
        discount = value;
    };

    this.getDiscounts = function () {
        return discounts;
    };

    this.setDiscounts = function (value) {
        discounts = value;
    };

    this.findDiscountById = function (id) {
        for (var disc of discounts) {
            if (disc.id === id) return disc;
        }
    };

    this.showDiscountsMenuEntry = function () {
        return discounts && discounts.length > 0;
    }

    this.getDiscountTemplate = function (plate) {
        switch (plate.activeDiscount.type) {
            case 'PERCENT':
                return '/web/discount/percent';
            case 'MULTIPLE':
                return '/web/discount/mxn';
            case 'FINAL_PRICE':
                return '/web/discount/finalPrice';
            case 'FIXED':
                return '/web/discount/fixedDiscount';
        }
    };

    this.showDiscount = function (plate) {
        return (plate.activeDiscount != undefined && plate.activeDiscount.type != "MULTIPLE");
    }

    this.showDiscountPill = function (plate) {
        return (plate.activeDiscount);
    }

    this.getDiscountPillText = function (plate) {
        switch (plate.activeDiscount.type) {
            case 'PERCENT':
                return `-${plate.activeDiscount.percentage}%`;
            case 'MULTIPLE':
                return plate.activeDiscount.buy + 'x' + plate.activeDiscount.pay;
            case 'FIXED':
            {
                if (DataService.getLanguageAndRegion().decimalsShow)
                    return '- ' + DataService.getLanguageAndRegion().currency+ ' ' + plate.activeDiscount.fixedDiscount.toLocaleString("es");
                else
                    return '- '+ DataService.getLanguageAndRegion().currency+ ' ' + Math.trunc(plate.activeDiscount.fixedDiscount).toLocaleString("es");

            }
        }
    };

    this.getDiscountedPrice = function (plate, price) {
        switch (plate.activeDiscount.type) {
            case 'PERCENT':
                return price * (1 - plate.activeDiscount.percentage / 100);
            case 'FINAL_PRICE':
                return plate.activeDiscount.finalPrice;
            case 'FIXED':
                return price - plate.activeDiscount.fixedDiscount;
            case 'MULTIPLE':
                return price;
            default:
                return price;
        }
    };

    this.showStrikedPrice = function (plate) {
        return plate && (plate.activeDiscount && plate.activeDiscount.type !== 'MULTIPLE');
    }

    this.atLeastOnePlateWithDiscount = function (plates) {
        for (var plate of plates) {
            if (plate.activeDiscount) return true;
        }
        return false;
    }

    this.getOnlyPrice = function (plate) {
        let price = plate.sizes[0].price;
        if (plate.activeDiscount) {
            price = this.getDiscountedPrice(plate, price);
        }
        return price;
    }

    this.greatestPercentDiscount = function (plates) {
        return plates.reduce(function (acc, value) {
            if (!value.activeDiscount || value.activeDiscount.type !== "PERCENT") return acc;
            if (acc === undefined || value.activeDiscount.percentage > acc.activeDiscount.percentage) return value;
            return acc;
        }, undefined)
    }

})
