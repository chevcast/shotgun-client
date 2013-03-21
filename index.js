var io = require('socket.io');

exports.attach = function (server, shell) {
    io.listen(server)
        .of('/shotgun')
        .on('connection', function (socket) {
            socket.on('execute', function (cmdStr, context, options) {
            var result = shell.execute(cmdStr, context, options);
            socket.emit('result', result);
        });
    });
};