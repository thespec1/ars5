dinerApp.service('ConfigService', function (RequestService, DataService, OrderModesService) {

    var configs;
    var parsedConfigObject = undefined;

    this.setConfigs = function (value) {
        configs = value;
    };

    this.getBranchConfigs = function (alias) {
        let url = `/api/diner/${alias}/configs`;

        url = RequestService.addQueryParam(url, 'name', 'showDinerMenuPrices');
        url = RequestService.addQueryParam(url, 'name', 'orderModule');

        return RequestService.get(url);
    };

    this.parseConfigs = function () {
        var parsedConfig = {};
        for (var config of configs) {
            if (config.type === "CHECKBOX") {
                parsedConfig[config.name] = (config.value === 'true');
            } else if (config.type === "SELECT") {
                config.value = JSON.parse(config.value);
                for (var val of config.value) {
                    if (val.selected) {
                        parsedConfig[config.name] = val.name;
                    }
                }
            } else {
                parsedConfig[config.name] = config.value;
            }
        }
        ;
        parsedConfigObject = parsedConfig;
    };

    this.requestEnabled = function () {
        return OrderModesService.orderModesAvailableAmount() > 0;
    };

    this.showPrices = function (){
        return true;
    }

    this.getConfigByName = function (configName) {
        return parsedConfigObject[configName];
    }
})