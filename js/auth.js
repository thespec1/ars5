dinerApp.service("AuthService", function ($rootScope, $window, FetchService) {
    // contains all user data, or undefined if it hasn't been loaded
    let user;
    // tells us whether user is loading or not
    let loading = true;
    // tells us whether the rest of the page is loading. should be set manually
    let pageLoading = true;

    // stores email being used for current login flow
    let currentFlowEmail;

    // stores temporary delivery addresses
    let tempAddresses = [];

    // will load user if we have a valid login cookie
    this.init = () => {
        loading = true;
        return new Promise(resolve => {
            FetchService.getCurrentLoggedInUser()
                .then(result => {
                    if (!result) user = undefined;
                    else user = result;
                })
                .finally(() => {
                    loading = false;
                    broadcastUpdate();
                    resolve();
                });
        })
    };

    // ask backend if an account exists for a given email address
    // also store email address for the rest of the auth flow
    // email is a string
    // returns a Promise<boolean> which resolves to true if it exists and false if it doesn't
    // rejects in any other case
    this.mailExists = (email) => {
        currentFlowEmail = email;
        return FetchService.mailExists(email);
    };

    // ask backend to send a login email to a given address
    // email is either string or undefined. if undefined, will try to use auth flow email
    // returns a Promise<boolean> which resolves to true if it successful
    // rejects in any other case
    this.loginWithEmail = (email) => {
        email = this.getCleanEmail(email);
        return FetchService.sendLoginEmail(email);
    };

    // attempt to authenticate against backend using token received from loginWithEmail
    // token is a string
    // returns a Promise<boolean> which resolves to true if it successful
    // rejects in any other case
    this.loginWithToken = (token) => {
        return FetchService.loginWithToken(token);
    };

    // attempt to authenticate against backend using email and password
    // email is either string or undefined. if undefined, will try to use auth flow email
    // password is a string
    // returns a Promise<boolean> which resolves to true if it successful
    // rejects in any other case
    this.loginWithPassword = (password, email) => {
        email = this.getCleanEmail(email);

        return FetchService.login(email, password);
    };

    // attempt to create a diner account
    // email is either a string or undefined. if undefined, it will use currentFlowEmail
    // every other param is a string
    // returns a Promise<boolean> which only resolves to true on success and rejects any other response
    this.register = (name, surname, password, phone, email) => {
        email = this.getCleanEmail(email);
        return FetchService.register(name, surname, password, phone, email);
    };

    this.isLoggedIn = () => user !== undefined;

    // returns undefined if not logged in
    // returns the user, with tempAddresses merged into user.addresses, if logged in
    this.getUser = () => {
        if (user) {
            return {
                ...user,
                addresses: [
                    ...user.addresses,
                    ...tempAddresses
                ]
            };
        }

        return user;
    };

    // if email is defined, use email
    // if not, if currentFlowEmail is defined, use it
    // throw error in any other situation
    this.getCleanEmail = (email) => {
        if (email && typeof email === "string") return email;
        if (currentFlowEmail && typeof currentFlowEmail === "string") return currentFlowEmail;
        throw new Error("No valid email");
    };

    this.isLoading = () => pageLoading || loading;
    this.setPageLoading = (value) => {
        pageLoading = value;
        broadcastUpdate();
    };

    this.logOut = () => {
        FetchService.logOut().then(this.init);
    };

    // TODO: doc
    this.deleteAddress = (address) => {
        if (!this.isLoggedIn() || this.isLoading()) throw new Error("Tried to delete an address while not logged in.");

        tempAddresses = tempAddresses.filter(a => {
            return a.fullAddress !== address.fullAddress;
        });

        const user = this.getUser();
        const previousLength = user.addresses.length;
        const addresses = user.addresses.filter(a => a.id !== address.id);
        if (previousLength !== addresses.length) {
            const newUser = {
                ...user,
                addresses
            };

            delete newUser.email;
            delete newUser.password;

            return FetchService.updateUser(newUser);
        } else {
            return new Promise(resolve => resolve(true));
        }

    };

    // adds an address temporarily to the user
    // will not be persisted in backend
    this.addAddress = (address) => {
        if (!this.isLoggedIn() || this.isLoading()) throw new Error("Tried to add an address while not logged in.");

        if (!address.id) {
            const addressIds = this.getUser().addresses.map(addr => addr.id);
            const maxId = Math.max(...addressIds);

            let id = 1;
            while (addressIds.includes(id)) {
                id = Math.ceil(Math.random() * maxId + 1);
            }

            address.id = id;
        }

        tempAddresses = [...tempAddresses, address];
        console.log(tempAddresses, user.addresses)
        broadcastUpdate();
    };

    function broadcastUpdate() {
        $rootScope.$broadcast("AuthServiceLoadStateChange");
    }

    this.persistAddresses = () => {
        if (!this.isLoggedIn() || this.isLoading()) {
            return new Promise(resolve => resolve(true))
            // TODO find out how to have this work
            // throw new Error("Tried to persist addresses while not logged in.");
        }
        const mergedUser = this.getUser();

        const tempAddressesWithoutIds = tempAddresses.map(address => {
            const copy = {...address};
            delete copy.id;
            return copy;
        });

        const addresses = [
            ...user.addresses,
            ...tempAddressesWithoutIds
        ];

        const payload = {
            id: mergedUser.id,
            name: mergedUser.name,
            addresses
        };

        return FetchService.updateUser(payload);
    };


});
