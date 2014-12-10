(function () {
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
                    };

                function recompile(element) {
                    $compile(element)(element.scope());
                }


                return {
                    restrict: "E",
                    scope: {
                        onGetItems: "&?",
                        items:"=?",
                        itemsComparator: "&?",

                        sourceEmptyText: "@?",
                        targetEmptyText: "@?",

                        sourceItemDirective: "=?",
                        targetItemDirective: "=?",

                        sourceTitle: "@?",
                        targetTitle: "@?",

                        searchFieldPlaceholder: "=?",
                        showSearchField: "=?",

                        allowDuplicates: "=?"
                    },
                    templateUrl: "sideBySideSelectTemplate.html",
                    controller: "SideBySideSelectController",
                    controllerAs: "sideBySideSelectController",
                    require: ["ngModel"],
                    compile: function (element, attributes) {
                        var itemDirectives = this.itemDirectives || [];
                        this.itemDirectives = itemDirectives;

                        angular.forEach(replaceDirectivesMap, function (replaceDirectiveName, directiveName) {
                            if (!(directiveName in attributes)) {
                                itemDirectives[directiveName] = "default-item-directive";
                            }

                            var directiveNameValue = itemDirectives[directiveName];

                            if (directiveNameValue !== undefined) {
                                var newElement = angular.element("<" + directiveNameValue + "></" + directiveNameValue + ">"),
                                    replacedElement = element.find(replaceDirectiveName);

                                var passedAttributes = [
                                    "item",
                                    "on-select",
                                    "is-selected"
                                ];

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


                                ngModelController.$formatters.push(function (data) {
                                    sideBySideSelectController.setTargetItems(data);
                                });

                                function updateModel() {
                                    ngModelController.$setViewValue(sideBySideSelectController.getTargetItems());
                                }

                                scope.$on("targetDataUpdated", function () {
                                    updateModel();
                                });


                                function addItemsDirectiveWatcher(directiveName) {
                                    scope.$watch(directiveName, function (newValue, oldValue) {
                                        var directiveNameCurrentValue = itemDirectives[directiveName];

                                        if ((newValue === directiveNameCurrentValue) &&
                                            (directiveNameCurrentValue !== undefined)) {
                                            return;
                                        }

                                        itemDirectives[directiveName] = newValue;

                                        //Initialization here
                                        if (oldValue === newValue) {
                                            if (directiveNameCurrentValue === undefined) {
                                                recompile(element);
                                            }
                                            return;
                                        }

                                        recompile(element);
                                    });
                                }

                                addItemsDirectiveWatcher("sourceItemDirective");
                                addItemsDirectiveWatcher("targetItemDirective");

                                sideBySideSelectController.initialize();
                            }
                        };
                    }
                }
            }
        ]);
})();
