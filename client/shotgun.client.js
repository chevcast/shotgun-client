(function () {

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

    window.shotgun = {
        // Shotgun client shell.
        ClientShell: function (options) {
            var clientShell = this,
                dataCallback,
                settings = {
                    namespace: 'shotgun',
                    debug: false
                };

            extend(true, settings, options);

            clientShell.context = {};

            clientShell.socket = io.connect('/' + settings.namespace);

            clientShell.setCookie = function(name, value, days)
            {
                var expiration = new Date();
                expiration.setDate(expiration.getDate() + days);
                value = encodeURIComponent(value) + ((days == null) ? "" : "; expires=" + expiration.toUTCString());
                document.cookie = name + "=" + value;
            };

            clientShell.socket.on('data', function (data, context) {
                clientShell.context = context;
                if (context.newCookies)
                    for (var name in context.newCookies) {
                        if (context.newCookies.hasOwnProperty(name)) {
                            var cookie = context.newCookies[name];
                            clientShell.setCookie(name, cookie.value, cookie.days);
                        }
                    }
                if (dataCallback) dataCallback(data);
            });

            clientShell.onData = function (callback) {
                dataCallback = function (data) {
                    callback(data, clientShell.context);
                    return clientShell;
                };
                return clientShell;
            };

            clientShell.execute = function (cmdStr, options) {
                clientShell.context.cookies = {};
                if (document.cookie.length > 0)
                    document.cookie.split(';').forEach(function (cookie) {
                        var components = cookie.split('=');
                        clientShell.context.cookies[components[0]] = components[1];
                    });
                clientShell.socket.emit('execute', cmdStr, options, clientShell.context);
                return clientShell;
            };

            return clientShell;
        }
    };
})();