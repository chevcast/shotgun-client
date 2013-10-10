module.exports = exports = {
    parseOptions: function (key, definedOptions, options, cmd, shell) {
        var definedOption = definedOptions[key];
        if (definedOption.hasOwnProperty('prompt') && definedOption.multiLinePrompt && !options.hasOwnProperty(key))
            shell.multiLine();
    }
};