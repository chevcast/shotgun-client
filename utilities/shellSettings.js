module.exports = exports = {
    parseOptions: function (definedOption, options, cmd, shell) {
        if (definedOption.hasOwnProperty('prompt') && definedOption.multiLinePrompt)
            shell.multiLine();
    }
};