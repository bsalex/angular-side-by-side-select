(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .directive('sideBySideSelect', [
            "$compile",
            function ($compile) {
                var replaceDirectivesMap = {
                        "sourceItemDirective": "source-item-directive",
                        "targetItemDirective": "target-item-directive"
                    },
                    defaults = {
                        "itemsComparator": function (args) {
                            return args.a === args.b;
                        },
                        "sourceEmptyText": "No items",
                        "targetEmptyText": "No items",
                        "sourceTitle": "",
                        "targetTitle": "",
                        "searchFieldPlaceholder": "Search string",
                        "showSearchField": false,
                        "allowDuplicates": false
                    },
                    passedAttributes = [
                        "item",
                        "on-select",
                        "is-selected"
                    ],
                    defaultItemDirective = "default-item-directive";

                function recompile(element) {
                    $compile(element)(element.scope());
                }

                return {
                    restrict: "E",
                    scope: {
                        onGetItems: "&?",
                        items: "=?",
                        itemsComparator: "&?",

                        sourceEmptyText: "@?",
                        targetEmptyText: "@?",

                        sourceItemDirective: "=?",
                        targetItemDirective: "=?",

                        sourceTitle: "@?",
                        targetTitle: "@?",

                        searchFieldPlaceholder: "=?",
                        showSearchField: "=?",

                        allowDuplicates: "=?",
                        ngModel: "="
                    },
                    templateUrl: "sideBySideSelectTemplate.html",
                    controller: "SideBySideSelectController",
                    controllerAs: "sideBySideSelectController",
                    require: ["ngModel"],
                    compile: function (element, attributes) {
                        if (element.data("itemDirectives") === undefined) {
                            element.data("itemDirectives", []);
                        }

                        var itemDirectives = element.data("itemDirectives");

                        angular.forEach(replaceDirectivesMap, function (replaceDirectiveName, directiveName) {
                            if (!(directiveName in attributes)) {
                                itemDirectives[directiveName] = defaultItemDirective;
                            }

                            var directiveNameValue = itemDirectives[directiveName];

                            if (directiveNameValue !== undefined) {
                                var newElement = angular.element("<" + directiveNameValue + "></" + directiveNameValue + ">"),
                                    replacedElement = element.find(replaceDirectiveName);

                                angular.forEach(passedAttributes, function (attributeName) {
                                    newElement.attr(attributeName, replacedElement.attr(attributeName));
                                });
                                replacedElement.replaceWith(newElement);
                            }
                        });


                        return {
                            post: function postLink(scope, element, attributes, controllers) {
                                angular.forEach(defaults, function (defaultValue, key) {
                                    if (!(key in attributes)) {
                                        scope[attributes.$normalize(key)] = defaultValue;
                                    }
                                });

                                if (!("onGetItems" in attributes)) {
                                    delete scope.onGetItems;
                                }

                                var ngModelController = controllers[0],
                                    sideBySideSelectController = scope.sideBySideSelectController;

                                scope.$watchCollection("ngModel", function (newValue) {
                                    sideBySideSelectController.setTargetItems(newValue);
                                });

                                scope.$on("targetDataUpdated", function () {
                                    ngModelController.$setViewValue(sideBySideSelectController.getTargetItems());
                                });

                                function addItemsDirectiveWatcher(directiveName) {
                                    scope.$watch(directiveName, function (newValue, oldValue) {
                                        var directiveNameCurrentValue = itemDirectives[directiveName];

                                        itemDirectives[directiveName] = newValue;

                                        //Initialization here
                                        if (oldValue === newValue) {
                                            if (newValue === undefined && oldValue === undefined) {
                                                return;
                                            }

                                            if ((directiveNameCurrentValue !== newValue) || (element.data("recompiled") !== "true")) {
                                                element.data("recompiled", "true");
                                                recompile(element);
                                            }
                                            return;
                                        }

                                        recompile(element);
                                    });
                                }

                                addItemsDirectiveWatcher("sourceItemDirective");
                                addItemsDirectiveWatcher("targetItemDirective");

                                sideBySideSelectController.setTargetItems(scope.ngModel);

                                sideBySideSelectController.initialize();
                            }
                        };
                    }
                };
            }
        ]);
})();
