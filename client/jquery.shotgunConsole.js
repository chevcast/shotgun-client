(function ($) {

    $.fn.shotgunConsole = function (namespace, callback) {
        var $console = this,
            client = new shotgun.Client(namespace),
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

        function handleResult(result) {
            if (result.clearDisplay) $display.html('');
            $cli.attr('type', result.password ? 'password' : 'text');

            if (result.context) {
                if (result.context.passive)
                    $cliText.html(result.context.passive.msg + cliText);
                else
                    $cliText.html(cliText);
            }

            if (callback)
                callback(result, $display, $console);

            var index = 0;
            (function typeLine() {
                if (index < result.lines.length) {
                    var line = result.lines[index++],
                        $line = $('<div>'),
                        text = line.text.replace(/(  +)/g, function (match) {
                            return new Array(match.length + 1).join('&nbsp;');
                        }).replace(/(\r\n|\r|\n)/, '');

                    text = text.length > 0 ? text : '&nbsp;';

                    switch (line.type) {
                        case 'warn':
                            text = 'Warning: ' + text;
                            $line.css('color', '#ff0');
                            break;
                        case 'error':
                            text = 'Error: ' + text;
                            $line.css('color', '#0f0');
                            break;
                        case 'debug':
                            text = 'Debug: ' + text;
                            $line.css('color', '#00f');
                    }

                    $line.appendTo($display);
                    var dontType = !line.options || !line.options.dontType;
                    if ('coolType' in $.fn && text.length > 0 && dontType) {
                        var typeOptions = {
                            typeSpeed: 0,
                            delayBeforeType: 0,
                            delayAfterType: 0,
                            onComplete: typeLine
                        };
                        if (line.options && line.options.typeOptions)
                            $.extend(typeOptions, line.options.typeOptions);
                        $line.coolType(text, typeOptions);
                    }
                    else {
                        $line.html(text);
                        typeLine();
                    }

                    $console.scrollTop($console[0].scrollHeight);
                }
                else
                    $console.data('busy', false);
            })();
        }

        $cli.keypress(function (e) {
            var busy = $console.data('busy');
            if (e.which == 13 && !busy && $cli.val().length > 0) {
                $console.data('busy', true);
                client.execute($cli.val(), handleResult);
                $cli.val('');
            }
        });

        return {
            execute: function (cmdStr) {
                var busy = $console.data('busy');
                if (!busy) {
                    $console.data('busy', true);
                    client.execute(cmdStr, handleResult);
                }
            },
            $console: $console,
            $display: $display,
            $cli: $cli,
            $cliText: $cliText,
            client: client,
            handleResult: handleResult
        };
    };
})(jQuery);