dinerApp.service('FetchService', function (RequestService, DataService) {
    const ok = (response) => response.status === 200;
    const created = (response) => response.status === 201;
    const unauthorized = (response) => response.status === 401;
    const missing = (response) => response.status === 404;

    this.getBranch = () => {
        const promise = new Promise((resolve, reject) => {
            RequestService.get(`/api/diner/${DataService.getAlias()}/info`)
                .success(data => {
                    DataService.setBranch(data);
                    resolve();
                })
                .error(error => {
                    reject(error);
                });
        });
        return promise;
    };

    // returns a promise which hopefully resolves to a menu
    // it rejects with the full response in any other case
    this.getMenu = (branchContactAlias, orderType) => {
        const url = `/api/diner/${branchContactAlias}/menu/${orderType}`;

        return new Promise((resolve, reject) => {
            RequestService.get(RequestService.addQueryParam(url, "withVisiblePlates", true))
                .then(response => {
                    if (ok(response)) resolve(response);
                    else reject(response);
                }).catch(response => {
                    reject(response);
                })
        })
    };

    // returns a promise which hopefully resolves to a list of orderMode
    // it rejects with the full response in any other case
    this.getOrderModes = (branchContactID) => {
        const url = `/api/branchcontacts/${branchContactID}/ordermodes`

        return new Promise((resolve, reject) => {
            RequestService.get(url)
                .then(response => {
                    if (ok(response)) resolve(response);
                    else reject(response);
                }).catch(response => {
                    reject(response);
                })
        })
    };

    // returns a boolean promise which resolves to true if it exists
    // and resolves to false if it doesn't
    // it rejects with the full response in any other case
    this.mailExists = (email) => {
        return new Promise((resolve, reject) => {
            RequestService.get(`/api/email/${email}/type/diner/verify`)
            .then(response => {
                if (ok(response)) resolve(true);
                else reject(response);
            }).catch(response => {
                if (missing(response)) resolve(false);
                else reject(response);
            })
        })
    }

    // returns a boolean promise which resolves to true if we successfully logged in
    // and resolves to false if we didn't (only if we got exactly a 404)
    // it rejects with the full response in any other case
    this.login = (email, password) => {
        return new Promise((resolve, reject) => {
            RequestService.post("/api/diner/authenticate", {
                email,
                password
            })
            .then(response => {
                if (ok(response)) resolve(true)
                else reject(response)
            }).catch(response => {
                if (missing(response)) resolve(false)
                else reject(response)
            })
        })
    }

    // returns a boolean promise which resolves to true if we successfully logged in
    // and resolves to false if we didn't (only if we got exactly a 404)
    // it rejects with the full response in any other case
    this.loginWithToken = (token) => {
        return new Promise((resolve, reject) => {
            RequestService.get(`/api/authenticate/${token}`)
                .then(response => {
                    if (ok(response)) resolve(true)
                    else reject(response)
                }).catch(response => {
                    reject(response)
            })
        })
    }

    // returns a boolean promise which resolves to true if we successfully registered
    // and resolves to false if we didn't (only if we got exactly a 404)
    // it rejects with the full response in any other case
    this.register = (name, surname, password, phone, email) => {
        return new Promise((resolve, reject) => {
            RequestService.post("/api/diner/user/register", {
                name,
                surname,
                password,
                cellPhone: phone,
                email,
                profile: "DINER"
            })
            .then(response => {
                if (created(response)) resolve(true)
                else reject(response)
            }).catch(response => {
                if (missing(response)) resolve(false)
                else reject(response)
            })
        })
    }

    this.getCurrentLoggedInUser = () => {
        return new Promise((resolve, reject) => {
            RequestService.get("/api/diner/user")
                .then(response => {
                    if (ok(response)) {
                        resolve(response.data)
                    }
                    else resolve(false)
                }).catch(response => {
                    resolve(false)
                })
        })
    }

    this.logOut = () => {
        return new Promise((resolve, reject) => {
            RequestService.get("/api/logout")
                .then(response => {
                    resolve(true)
                }).catch(response => {
                    resolve(false)
                })
        })
    }

    this.updateUser = (user) => {
        return new Promise((resolve, reject) => {
            RequestService.put("/api/diner/user", user)
                .then(response => {
                    if (ok(response)) resolve(true);
                    else reject(response);
                })
        });
    };

    this.updatePayment = (payment) => {
        return new Promise((resolve, reject) => {
            RequestService.patch("/api/payments", payment)
                .then(response => {
                    if (ok(response)) resolve(true);
                    else reject(response);
                })
        });
    };


    this.sendLoginEmail = (email) => {
        return new Promise((resolve, reject) => {
            RequestService.post(`/api/authenticate/email?target=diner&alias=${DataService.getAlias()}`, { email })
                .then(response => {
                    if (ok(response)) resolve(true)
                    else reject(response)
                }).catch(response => {
                    if (missing(response)) resolve(false)
                    else reject(response)
                })
        })
    }

});