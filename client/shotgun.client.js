window.shotgun = {
    Client: function (namespace) {
        var self = this,
            storedContext = {},
            resultCallback;
        self.socket = io.connect('/' + (namespace || 'shotgun'));
        self.socket.on('result', function (result) {
            storedContext = result.context;
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
            self.socket.emit('execute', cmdStr, storedContext);
        };
    }
};