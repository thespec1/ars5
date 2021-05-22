dinerApp.service('AddressService', function (BranchesGuideService) {
    var address;
    var betweenStreets;
    var details;
    var lat;
    var lng;

    this.getAddressObject = () => {
        let obj = {};
        obj.address = address;
        obj.betweenStreets = betweenStreets;
        obj.details = details;
        obj.lat = lat;
        obj.lng = lng;
        return obj;
    };

    this.saveAddressObject = (obj, resetBranchesGuide) => {
        address = obj.address;
        betweenStreets = obj.betweenStreets;
        details = obj.details;
        lat = obj.lat;
        lng = obj.lng;
        if (resetBranchesGuide) BranchesGuideService.resetBranchesGuide();
    };

    this.getAdressCoordinates = () => {
        return { lat: lat, lng: lng };
    };

    this.getAddress = () => {
        return address;
    };

    this.setAddress = (val) => {
        address = val;
    };

    this.getBetweenStreets = () => {
        return betweenStreets;
    };

    this.setBetweenStreets = (val) => {
        betweenStreets = val;
    };

    this.getDetails = () => {
        return details;
    };

    this.setDetails = (val) => {
        details = val;
    };

    this.getLat = () => {
        return lat;
    };

    this.setLat = (val) => {
        lat = val;
    };

    this.getLng = () => {
        return lng;
    };

    this.setLng = (val) => {
        lng = val;
    };

    this.persistData = () => {
        return JSON.stringify(this.getAddressObject());
    };

    this.retrieveData = (string) => {
        let obj = JSON.parse(string);
        this.saveAddressObject(obj);
    };

    this.validAddress = () => {
        return lat !== undefined && lng !== undefined && address !== undefined;
    };

    this.reset = () =>{
        this.saveAddressObject({},false);
    }
});