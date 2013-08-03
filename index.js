var io = require('socket.io'),
    fs = require('fs'),
    path = require('path');

exports.debug = false;

exports.attach = function (server) {
    var oldListeners = server.listeners('request').splice(0);
    server.removeAllListeners('request');
    server.on('request', function (req, res) {
        if (req.url !== '/shotgun/shotgun.client.js') {
            for (var i = 0, l = oldListeners.length; i < l; i++) {
                oldListeners[i].call(server, req, res);
            }
        }
        else {
            try {
                fs.readFile(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'), function (err, socketIoClient) {
                    fs.readFile(path.join(__dirname, '/client/shotgun.client.js'), function (err, shotgunClient) {
                        fs.readFile(path.join(__dirname, '/client/jquery.cooltype.js'), function (err, jqueryCoolType) {
                            fs.readFile(path.join(__dirname, '/client/jquery.shotgunConsole.js'), function (err, jqueryShotgunConsole) {
                                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                                res.end(socketIoClient + '\n\n' + shotgunClient + '\n\n' + jqueryCoolType + '\n\n' + jqueryShotgunConsole);
                            });
                        });
                    });
                });
            }
            catch (e) {
            }
        }
    });
    var sio = io.listen(server, { log: false });
    var args = [].splice.call(arguments,1);
    args.forEach(function (shell) {
        shell.helpers.setCookie = function (name, value, days) {
            if (!this.cookies) this.cookies = [];
            this.cookies.push({
                name: name,
                value: value,
                days: days
            });
        };
        sio.of('/' + shell.namespace)
            .on('connection', function (socket) {
                socket.on('execute', function (cmdStr, context, options) {
                    if (exports.debug) console.log('%s: %s', shell.namespace, cmdStr);
                    var result = shell.execute(cmdStr, context, options);
                    socket.emit('result', result);
                });
            });
    });
};