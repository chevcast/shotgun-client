angular.module('shotgun', [])
    .directive('shotgunConsole', function () {
        return {
            restrict: 'EACM',
            replace: true,
            template: '<div class="console-container"><div class="console-display"></div><div style="margin-top: 10px;" class="console-cli-container"><span class="console-cli-text">&gt;&nbsp;</span><input class="console-cli" type="text" autofocus="autofocus" class="single-line cli" style="font-family: inherit; font-size: inherit; font-style: inherit; font-variant: inherit; font-weight: inherit; line-height: inherit; color: inherit; background-color: transparent; width: 75%; border: none; outline: none; resize: none;"></div></div>'
            scope: {
                cliText: '&gt;&nbsp;'
            },
            link: function (scope, elem, attrs) {
                var input = $($elem.children()[0]),
                    button = $($elem.children()[1]);
                $scope.$watch('value', function (val) {
                    input.val(val);
                });
                input.autocomplete({
                    source: $scope.source(),
                    select: function (event, ui) {
                        $scope.$apply(function () {
                            $scope.value = ui.item.value;
                        });
                    },
                    close: function () {
                        input.autocomplete('option', 'minLength', 9999);
                    },
                    minLength: 9999
                });
                button.click(function () {
                    input.autocomplete('option', 'minLength', 0);
                    input.autocomplete('search', input.val());
                });
            }
        };
    });
