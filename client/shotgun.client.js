window.shotgun = {
    Client: function (namespace) {
        var self = this,
            storedContext = {},
            resultCallback;
        self.socket = io.connect('/' + (namespace || 'shotgun'));
        self.setCookie = function(name, value, days)
        {
            var expiration = new Date();
            expiration.setDate(expiration.getDate() + days);
            var value = encodeURIComponent(value) + ((days == null) ? "" : "; expires=" + expiration.toUTCString());
            document.cookie = name + "=" + value;
        };
        self.socket.on('result', function (result) {
            storedContext = result.context;
            if (result.cookies)
                result.cookies.forEach(function (cookie) {
                    self.setCookie(cookie.name, cookie.value, cookie.days);
                });
            if (resultCallback) resultCallback(result);
        });
        self.execute = function (cmdStr) {
            var context = {};
            switch (arguments.length) {
                case 2:
                    resultCallback = arguments[1];
                    context = storedContext;
                    break;
                case 3:
                    context = arguments[1];
                    resultCallback = arguments[2];
                    break;
            }
            if (document.cookie.length > 0)
                document.cookie.split(';').forEach(function (cookie) {
                    var components = cookie.split('=');
                    if (!context.cookies) context.cookies = {};
                    context.cookies[components[0]] = components[1];
                });
            self.socket.emit('execute', cmdStr, context);
        };
    }
};