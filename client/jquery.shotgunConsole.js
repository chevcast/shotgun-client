(function ($) {

    $.fn.shotgunConsole = function (handleResult) {
        var $console = this,
            client = new shotgun.Client();

        var $display = $('<div>').appendTo($console);

        var $cliContainer = $('<div>').html('&gt;&nbsp;').appendTo($console);

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

        $cli.keypress(function (e) {
            if (e.which == 13) {
                client.execute($cli.val(), function (result) {
                    if (handleResult)
                        handleResult(result, $display, $console);
                    else {
                        if (result.clearDisplay) $display.html('');
                        if (result.exit) {
                            $console.slideUp('fast', function () {
                                $console.empty();
                            });
                        }
                        for (var count = 0; count < result.lines.length; count++) {
                            var line = result.lines[count];
                            $display.append(line.text.replace(/  /g, ' &nbsp;') + '<br />');
                            $console.scrollTop($console[0].scrollHeight);
                        };
                    }
                });
                $cli.val('');
            }
        });
    };
})(jQuery);