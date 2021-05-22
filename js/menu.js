dinerApp.service("MenuService", function (DataService) {
    var menu;
    var category;
    var plate;
    var remarkeds;

    this.getMenu = function () {
        return menu;
    };

    this.setMenu = function (value) {
        menu = value;
    };

    this.getCategory = function () {
        return category;
    };

    this.setCategory = function (value) {
        category = value;
    };

    this.getPlate = function () {
        return plate;
    };

    this.setPlate = function (value) {
        plate = value;
    };

    this.getRemarkeds = function () {
        return remarkeds;
    };

    this.setRemarkeds = function (value) {
        remarkeds = value;
    };

    this.findPlateById = function (plateId) {
        for (let i = 0; i < menu.length; i++) {
            const cat = menu[i];
            if (!cat.plates) continue;
            for (let j = 0; j < cat.plates.length; j++) {
                const plate = cat.plates[j];
                if (plate.id === plateId) {
                    return plate;
                }
            }
        }

        return undefined;
    };
});
