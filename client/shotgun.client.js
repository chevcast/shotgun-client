(function () {

    // Including extend function so we aren't dependent upon JQuery.
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;
    function isPlainObject(obj) {
        if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
            return false;

        var has_own_constructor = hasOwn.call(obj, 'constructor');
        var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        // Not own constructor property must be Object
        if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
            return false;

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        var key;
        for ( key in obj ) {}

        return key === undefined || hasOwn.call( obj, key );
    };
    function extend() {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && typeof target !== "function") {
            target = {};
        }

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recur if we're merging plain objects or arrays
                    if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }

    // Declare a global shotgun namespace.
    window.shotgun = {

        // Shotgun client shell.
        ClientShell: function (options) {

            var clientShell = this,
                context = {},
                // Default settings.
                defaultSettings = {
                    namespace: 'shotgun',
                    debug: false
                };

            // Override default settings with supplied options.
            var settings = extend(true, {}, defaultSettings, options);

            // Instruct socket.io to connect to the server.
            var socket = clientShell.socket = io.connect('/' + settings.namespace);
            
            // Proxy any listeners onto the socket itself.
            clientShell.on = function () {
                socket.on.apply(socket, arguments);
                return clientShell;
            };

            function getCookies() {
                var cookies = {};
                if (document.cookie.length > 0)
                    document.cookie.split(';').forEach(function (cookie) {
                        var components = cookie.split('='),
                            name = components[0].trim(),
                            value = components[1];
                        if (name.indexOf(settings.namespace + '-') === 0) {
                            name = name.replace(settings.namespace + '-', '');
                            cookies[name] = decodeURIComponent(value);
                        }
                    });
                return cookies;
            }

            clientShell
                // Save context when it changes.
                .on('contextChanged', function (contextData) {
                    context = contextData;
                })
                // Create a function for setting cookies in the browser.
                .on('setCookie', function (name, value, days) {
                    var expiration = new Date();
                    expiration.setDate(expiration.getDate() + days);
                    value = encodeURIComponent(value) + ((days == null) ? "" : ";expires=" + expiration.toUTCString());
                    document.cookie = settings.namespace + '-' + name + "=" + value;
                })
                .on('getCookie', function (name, callback) {
                    // Create a cookies property on the context and fill it with all the cookies for this shell.
                    var cookies = getCookies();
                    callback(cookies[name]);
                })
                .on('getAllCookies', function (callback) {
                    var cookies = getCookies();
                    callback(cookies);
                });

            // Create an execute function that looks similar to the shotgun shell execute function for ease of use.
            clientShell.execute = function (cmdStr, contextOverride, options) {
                // If a context was passed in then override the stored context with it.
                if (contextOverride) context = contextOverride;
                socket.emit('execute', cmdStr, context, options);
                return clientShell;
            };

            return clientShell;
        }

    };

})();
