(function ($) {
    $.fn.shotgunConsole = function () {
        var $this = this,
            client = new shotgun.Client(),
            $display = $('<div>')
                .appendTo($this);
            $cliContainer = $('<div>')
                .html('&gt;&nbsp;')
                .appendTo($this),
            $cli = $('<input>')
                .attr('type', 'text')
                .css({
                    backgroundColor: 'transparent',
                    color: $this.css('color'),
                    fontSize: $this.css('font-size'),
                    width: '75%',
                    border: 'none',
                    outline: 'none',
                    marginTop: '5px'
                })
                .appendTo($cliContainer);

        $cli.keypress(function (e) {
            if (e.which == 13) {
                client.execute($cli.val(), function (result) {
                    if (result.clearDisplay) $display.html('');
                    if (result.exit) {
                        window.open('','_self','');
                        window.close();
                    }
                    for (var count = 0; count < result.lines.length; count++) {
                        var line = result.lines[count];
                        $display.append(line.text.replace(/  /g, ' &nbsp;') + '<br />');
                        $this.scrollTop($this[0].scrollHeight);
                    };
                });
                $cli.val('');
            }
        });
    };
})(jQuery);