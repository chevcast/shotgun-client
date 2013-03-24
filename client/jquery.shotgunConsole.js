(function ($) {

    $.fn.shotgunConsole = function (callback) {
        var $console = this,
            client = new shotgun.Client(),
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

        $cli.keypress(function (e) {
            if (e.which == 13) {
                client.execute($cli.val(), function (result) {
                    if (result.clearDisplay) $display.html('');
                    $cli.attr('type', result.password ? 'password' : 'text');
                    if (result.context) {
                        if (result.context.prompt)
                            $cliText.html(result.context.prompt.var + ':&nbsp;');
                        else if (result.context.passive)
                            $cliText.html(result.context.passive.msg + cliText);
                        else
                            $cliText.html(cliText);
                    }
                    if (callback)
                        callback(result, $display, $console);
                    for (var count = 0; count < result.lines.length; count++) {
                        var line = result.lines[count],
                            $line = $('<div>')
                            text = line.text.replace(/  /g, ' &nbsp;') + '<br />';
                        switch (line.type) {
                            case 'warn':
                                text = 'warning: ' + text;
                                break;
                            case 'error':
                                text = 'error: ' + text;
                                break;
                        }
                        $line.html(text).appendTo($display);
                        $console.scrollTop($console[0].scrollHeight);
                    };
                });
                $cli.val('');
            }
        });
    };
})(jQuery);