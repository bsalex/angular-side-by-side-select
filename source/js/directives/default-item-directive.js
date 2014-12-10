(function () {
    angular.module("angularSideBySideSelect")
        .directive("defaultItemDirective", [
            function () {
                return {
                    restrict: "E",
                    scope: {
                        item: "=",
                        onSelect: "&",
                        isSelected: "&"
                    },
                    templateUrl: "defaultItemDirective.html"
                };
            }
        ]);
})();
