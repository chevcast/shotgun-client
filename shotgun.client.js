window.shotgun = {
    Shell: function () {
        var self = this,
            socket = io.connect('/shotgun'),
            context = {},
            resultCallback;
        socket.on('result', function (result) {
            if (resultCallback) resultCallback(result);
        });
        self.execute = function (cmdStr, callback) {
            resultCallback = callback;
            socket.emit('execute', cmdStr, context);
        };
    }
};