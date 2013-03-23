## shotgun-client

shotgun-client is a plugin for [node-shotgun](https://github.com/Chevex/node-shotgun) that allows creation of real-time web consoles that communicate with the shotgun shell on the server.

### Installation

    npm install shotgun-client
    
### Usage

Using the client couldn't be easier. All it takes is some minor configuration on the server and a script reference on the client.

**Simple Http Server:**

    // /app.js
    
    // Create a simple http server.
    var static = require('node-static'),
        http = require('http'),
        file = new(static.Server)('./public');
    
    // Start the server and do things as you normally would.
    var server = http.createServer(function (req, res) {
        req.addListener('end', function () {
            file.serve(req, res);
        });
    }).listen(1337, '127.0.0.1');
    
    // Require shotgun and shotgun-client then create a new shell.
    var shotgun = require('shotgun'),
        shotgunClient = require('shotgun-client'),
        shell = new shotgun.Shell();
    
    // Use shotgun-client to wire up the server and the shell.
    shotgunClient.attach(server, shell);
    
    console.log('Server running at http://127.0.0.1:1337/');
    
If you'd like to see an example of shotgun-client running in an [Express](http://expressjs.com/) app then check out [my example application](https://github.com/Chevex/shotgun-client-example).
    
**Client w/jQuery:**

    <html>
        <head>
            <title>node-client demo</title>
            <style type="text/css">
                body {
                    color: #fff;
                    background-color: #000;
                    padding: 50px;
                }
            </style>
            <script type="text/javascript" src="/scripts/jquery.js" />
            <script type="text/javascript" src="/shotgun/shotgun.client.js" />
            <script type="text/javascript">
                $(function () {
                    $('body').shotgunConsole();
                });
            </script>
        </head>
        <body>
        </body>
    </html>

The included jQuery adapter is designed to get you up and running quickly. Just call `.shotgunConsole()` on any element and it will be instantly transformed into a simple console that communicates directly, in realtime with your shotgun shell on the server. This is more for the user who wants some sort of admin interface for their website. If you need more control you can override the `handleResult()` function and do work with the shotgun shell result manually.

    $('body').shotgunConsole(function (result, $display, $console) {

        //   result - the object returned by the shotgun shell.
        // $display - the element to write text to.
        // $console - the element you called .shotgunConsole() on. In this example it is 'body'.

        if (result.clearDisplay) $display.html('');
        if (result.exit) {
            $console.slideUp('fast', function () {
                $console.empty();
            });
        }
        for (var count = 0; count < result.lines.length; count++) {
            var line = result.lines[count];
            $display.append(line.text.replace(/  /g, ' &nbsp;') + '<br />');
            $this.scrollTop($this[0].scrollHeight);
        };
    });

The code in the example callback function is the same code that is executed if you provide no callback.

If you need something even more customized or simply don't want to use jQuery then it's still really simple. Just create and use the client shell directly.

**Client w/out jQuery**

    <html>
        <head>
            <title>node-client demo</title>
            <style type="text/css">
                body {
                    color: #fff;
                    background-color: #000;
                    padding: 50px;
                }
            </style>
            <script type="text/javascript" src="/scripts/jquery.js" />
            <script type="text/javascript" src="/shotgun/shotgun.client.js" />
            <script type="text/javascript">
                var client = new shotgun.Client();
                client.execute('help', function (result) {
                    console.log(result);
                    // result is the exact same object returned by shell.execute() on the server.
                });
            </script>
        </head>
        <body>
        </body>
    </html>

Note that you have access to `result.context` but you don't have to worry about passing it back into `client.execute`; the shotgun client script will do this for you. However, if for some reason you do need to manipulate the context then you can pass it back like this:


    var client = new shotgun.Client(),
        customContext = {}; // Usually result.context.
    client.execute('help', customContext, function (result) {
        console.log(result);
        // result is the exact same object returned by shell.execute() on the server.
    });