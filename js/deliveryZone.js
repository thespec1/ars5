dinerApp.service("DeliveryZoneService", function () {
    let reachableDeliveryZone = {};

    this.getReachableDeliveryZone = () => {
        return reachableDeliveryZone;
    };

    this.setReachableDeliveryZone = (df, mop) => {
        reachableDeliveryZone.deliveryFee = df;
        reachableDeliveryZone.minimumOrderPrice = mop;
    };

    this.validReachableDeliveryZone = () => {
        return reachableDeliveryZone.deliveryFee !== undefined && reachableDeliveryZone.minimumOrderPrice !== undefined;
    };

    this.googleContainsLocation = (coordinate, gShape) => {

        let contains = false;

        if (gShape.type === "polygon" && google.maps.geometry.poly.containsLocation(coordinate, gShape)) {
            contains = true;

        }
        if (gShape.type === "circle" && google.maps.geometry.spherical.computeDistanceBetween(gShape.getCenter(), coordinate) <= gShape.radius) {
            contains = true;
        }

        return contains;
    };

    this.deliveryZoneToGoogleShape = (deliveryZone) => {
        let shape;
        if (deliveryZone.area.type === "polygon") {
            shape = drawPolygon(deliveryZone.area.coordinates, deliveryZone.fillColor);
        } else {
            shape = drawCircle(deliveryZone.area.radius, deliveryZone.area.center, deliveryZone.fillColor);
        }
        return shape;
    };

    const drawingStyle = {
        strokeWeight: 2,
        strokeOpacity: 1,
        fillOpacity: 0.4,
        editable: false
    };


    const drawCircle = (radius, center, color) => {
        var circle = new google.maps.Circle({
            center: center,
            radius: radius,
            fillColor: color,
            strokeWeight: drawingStyle.strokeWeight,
            strokeColor: color,
            stokeOpacity: drawingStyle.strokeOpacity,
            fillOpacity: drawingStyle.fillOpacity,
            type: "circle"
        });

        return circle;
    };

    const drawPolygon = (coordinates, color) => {
        var polygon = new google.maps.Polygon({
            paths: coordinates,
            fillColor: color,
            strokeWeight: drawingStyle.strokeWeight,
            strokeColor: color,
            stokeOpacity: drawingStyle.strokeOpacity,
            fillOpacity: drawingStyle.fillOpacity,
            type: "polygon"
        });

        return polygon;

    };


    this.persistData = () => {
        return JSON.stringify(this.getReachableDeliveryZone());
    };

    this.retrieveData = (string) => {
        let obj = JSON.parse(string);
        this.setReachableDeliveryZone(obj.deliveryFee, obj.minimumOrderPrice);
    };

    // given a list of delivery zones and a coordinate, finds the cheapest
    // delivery zone that is inside those coordinates
    this.getBestDeliveryZone = (deliveryZones, coordinate) => {
        let foundZone = undefined;

        deliveryZones.forEach(dz => {
            if (dz.disabled) return;

            let shape = this.deliveryZoneToGoogleShape(dz);
            if (this.googleContainsLocation(coordinate, shape)) {
                if (foundZone === undefined || dz.deliveryFee < foundZone.deliveryFee) {
                    foundZone = dz;
                }
            }
        });

        return foundZone;
    };
});