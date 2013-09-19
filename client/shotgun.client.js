window.shotgun = {
    Client: function (namespace) {
        var clientShell = this,
            storedContext = {},
            dataCallback;
        clientShell.socket = io.connect('/' + (namespace || 'shotgun'));
        clientShell.setCookie = function(name, value, days)
        {
            var expiration = new Date();
            expiration.setDate(expiration.getDate() + days);
            var value = encodeURIComponent(value) + ((days == null) ? "" : "; expires=" + expiration.toUTCString());
            document.cookie = name + "=" + value;
        };
        clientShell.socket.on('data', function (data, context) {
            storedContext = context;
            if (context.cookies)
                context.cookies.forEach(function (cookie) {
                    clientShell.setCookie(cookie.name, cookie.value, cookie.days);
                });
            if (dataCallback) dataCallback(result);
        });
        clientShell.execute = function (cmdStr) {
            var context = {};
            switch (arguments.length) {
                case 2:
                    dataCallback = arguments[1];
                    context = storedContext;
                    break;
                case 3:
                    context = arguments[1];
                    dataCallback = arguments[2];
                    break;
            }
            context.cookies = {};
            if (document.cookie.length > 0)
                document.cookie.split(';').forEach(function (cookie) {
                    var components = cookie.split('=');
                    context.cookies[components[0]] = components[1];
                });
            clientShell.socket.emit('execute', cmdStr, context);
            return clientShell;
        };
        return clientShell;
    }
};