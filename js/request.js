dinerApp.service('RequestService', function ($http) {

    this.get = function (url) {
        return $http.get(url);
    }

    this.post = function (url, body) {
        return $http({
            url: url,
            data: body,
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }
    
    this.patch = function (url, body) {
        return $http({
            url: url,
            data: body,
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    this.put = function (url, body) {
        return $http({
            url: url,
            method: "PUT",
            data: body,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    this.delete = function (url) {
        return $http({
            url: url,
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    this.addQueryParam = function (url, key, value) {
        if (url.includes('?')) {
            url = url.concat('&' + key + "=" + value);
        } else {
            url = url.concat('?' + key + "=" + value);
        }
        return url;
    }
});