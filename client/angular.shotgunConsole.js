(function (angular) {
    if (typeof angular === 'undefined')
        return;

    // Place the directive inside a custom "shotgun" angular module/namespace.
    angular.module('shotgun', []).directive('shotgunConsole', function () {
        return {
            // Allow users to use the directive any way they choose.
            restrict: 'EACM',
            link: function (scope, element, attrs) {
                
                // Simply invoke the JQuery adapter and get reference to the client shell.
                var clientShell = element.shotgunConsole(attrs);

                // Don't attach the shell to the scope if noScope is true.
                if (!attrs.noScope) {

                    // Create a shotgunShells namespace on our scope object.
                    if (!scope.hasOwnProperty('shotgunShells')) scope.shotgunShells = {};

                    // Attach the shell instance to a hash of instantiated shells, using its
                    // namespace as the property name.
                    scope.shotgunShells[clientShell.settings.namespace] = clientShell;

                }

                // If an "execute" property was included then pass the value to the shell.
                if (attrs.execute) clientShell.execute(attrs.execute);

            }
        };
    });
})(angular);
