dinerApp.service('AttributionService', function () {

    const sourceKey = "source"
    const sourceDefaultValue = "other"

    let source;

    this.getSource = () => {
        return source;
    }

    this.setSource = (value) => {
        source = value;
    }

    this.setSourceFromQueryParam = () => {
        source = getQueryParam(sourceKey);
    }

    this.sourceExist = () => {
        return source && source !== sourceDefaultValue;
    }


    this.isLuveatSource = () => {
        return source !== sourceDefaultValue;
    }

    this.getAttributionObject = () => {
        return {source: source}
    }

    this.isEmpty = () => {
        return !source;
    }

    const getQueryParam = (key) => {
        const qp = (new URLSearchParams(window.location.search)).get(key);
        return qp ? qp : sourceDefaultValue;
    }

    // const removeQueryParam = (key) => {
    //     let param = key;
    //     if (location.search.indexOf(param + '=') !== -1) {
    //         let replace = '';
    //         try {
    //             let url = new URL(location);
    //             url.searchParams.delete(param);
    //             replace = url.href;
    //         } catch (ex) {
    //             let regExp = new RegExp('[?&]' + param + '=.*$');
    //             replace = location.search.replace(regExp, '');
    //             replace = location.pathname + replace + location.hash;
    //         }
    //         history.replaceState(null, '', replace);
    //     }
    // }

})
