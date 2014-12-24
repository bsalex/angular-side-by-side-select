(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .run(["$templateCache", function ($templateCache) {
            var template = '<div ng-click="onSelect({item: item})">' +
                '<input type="checkbox" ng-checked="isSelected({item: item})"/>' +
                ' {{item.name}}' +
                '</div>';


            $templateCache.put("defaultItemDirective.html", template);
        }]);
})();