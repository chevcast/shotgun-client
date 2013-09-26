(function ($) {

    $.fn.shotgunConsole = function (options, callback) {
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
            lineQueue = [];

        function onData(data, context) {
            if (data.clearDisplay) $display.html('');
            $cli.attr('type', data.password ? 'password' : 'text');

            if (context.passive)
                $cliText.html(context.passive.msg + cliText);
            else
                $cliText.html(cliText);

            if (data.line) {
                function writeLines() {
                    var line = lineQueue.shift(),
                        $line = $('<div>'),
                        text = line.text.replace(/(  +)/g, function (match) {
                            return new Array(match.length + 1).join('&nbsp;');
                        }).replace(/(\r\n|\r|\n)/, '');

                    text = text.length > 0 ? text : '&nbsp;';

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

                    $line.addClass(line.type);
                    $line.appendTo($display);

                    function onComplete() {
                        if (lineQueue.length == 0)
                            $console.data('busy', false);
                        else
                            writeLines();
                    }

                    if ('coolType' in $.fn && !line.options.dontType) {
                        var coolTypeOptions = {
                            typeSpeed: 0,
                            delayBeforeType: 0,
                            delayAfterType: 0,
                            onComplete: onComplete
                        };
                        if (line.options.coolTypeOptions)
                            $.extend(true, coolTypeOptions, line.options.coolTypeOptions);
                        $line.coolType(text, coolTypeOptions);
                    }
                    else {
                        $line.html(text);
                        onComplete();
                    }

                    $console.scrollTop($console[0].scrollHeight);
                }
                lineQueue.push(data.line);
                if (!$console.data('busy')) {
                    $console.data('busy', true);
                    writeLines();
                }
            }
        }

        clientShell.onData(function (data, context) {
            onData(data, context);
            if (callback) callback(data, context, ui);
        });

        $cli.keypress(function (e) {
            if (e.which == 13 && !$console.data('busy') && $cli.val().length > 0) {
                clientShell.execute($cli.val());
                $cli.val('');
            }
        });

        return {
            execute: function (cmdStr, options) {
                if (!$console.data('busy')) {
                    clientShell.execute(cmdStr);
                }
            },
            clientShell: clientShell,
            ui: ui
        };
    };
})(jQuery);