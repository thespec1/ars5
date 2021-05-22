dinerApp.service('GoogleAnalyticsService', function (DataService) {

    this.firePurchaseEvent = (orderId, orderPrice, orderType, deliveryPrice) => {
        if (isGoogleAnalyticsInitialized()) {
            gtag('event', 'purchase', {
                'event_category': 'ecommerce',
                'event_label': DataService.getAlias() + ' - ' + 'Purchase' + ' - ' + orderType,
                "transaction_id": orderId,
                "value": orderPrice,
                "affiliation": DataService.getAlias(),
                "currency": getCurrencyValue(),
                "shipping": deliveryPrice
            });
        }

    }

    this.fireAddToCartEvent = (plate, iOrderQuantity, iOrderPrice) => {
        if (isGoogleAnalyticsInitialized()) {
            gtag('event', 'add_to_cart', {
                'event_category': 'ecommerce',
                'event_label': DataService.getAlias() + ' - Add to cart - ' + plate.name,
                "value": iOrderQuantity * iOrderPrice
                // "items": [
                //     {
                //         "id": plate.id,
                //         "category": plate.category.name,
                //         "name": plate.name,
                //         "list_position": plate.platOrder,
                //         "quantity" : orderQuantity,
                //         "price" : iOrderPrice
                //     }
                // ]
            });
        }

    }

    this.fireRemoveFromCartEvent = (plate, iOrderQuantity, iOrderPrice) => {
        if (isGoogleAnalyticsInitialized()) {
            gtag('event', 'remove_from_cart', {
                'event_category': 'ecommerce',
                'event_label': DataService.getAlias() + ' - Remove from cart - ' + plate.name,
                "value": iOrderPrice * iOrderQuantity
                // "items": [
                //     {
                //         "id": plate.id,
                //         "category": plate.category.name,
                //         "name": plate.name,
                //         "list_position": plate.platOrder,
                //         "quantity": 1,
                //         "price": iOrderPrice
                //     }
                // ]
            });
        }

    }

    this.fireEmptyCartEvent = (iOrders, iOrdersTotalPrice) => {
        if (isGoogleAnalyticsInitialized()) {
            // let gItems = [];
            // iOrders.forEach(iOrder => {
            //     const item = {
            //         "id": iOrder.plate.id,
            //         "category": iOrder.plate.category.name,
            //         "name": iOrder.formattedName,
            //         "list_position": iOrder.plate.platOrder,
            //         "quantity": iOrder.quantity,
            //         "price": iOrder.price
            //     }
            //     gItems.push(item);
            // })

            gtag('event', 'remove_from_cart', {
                'event_category': 'ecommerce',
                'event_label': DataService.getAlias() + ' - Empty cart',
                "value": iOrdersTotalPrice
                // ,"items": gItems
            });
        }
    }

    this.fireWhatsappButtonPressEvent = () => {
        if (isGoogleAnalyticsInitialized())
        {
            gtag('event', 'whatsapp', {
                'event_category': 'contact',
                'event_label': DataService.getAlias() + ' - WhatsApp Button Press',
                'value': 0
            });
        }

    }

    function getCurrencyValue() {
        const isoCode = (DataService.getLanguageAndRegion() !== undefined && DataService.getLanguageAndRegion().isoCode  !== undefined ? DataService.getLanguageAndRegion().isoCode : "ARS");

        for (let i = 0; i < currencyMap.length; i++){
            let obj = currencyMap[i];
            for (let key in obj){
                if (obj[key] === isoCode)
                    return obj["countryCode"];

            }
        }
    }

    const isGoogleAnalyticsInitialized = () => {
        return DataService.getInitialization().googleAnalyticsKey;
    }

    const currencyMap = [
        {
            isoCode: "TW",
            countryCode: "ARS"
        },
        {
            isoCode: "AF",
            countryCode: "AFN"
        },
        {
            isoCode: "AL",
            countryCode: "ALL"
        },
        {
            isoCode: "DZ",
            countryCode: "DZD"
        },
        {
            isoCode: "AS",
            countryCode: "USD"
        },
        {
            isoCode: "AD",
            countryCode: "EUR"
        },
        {
            isoCode: "AO",
            countryCode: "AOA"
        },
        {
            isoCode: "AI",
            countryCode: "XCD"
        },
        {
            isoCode: "AQ",
            countryCode: "ARS"
        },
        {
            isoCode: "AG",
            countryCode: "XCD"
        },
        {
            isoCode: "AR",
            countryCode: "ARS"
        },
        {
            isoCode: "AM",
            countryCode: "AMD"
        },
        {
            isoCode: "AW",
            countryCode: "AWG"
        },
        {
            isoCode: "AU",
            countryCode: "AUD"
        },
        {
            isoCode: "AT",
            countryCode: "EUR"
        },
        {
            isoCode: "AZ",
            countryCode: "AZN"
        },
        {
            isoCode: "BS",
            countryCode: "BSD"
        },
        {
            isoCode: "BH",
            countryCode: "BHD"
        },
        {
            isoCode: "BD",
            countryCode: "BDT"
        },
        {
            isoCode: "BB",
            countryCode: "BBD"
        },
        {
            isoCode: "BY",
            countryCode: "BYN"
        },
        {
            isoCode: "BE",
            countryCode: "EUR"
        },
        {
            isoCode: "BZ",
            countryCode: "BZD"
        },
        {
            isoCode: "BJ",
            countryCode: "XOF"
        },
        {
            isoCode: "BM",
            countryCode: "BMD"
        },
        {
            isoCode: "BT",
            countryCode: "INR"
        },
        {
            isoCode: "BO",
            countryCode: "BOB"
        },
        {
            isoCode: "BQ",
            countryCode: "USD"
        },
        {
            isoCode: "BA",
            countryCode: "BAM"
        },
        {
            isoCode: "BW",
            countryCode: "BWP"
        },
        {
            isoCode: "BV",
            countryCode: "NOK"
        },
        {
            isoCode: "BR",
            countryCode: "BRL"
        },
        {
            isoCode: "IO",
            countryCode: "USD"
        },
        {
            isoCode: "VG",
            countryCode: "USD"
        },
        {
            isoCode: "BN",
            countryCode: "BND"
        },
        {
            isoCode: "BG",
            countryCode: "BGN"
        },
        {
            isoCode: "BF",
            countryCode: "XOF"
        },
        {
            isoCode: "BI",
            countryCode: "BIF"
        },
        {
            isoCode: "CV",
            countryCode: "CVE"
        },
        {
            isoCode: "KH",
            countryCode: "KHR"
        },
        {
            isoCode: "CM",
            countryCode: "XAF"
        },
        {
            isoCode: "CA",
            countryCode: "CAD"
        },
        {
            isoCode: "KY",
            countryCode: "KYD"
        },
        {
            isoCode: "CF",
            countryCode: "XAF"
        },
        {
            isoCode: "TD",
            countryCode: "XAF"
        },
        {
            isoCode: "CL",
            countryCode: "CLP"
        },
        {
            isoCode: "CN",
            countryCode: "CNY"
        },
        {
            isoCode: "HK",
            countryCode: "HKD"
        },
        {
            isoCode: "MO",
            countryCode: "MOP"
        },
        {
            isoCode: "CX",
            countryCode: "AUD"
        },
        {
            isoCode: "CC",
            countryCode: "AUD"
        },
        {
            isoCode: "CO",
            countryCode: "COP"
        },
        {
            isoCode: "KM",
            countryCode: "KMF"
        },
        {
            isoCode: "CG",
            countryCode: "XAF"
        },
        {
            isoCode: "CK",
            countryCode: "NZD"
        },
        {
            isoCode: "CR",
            countryCode: "CRC"
        },
        {
            isoCode: "HR",
            countryCode: "HRK"
        },
        {
            isoCode: "CU",
            countryCode: "CUP"
        },
        {
            isoCode: "CW",
            countryCode: "ANG"
        },
        {
            isoCode: "CY",
            countryCode: "EUR"
        },
        {
            isoCode: "CZ",
            countryCode: "CZK"
        },
        {
            isoCode: "CI",
            countryCode: "XOF"
        },
        {
            isoCode: "KP",
            countryCode: "KPW"
        },
        {
            isoCode: "CD",
            countryCode: "CDF"
        },
        {
            isoCode: "DK",
            countryCode: "DKK"
        },
        {
            isoCode: "DJ",
            countryCode: "DJF"
        },
        {
            isoCode: "DM",
            countryCode: "XCD"
        },
        {
            isoCode: "DO",
            countryCode: "DOP"
        },
        {
            isoCode: "EC",
            countryCode: "USD"
        },
        {
            isoCode: "EG",
            countryCode: "EGP"
        },
        {
            isoCode: "SV",
            countryCode: "SVC"
        },
        {
            isoCode: "GQ",
            countryCode: "XAF"
        },
        {
            isoCode: "ER",
            countryCode: "ERN"
        },
        {
            isoCode: "EE",
            countryCode: "EUR"
        },
        {
            isoCode: "SZ",
            countryCode: "SZL"
        },
        {
            isoCode: "ET",
            countryCode: "ETB"
        },
        {
            isoCode: "FK",
            countryCode: "ARS"
        },
        {
            isoCode: "FO",
            countryCode: "DKK"
        },
        {
            isoCode: "FJ",
            countryCode: "FJD"
        },
        {
            isoCode: "FI",
            countryCode: "EUR"
        },
        {
            isoCode: "FR",
            countryCode: "EUR"
        },
        {
            isoCode: "GF",
            countryCode: "EUR"
        },
        {
            isoCode: "PF",
            countryCode: "XPF"
        },
        {
            isoCode: "TF",
            countryCode: "EUR"
        },
        {
            isoCode: "GA",
            countryCode: "XAF"
        },
        {
            isoCode: "GM",
            countryCode: "GMD"
        },
        {
            isoCode: "GE",
            countryCode: "GEL"
        },
        {
            isoCode: "DE",
            countryCode: "EUR"
        },
        {
            isoCode: "GH",
            countryCode: "GHS"
        },
        {
            isoCode: "GI",
            countryCode: "GIP"
        },
        {
            isoCode: "GR",
            countryCode: "EUR"
        },
        {
            isoCode: "GL",
            countryCode: "DKK"
        },
        {
            isoCode: "GD",
            countryCode: "XCD"
        },
        {
            isoCode: "GP",
            countryCode: "EUR"
        },
        {
            isoCode: "GU",
            countryCode: "USD"
        },
        {
            isoCode: "GT",
            countryCode: "GTQ"
        },
        {
            isoCode: "GG",
            countryCode: "GBP"
        },
        {
            isoCode: "GN",
            countryCode: "GNF"
        },
        {
            isoCode: "GW",
            countryCode: "XOF"
        },
        {
            isoCode: "GY",
            countryCode: "GYD"
        },
        {
            isoCode: "HT",
            countryCode: "HTG"
        },
        {
            isoCode: "HM",
            countryCode: "AUD"
        },
        {
            isoCode: "VA",
            countryCode: "EUR"
        },
        {
            isoCode: "HN",
            countryCode: "HNL"
        },
        {
            isoCode: "HU",
            countryCode: "HUF"
        },
        {
            isoCode: "IS",
            countryCode: "ISK"
        },
        {
            isoCode: "IN",
            countryCode: "INR"
        },
        {
            isoCode: "ID",
            countryCode: "IDR"
        },
        {
            isoCode: "IR",
            countryCode: "IRR"
        },
        {
            isoCode: "IQ",
            countryCode: "IQD"
        },
        {
            isoCode: "IE",
            countryCode: "EUR"
        },
        {
            isoCode: "IM",
            countryCode: "GBP"
        },
        {
            isoCode: "IL",
            countryCode: "ILS"
        },
        {
            isoCode: "IT",
            countryCode: "EUR"
        },
        {
            isoCode: "JM",
            countryCode: "JMD"
        },
        {
            isoCode: "JP",
            countryCode: "JPY"
        },
        {
            isoCode: "JE",
            countryCode: "GBP"
        },
        {
            isoCode: "JO",
            countryCode: "JOD"
        },
        {
            isoCode: "KZ",
            countryCode: "KZT"
        },
        {
            isoCode: "KE",
            countryCode: "KES"
        },
        {
            isoCode: "KI",
            countryCode: "AUD"
        },
        {
            isoCode: "KW",
            countryCode: "KWD"
        },
        {
            isoCode: "KG",
            countryCode: "KGS"
        },
        {
            isoCode: "LA",
            countryCode: "LAK"
        },
        {
            isoCode: "LV",
            countryCode: "EUR"
        },
        {
            isoCode: "LB",
            countryCode: "LBP"
        },
        {
            isoCode: "LS",
            countryCode: "LSL"
        },
        {
            isoCode: "LR",
            countryCode: "LRD"
        },
        {
            isoCode: "LY",
            countryCode: "LYD"
        },
        {
            isoCode: "LI",
            countryCode: "CHF"
        },
        {
            isoCode: "LT",
            countryCode: "EUR"
        },
        {
            isoCode: "LU",
            countryCode: "EUR"
        },
        {
            isoCode: "MG",
            countryCode: "MGA"
        },
        {
            isoCode: "MW",
            countryCode: "MWK"
        },
        {
            isoCode: "MY",
            countryCode: "MYR"
        },
        {
            isoCode: "MV",
            countryCode: "MVR"
        },
        {
            isoCode: "ML",
            countryCode: "XOF"
        },
        {
            isoCode: "MT",
            countryCode: "EUR"
        },
        {
            isoCode: "MH",
            countryCode: "USD"
        },
        {
            isoCode: "MQ",
            countryCode: "EUR"
        },
        {
            isoCode: "MR",
            countryCode: "MRU"
        },
        {
            isoCode: "MU",
            countryCode: "MUR"
        },
        {
            isoCode: "YT",
            countryCode: "EUR"
        },
        {
            isoCode: "MX",
            countryCode: "MXN"
        },
        {
            isoCode: "FM",
            countryCode: "USD"
        },
        {
            isoCode: "MC",
            countryCode: "EUR"
        },
        {
            isoCode: "MN",
            countryCode: "MNT"
        },
        {
            isoCode: "ME",
            countryCode: "EUR"
        },
        {
            isoCode: "MS",
            countryCode: "XCD"
        },
        {
            isoCode: "MA",
            countryCode: "MAD"
        },
        {
            isoCode: "MZ",
            countryCode: "MZN"
        },
        {
            isoCode: "MM",
            countryCode: "MMK"
        },
        {
            isoCode: "NA",
            countryCode: "NAD"
        },
        {
            isoCode: "NR",
            countryCode: "AUD"
        },
        {
            isoCode: "NP",
            countryCode: "NPR"
        },
        {
            isoCode: "NL",
            countryCode: "EUR"
        },
        {
            isoCode: "NC",
            countryCode: "XPF"
        },
        {
            isoCode: "NZ",
            countryCode: "NZD"
        },
        {
            isoCode: "NI",
            countryCode: "NIO"
        },
        {
            isoCode: "NE",
            countryCode: "XOF"
        },
        {
            isoCode: "NG",
            countryCode: "NGN"
        },
        {
            isoCode: "NU",
            countryCode: "NZD"
        },
        {
            isoCode: "NF",
            countryCode: "AUD"
        },
        {
            isoCode: "MP",
            countryCode: "USD"
        },
        {
            isoCode: "NO",
            countryCode: "NOK"
        },
        {
            isoCode: "OM",
            countryCode: "OMR"
        },
        {
            isoCode: "PK",
            countryCode: "PKR"
        },
        {
            isoCode: "PW",
            countryCode: "USD"
        },
        {
            isoCode: "PA",
            countryCode: "USD"
        },
        {
            isoCode: "PG",
            countryCode: "PGK"
        },
        {
            isoCode: "PY",
            countryCode: "PYG"
        },
        {
            isoCode: "PE",
            countryCode: "PEN"
        },
        {
            isoCode: "PH",
            countryCode: "PHP"
        },
        {
            isoCode: "PN",
            countryCode: "NZD"
        },
        {
            isoCode: "PL",
            countryCode: "PLN"
        },
        {
            isoCode: "PT",
            countryCode: "EUR"
        },
        {
            isoCode: "PR",
            countryCode: "USD"
        },
        {
            isoCode: "QA",
            countryCode: "QAR"
        },
        {
            isoCode: "KR",
            countryCode: "KRW"
        },
        {
            isoCode: "MD",
            countryCode: "MDL"
        },
        {
            isoCode: "RO",
            countryCode: "RON"
        },
        {
            isoCode: "RU",
            countryCode: "RUB"
        },
        {
            isoCode: "RW",
            countryCode: "RWF"
        },
        {
            isoCode: "RE",
            countryCode: "EUR"
        },
        {
            isoCode: "BL",
            countryCode: "EUR"
        },
        {
            isoCode: "SH",
            countryCode: "SHP"
        },
        {
            isoCode: "KN",
            countryCode: "XCD"
        },
        {
            isoCode: "LC",
            countryCode: "XCD"
        },
        {
            isoCode: "MF",
            countryCode: "EUR"
        },
        {
            isoCode: "PM",
            countryCode: "EUR"
        },
        {
            isoCode: "VC",
            countryCode: "XCD"
        },
        {
            isoCode: "WS",
            countryCode: "WST"
        },
        {
            isoCode: "SM",
            countryCode: "EUR"
        },
        {
            isoCode: "ST",
            countryCode: "STN"
        },
        {
            isoCode: "AR",
            countryCode: "ARS"
        },
        {
            isoCode: "SA",
            countryCode: "SAR"
        },
        {
            isoCode: "SN",
            countryCode: "XOF"
        },
        {
            isoCode: "RS",
            countryCode: "RSD"
        },
        {
            isoCode: "SC",
            countryCode: "SCR"
        },
        {
            isoCode: "SL",
            countryCode: "SLL"
        },
        {
            isoCode: "SG",
            countryCode: "SGD"
        },
        {
            isoCode: "SX",
            countryCode: "ANG"
        },
        {
            isoCode: "SK",
            countryCode: "EUR"
        },
        {
            isoCode: "SI",
            countryCode: "EUR"
        },
        {
            isoCode: "SB",
            countryCode: "SBD"
        },
        {
            isoCode: "SO",
            countryCode: "SOS"
        },
        {
            isoCode: "ZA",
            countryCode: "ZAR"
        },
        {
            isoCode: "GS",
            countryCode: "ARS"
        },
        {
            isoCode: "SS",
            countryCode: "SSP"
        },
        {
            isoCode: "ES",
            countryCode: "EUR"
        },
        {
            isoCode: "LK",
            countryCode: "LKR"
        },
        {
            isoCode: "PS",
            countryCode: "ARS"
        },
        {
            isoCode: "SD",
            countryCode: "SDG"
        },
        {
            isoCode: "SR",
            countryCode: "SRD"
        },
        {
            isoCode: "SJ",
            countryCode: "NOK"
        },
        {
            isoCode: "SE",
            countryCode: "SEK"
        },
        {
            isoCode: "CH",
            countryCode: "CHF"
        },
        {
            isoCode: "SY",
            countryCode: "SYP"
        },
        {
            isoCode: "TJ",
            countryCode: "TJS"
        },
        {
            isoCode: "TH",
            countryCode: "THB"
        },
        {
            isoCode: "MK",
            countryCode: "MKD"
        },
        {
            isoCode: "TL",
            countryCode: "USD"
        },
        {
            isoCode: "TG",
            countryCode: "XOF"
        },
        {
            isoCode: "TK",
            countryCode: "NZD"
        },
        {
            isoCode: "TO",
            countryCode: "TOP"
        },
        {
            isoCode: "TT",
            countryCode: "TTD"
        },
        {
            isoCode: "TN",
            countryCode: "TND"
        },
        {
            isoCode: "TR",
            countryCode: "TRY"
        },
        {
            isoCode: "TM",
            countryCode: "TMT"
        },
        {
            isoCode: "TC",
            countryCode: "USD"
        },
        {
            isoCode: "TV",
            countryCode: "AUD"
        },
        {
            isoCode: "UG",
            countryCode: "UGX"
        },
        {
            isoCode: "UA",
            countryCode: "UAH"
        },
        {
            isoCode: "AE",
            countryCode: "AED"
        },
        {
            isoCode: "GB",
            countryCode: "GBP"
        },
        {
            isoCode: "TZ",
            countryCode: "TZS"
        },
        {
            isoCode: "UM",
            countryCode: "USD"
        },
        {
            isoCode: "VI",
            countryCode: "USD"
        },
        {
            isoCode: "US",
            countryCode: "USD"
        },
        {
            isoCode: "UY",
            countryCode: "UYU"
        },
        {
            isoCode: "UZ",
            countryCode: "UZS"
        },
        {
            isoCode: "VU",
            countryCode: "VUV"
        },
        {
            isoCode: "VE",
            countryCode: "VES"
        },
        {
            isoCode: "VN",
            countryCode: "VND"
        },
        {
            isoCode: "WF",
            countryCode: "XPF"
        },
        {
            isoCode: "EH",
            countryCode: "MAD"
        },
        {
            isoCode: "YE",
            countryCode: "YER"
        },
        {
            isoCode: "ZM",
            countryCode: "ZMW"
        },
        {
            isoCode: "ZW",
            countryCode: "ZWL"
        },
        {
            isoCode: "AX",
            countryCode: "EUR"
        }
    ]

});
