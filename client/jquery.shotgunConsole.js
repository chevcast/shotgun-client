(function ($) {

    // Declare shotgun JQuery adapter.
    $.fn.shotgunConsole = function (options) {
        var $console = this,
            clientShell = new shotgun.ClientShell(options),
            cliText = '&gt;&nbsp;',
            $display = $('<div>').appendTo($console),
            $cliContainer = $('<div>').appendTo($console),
            $cliText = $('<span>').html(cliText).appendTo($cliContainer),
            $cli = $('<input>')
                .attr('type', 'text')
                .attr('autofocus', 'autofocus')
                .css({
                    backgroundColor: 'transparent',
                    color: $console.css('color'),
                    fontSize: $console.css('font-size'),
                    width: '75%',
                    border: 'none',
                    outline: 'none',
                    marginTop: '20px'
                })
                .appendTo($cliContainer)
                .focus(),
            ui = {
                $console: $console,
                $display: $display,
                $cli: $cli,
                $cliText: $cliText,
                $cliContainer: $cliContainer
            },
            lineQueue = [],
            cliHistory = [],
            cliIndex = -1,
            send,
            saveContext,
            api;

        saveContext = send = function () {
            return api;
        };

        // Setup api object to pass back.
        api = {
            onSaveContext: function (callback) {
                saveContext = function (context) {
                    callback(context);
                    return api;
                };
                return api;
            },
            onData: function (callback) {
                send = function (data) {
                    callback(data);
                    return api;
                };
                return api;
            },
            execute: function (cmdStr, context, options) {
                if (!$console.data('busy')) {
                    clientShell.execute(cmdStr, context, options);
                }
                return api;
            },
            clientShell: clientShell,
            ui: ui
        };

        // Declare function for parsing the data received from shotgun.
        function parseData(data) {

            // If clearDisplay:true then empty the $display element.
            if (data.clearDisplay) $display.html('');

            // If password:true then change the $cli input type to password.
            if (data.password)
                $cli.attr('type', 'password');

            // If there is a line object then display it.
            if (data.line) {

                // Declare function to write out lines of text from the queue.
                function writeLines() {
                    var line = lineQueue.shift(),
                        $line = $('<div>'),
                        // Preserve multiple spaces and remove newline characters.
                        // Browsers like to shrink multiple spaces down to a single space.
                        text = line.text.replace(/(  +)/g, function (match) {
                            return new Array(match.length + 1).join('&nbsp;');
                        }).replace(/(\r\n|\r|\n)/, '');

                    // If text is empty then force a non-breaking space for compatibility with JQuery and coolType.
                    text = text.length > 0 ? text : '&nbsp;';

                    // Prepend warning, error, and debug lines with the relevant label.
                    switch (line.type) {
                        case 'warn':
                            text = 'WARNING: ' + text;
                            break;
                        case 'error':
                            text = 'ERROR: ' + text;
                            break;
                        case 'debug':
                            text = 'DEBUG: ' + text;
                    }

                    // Give the line of text a CSS class with the same name as the line type so it can be styled if needed.
                    $line.addClass(line.type);
                    $line.appendTo($display);

                    // Create a callback function for coolType plugin.
                    function onComplete() {
                        // If the queue is empty then finish.
                        if (lineQueue.length == 0)
                            $console.data('busy', false);
                        // Otherwise continue writing lines.
                        else
                            writeLines();
                    }

                    // If coolType plugin is available and dontType:false then pass the text to coolType.
                    if ('coolType' in $.fn && !line.options.dontType) {
                        // Default coolType options.
                        var coolTypeOptions = {
                            typeSpeed: 0,
                            delayBeforeType: 0,
                            delayAfterType: 0,
                            onComplete: onComplete
                        };
                        // If the command module specified coolType options then override the defaults with them.
                        if (line.options.coolTypeOptions)
                            $.extend(true, coolTypeOptions, line.options.coolTypeOptions);
                        // Pass the text and options to coolType.
                        $line.coolType(text, coolTypeOptions);
                    }
                    // Otherwise simply display the whole line instantly and invoke the callback immediately.
                    else {
                        $line.html(text);
                        onComplete();
                    }

                    $console.scrollTop($console[0].scrollHeight);
                }

                // Add the line of text to the queue.
                lineQueue.push(data.line);

                // If writeLines is not already processing lines in the queue then start it.
                if (!$console.data('busy')) {
                    $console.data('busy', true);
                    writeLines();
                }
            }
        }

        // When the context is updated update the CLI text and invoke the saveContext callback.
        clientShell.onSaveContext(function (context) {
            if (context.prompt)
                $cliText.html(context.prompt.msg + cliText);
            else
                $cliText.html(cliText);
            saveContext(context);
        });

        // When data is received call parseData and invoke the send callback.
        clientShell.onData(function (data) {
            parseData(data);
            send(data);
        });

        // Declare an enum for the keyboard input we are interested in.
        var keys = {
            enter: 13,
            upArrow: 38,
            downArrow: 40
        };

        $cli
            // Handle enter key and send CLI text to shotgun.
            .keypress(function (e) {
                if (e.which == keys.enter && !$console.data('busy') && $cli.val().length > 0) {
                    // Get user input.
                    var cliText = $cli.val();
                    // Send user input to shotgun shell.
                    clientShell.execute(cliText);
                    // If the $cli input type is password then set it back to regular text.
                    if ($cli.attr('type') === 'password')
                        $cli.attr('type', 'text');
                    // If the user input was not password data then add the user input to the CLI text history.
                    else
                        cliHistory.push(cliText);
                    // Clear the $cli input.
                    $cli.val('');
                    // Reset CLI history index.
                    cliIndex = -1;
                }
            })
            // Implement CLI text history arrows.
            .keydown(function (e) {
                if ($cli.attr('type') === 'password') return;
                switch (e.which) {
                    case keys.upArrow:
                        if (cliHistory.length > 0) {
                            if (cliIndex === -1)
                                cliIndex = cliHistory.length - 1;
                            else if (cliIndex > 0)
                                cliIndex--;
                        }
                        $cli.val(cliHistory[cliIndex]);
                        break;
                    case keys.downArrow:
                        if (cliIndex < cliHistory.length - 1 && cliIndex > -1)
                            cliIndex++;
                        else if (cliIndex === cliHistory.length - 1)
                            cliIndex = -1;
                        $cli.val(cliHistory[cliIndex]);
                        break;
                }
            });

        // Return our API object.
        return api;
    };
})(jQuery);