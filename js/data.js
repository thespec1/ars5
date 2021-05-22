dinerApp.service("DataService", function () {
    var alias;
    var activeBranchContacts;
    var branch;
    var selectedBranchContact;
    let customLogoPath;
    let initialization;

    this.clearData = () => {
        alias = undefined;
        activeBranchContacts = undefined;
        branch = undefined;
        selectedBranchContact = undefined;
    };

    // ------------- branch --------------------

    this.getBranch = () => {
        return branch;
    };

    this.setBranch = (value) => {
        branch = value;
        activeBranchContacts = branch.branchContacts.filter(contact => !contact.disabled);
        if (activeBranchContacts.length === 1) selectedBranchContact = activeBranchContacts[0];
        if (!this.aliasForBranch()) selectedBranchContact = activeBranchContacts.filter(branchContact => branchContact.alias.toLowerCase() === alias.toLowerCase())[0];
    };

    this.activeBranchHasFb = () => {
        return branch && branch.social && branch.social.facebook;
    };

    this.activeBranchHasIg = () => {
        return branch && branch.social && branch.social.instagram;
    };

    this.aliasForBranch = () => {
        return branch && (branch.alias.toLowerCase() == alias.toLowerCase());
    };

    this.setAlias = (value) => {
        alias = value;
    };

    this.getAlias = () => {
        return alias;
    };

    this.getSocial = () => {
        return branch && branch.social;
    };

    this.getCustomMessage = () => {
        return branch && branch.customMessage;
    };


    this.getLanguageAndRegion = () => {
        return branch && branch.languageAndRegion;
    };

    this.getDeliveryConfigInPlaceOrderText = () => {
        return selectedBranchContact.orderModes.filter( om => om['@type'] === 'InPlace')[0].orderText;
    };


    // this.getCustomLogoPath = () => {
    //     return customLogoPath;
    // };
    //
    // this.setCustomLogoPath = (value) => {
    //     customLogoPath = value;
    // };

    // ------------- branch contact --------------------

    this.setSelectedBranchContact = branchContact => {
        selectedBranchContact = branchContact;
    };

    this.getBranchContactFormattedAddress = branchContact => {
        let str = "";
        if (branchContact.gaddress) {
            if (branchContact.gaddress.street) str += branchContact.gaddress.street + " ";
            if (branchContact.gaddress.number) str += branchContact.gaddress.number + " ";
            if (str) str += ", ";
            if (branchContact.gaddress.city) str += branchContact.gaddress.city;
        }
        return str;
    };

    this.activeBranchContactHasSchedule = () => {
        return selectedBranchContact && selectedBranchContact.deliveryConfig && (selectedBranchContact.deliveryConfig.workingDays && selectedBranchContact.deliveryConfig.workingDays.length > 0);
    };

    this.activeBranchContactHasCallPhone = () => {
        return selectedBranchContact && selectedBranchContact.callPhone;
    };

    this.activeBranchContactHasWspPhone = () => {
        return selectedBranchContact && selectedBranchContact.whatsAppPhone;
    };

    this.activeBranchContactHasDeliveryZones = () => {
        return selectedBranchContact &&
            selectedBranchContact.deliveryConfig !== undefined &&
            selectedBranchContact.deliveryConfig.deliveryZones !== undefined &&
            selectedBranchContact.deliveryConfig.deliveryZones.length > 0;
    };

    this.activeBranchContactHasDeliveryZonesAvailable = () => {
        return selectedBranchContact &&
            selectedBranchContact.deliveryConfig !== undefined &&
            selectedBranchContact.deliveryConfig.deliveryZonesAvailable &&
            selectedBranchContact.deliveryConfig.deliveryZones &&
            selectedBranchContact.deliveryConfig.deliveryZones.length > 0;
    };

    this.multipleBranchContacts = () => {
        return activeBranchContacts.length > 1;
    };

    this.selectBranchContact = (branchContact) => {
        selectedBranchContact = branchContact;
    };

    this.getSelectedBranchContact = () => {
        return selectedBranchContact;
    };

    this.getActiveBranchContacts = () => {
        return activeBranchContacts;
    };

    this.isOpen = branchContact => {
        return branchContact && (branchContact.deliveryConfig == undefined || branchContact.deliveryConfig.open);
    };

    this.getBranchContactCountry = () => {
        if (selectedBranchContact.gaddress) {
            return selectedBranchContact.gaddress.country;
        }
        return undefined;
    };

    this.getInitialization = () => {
        return initialization;
    };

    this.getSetInitialization = (intl) => {
        initialization = intl;
    };


    this.headerLoaded = false;
    this.setHeaderLoaded = value => this.headerLoaded = value;

});