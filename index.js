var sio = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
    extend = require('extend'),
    async = require('async'),
    shellHelpers = require('./utilities/shellHelpers'),
    shellSettings = require('./utilities/shellSettings');

exports.attach = function (server) {

    // Store all the request listeners already defined on this http server.
    var oldListeners = server.listeners('request').splice(0);

    // Remove all the request listeners already defined on this http server.
    server.removeAllListeners('request');

    // Add our own request listener to the http server.
    server.on('request', function (req, res) {

        // If the request URL does not match the one we want to handle then invoke the pre-existing request listeners.
        if (req.url !== '/shotgun/shotgun.client.js') {
            for (var i = 0, l = oldListeners.length; i < l; i++) {
                oldListeners[i].call(server, req, res);
            }
        }

        // If the URL does match then serve up the following scripts:
        else {
            var filePaths = [
                // socket.io
                '/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js',
                // shotgun client
                '/client/shotgun.client.js',
                // cooltype
                '/client/jquery.cooltype.js',
                // shotgunConsole
                '/client/jquery.shotgunConsole.js'
            ], readFuncs = [];

            filePaths.forEach(function (filePath) {
                filePath = path.join(__dirname, filePath);
                readFuncs.push(fs.readFile.bind(fs, filePath));
            });

            async.parallel(readFuncs, function (err, files) {
                if (err) throw err;
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(files.join('\n\n'));
            });
        }

    });

    // Instantiate socket.io server.
    var io = sio.listen(server, { log: false });

    // Create an array of all arguments passed in except the first one.
    // The first argument was the http server and all other arguments are expected to be shotgun hell instances.
    var shells = [].splice.call(arguments,1);

    // Iterate over each shell and associate a socket.io namespace with each shell instance passed in.
    shells.forEach(function (shell) {

        // Add io to the shell for advanced users.
        shell.io = io;

        // Attach shotgun-client shell helpers to the shell instance so they are available to our command modules.
        extend(shell, shellHelpers);

        // Attach shotgun-client shell settings to the shell.
        extend(shell.settings, shellSettings);

        // Setup socket.io namespace for the current shell.
        io.of('/' + shell.settings.namespace)
            .on('connection', function (socket) {

                // Listen for our custom "execute" socket.io event and invoke "execute" on the shell.
                socket.on('execute', function (cmdStr, context, options) {

                    // Add current socket to context for advanced users.
                    context.socket = socket;

                    // If the shell has its debug setting enabled then write out user input to console.
                    if (shell.settings.debug) console.log('%s: %s', shell.settings.namespace, cmdStr);

                    // Configure the shell for this execution.
                    shell
                        // Remove the "any" listener.
                        .offAny()
                        // Attach a new "any" listener for this request.
                        .onAny(function () {
                            if (this.event === 'contextChanged') {
                                var contextData = arguments[0];
                                delete contextData.socket;
                                socket.emit('contextChanged', contextData);
                                return;
                            }
                            var args = Array.prototype.splice.call(arguments, 0);
                            args.unshift(this.event);
                            socket.emit.apply(socket, args);
                        })
                        // Instruct the shell to process the command string for this request.
                        .execute(cmdStr, context, options);
                });

            });
    });

    // Return any relevant internals for shotgun-client.
    return {
        io: io,
        shells: shells
    };
};
