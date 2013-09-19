(function ($) {

    $.fn.shotgunConsole = function (options, callback) {
        var $console = this,
            clientShell = new shotgun.ClientShell(options),
            cliText = '&gt;&nbsp;';

        var $display = $('<div>').appendTo($console);

        var $cliContainer = $('<div>').appendTo($console);

        var $cliText = $('<span>').html(cliText).appendTo($cliContainer);

        var $cli = $('<input>')
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
            .focus();

        function onData(data, context) {
            if (data.clearDisplay) $display.html('');
            $cli.attr('type', data.password ? 'password' : 'text');

            if (context.passive)
                $cliText.html(context.passive.msg + cliText);
            else
                $cliText.html(cliText);

            if (data.line) {
                var $line = $('<div>'),
                    text = data.line.text.replace(/(  +)/g, function (match) {
                        return new Array(match.length + 1).join('&nbsp;');
                    }).replace(/(\r\n|\r|\n)/, '');

                text = text.length > 0 ? text : '&nbsp;';

                switch (data.line.type) {
                    case 'warn':
                        text = 'WARNING: ' + text;
                        break;
                    case 'error':
                        text = 'ERROR: ' + text;
                        break;
                    case 'debug':
                        text = 'DEBUG: ' + text;
                }

                $line.addClass(data.line.type);
                $line.appendTo($display);

                if ('coolType' in $.fn && !data.line.options.dontType) {
                    var coolTypeOptions = {
                        typeSpeed: 0,
                        delayBeforeType: 0,
                        delayAfterType: 0,
                        onComplete: $console.data.bind($console, 'busy', false)
                    };
                    if (data.line.options.coolTypeOptions)
                        $.extend(true, coolTypeOptions, data.line.options.coolTypeOptions);
                    $line.coolType(text, coolTypeOptions);
                }
                else
                    $line.html(text);

                $console.scrollTop($console[0].scrollHeight);
            }
            else
                $console.data('busy', false);
        }

        clientShell.onData(function (data, context) {
            onData(data, context);
            if (callback) callback(data, context);
        });

        $cli.keypress(function (e) {
            var busy = $console.data('busy');
            if (e.which == 13 && !busy && $cli.val().length > 0) {
                $console.data('busy', true);
                clientShell.execute($cli.val());
                $cli.val('');
            }
        });

        return {
            execute: function (cmdStr, options) {
                var busy = $console.data('busy');
                if (!busy) {
                    $console.data('busy', true);
                    clientShell.execute(cmdStr);
                }
            },
            $console: $console,
            $display: $display,
            $cli: $cli,
            $cliText: $cliText,
            $cliContainer: $cliContainer,
            clientShell: clientShell
        };
    };
})(jQuery);