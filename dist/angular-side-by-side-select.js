(function () {
    "use strict";

    angular.module("angularSideBySideSelect", []);
})();
(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .factory("List", function () {
            function List(comparator) {
                this.data = [];
                this.selection = [];
                this.comparator = comparator;
            }

            function indexOfWithComparator(item, array, comparator) {
                for (var i = 0; i < array.length; i++) {
                    if (comparator(item, array[i])) {
                        return i;
                    }
                }

                return -1;
            }

            List.prototype = {
                getSelection: function () {
                    return this.selection;
                },
                select: function (item) {
                    if (this.contains(item) && (indexOfWithComparator(item, this.selection, this.comparator) === -1)) {
                        this.selection.push(item);
                    }
                },
                deselect: function (item) {
                    var position = indexOfWithComparator(item, this.selection, this.comparator);

                    if (position !== -1) {
                        this.selection.splice(position, 1);
                    }
                },
                toggle: function (item) {
                    if (indexOfWithComparator(item, this.selection, this.comparator) === -1) {
                        this.select(item);
                    } else {
                        this.deselect(item);
                    }
                },
                clearSelection: function () {
                    this.selection = [];
                },
                getData: function () {
                    return this.data.slice();
                },
                setData: function (data) {
                    this.data = Array.prototype.slice.call(data || []);
                },
                add: function (item) {
                    this.data.push(item);
                },
                remove: function (item) {
                    var position = indexOfWithComparator(item, this.data, this.comparator);

                    if (position !== -1) {
                        this.data.splice(position, 1);
                    }
                },
                contains: function (item) {
                    return (indexOfWithComparator(item, this.data, this.comparator) !== -1);
                },
                isSelected: function (item) {
                    return (indexOfWithComparator(item, this.selection, this.comparator) !== -1);
                }
            };

            return List;
        });
})();

(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .factory("UniqueList", ["List", function (List) {
            function UniqueList() {
                List.apply(this, arguments);
            }

            UniqueList.prototype = new List();

            UniqueList.prototype.add = function (item) {
                if (!List.prototype.contains.call(this, item)) {
                    List.prototype.add.apply(this, arguments);
                }
            };

            return UniqueList;
        }]);
})();

(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .controller("SideBySideSelectController", ["$scope", "List", "UniqueList", SideBySideSelectController]);

    function SideBySideSelectController($scope, List, UniqueList) {
        var me = this;

        this.comparator = function (a, b) {
            return $scope.itemsComparator({a: a, b: b});
        };

        this.updateModel = function () {
            $scope.$emit("targetDataUpdated");
        };


        this.sourceList = new List(this.comparator);
        this.allowDuplicates = $scope.allowDuplicates;
        if (this.allowDuplicates === false) {
            this.targetList = new UniqueList(this.comparator);
        } else {
            this.targetList = new List(this.comparator);
        }

        $scope.$watch("items", function (oldValue, newValue) {
            if (angular.isArray(newValue)) {
                me.onSearchChange("");
            }
        });

        this.onGetItems = function (searchString) {
            if (!$scope.onGetItems) {
                if (!("items" in $scope)) {
                    throw Error("No data source is set. Use \"on-get-items\" or \"items\" attributes.");
                } else if (!angular.isArray($scope.items)) {
                    throw Error("\"items\" attribute should be an array.");
                } else {
                    return $scope.items;
                }
            } else {
                return $scope.onGetItems({text: searchString});
            }
        };
    }

    var filteredItems = [];

    SideBySideSelectController.prototype = {
        initialize: function () {
            this.onSearchChange("");
        },
        onSearchChange: function (searchString) {
            var result = this.onGetItems(searchString),
                me = this;

            if (angular.isArray(result)) {
                me.sourceList.setData(result);
                me.sourceList.clearSelection();
            }

            if (angular.isObject(result) && angular.isFunction(result.then)) {
                result.then(function (data) {
                    me.sourceList.setData(data);
                    me.sourceList.clearSelection();
                }, function () {
                    me.sourceList.setData([]);
                    me.sourceList.clearSelection();
                });
            }
        },
        getSourceItems: function () {
            if (this.allowDuplicates === false) {
                var originalSourceItems = this.sourceList.getData(),
                    originalSourceItemsLength = originalSourceItems.length;

                while (filteredItems.length > 0) {
                    filteredItems.pop();
                }


                for (var i = 0; i < originalSourceItemsLength; i++) {
                    if (!this.targetList.contains(originalSourceItems[i])) {
                        filteredItems.push(originalSourceItems[i]);
                    }
                }

                return filteredItems;
            } else {
                return this.sourceList.getData();
            }
        },
        isInSourceList: function (item) {
            if (this.allowDuplicates === false) {
                return !this.targetList.contains(item) && this.sourceList.contains(item);
            } else {
                return this.sourceList.contains(item);
            }
        },
        isInTargetList: function (item) {
            return this.targetList.contains(item);
        },
        getSourceSelection: function () {
            return this.sourceList.getSelection();
        },
        getTargetSelection: function () {
            return this.targetList.getSelection();
        },
        getTargetItems: function () {
            return this.targetList.getData();
        },
        addToTarget: function (addItems) {
            var me = this;
            if (angular.isArray(addItems)) {
                angular.forEach(addItems, function (item) {
                    me.targetList.add(item);
                });
            } else {
                me.targetList.add(addItems);
            }
            me.sourceList.clearSelection();

            me.updateModel();
        },
        setTargetItems: function (data) {
            var targetItems = this.getTargetItems(),
                equal = true;


            if (data === undefined) {
                equal = false;
            } else if (targetItems.length !== data.length) {
                equal = false;
            } else {
                for (var i = 0; i < targetItems.length; i++) {
                    if (!this.comparator(targetItems[i], data[i])) {
                        equal = false;
                        break;
                    }
                }
            }

            if (equal) {
                return;
            }

            this.targetList.setData(data);
            this.targetList.clearSelection();

            this.updateModel();
        },
        removeFromTarget: function (removeItems) {
            var me = this;

            if (angular.isArray(removeItems)) {
                angular.forEach(removeItems, function (item) {
                    me.targetList.remove(item);
                });
            } else {
                me.targetList.remove(removeItems);
            }

            me.targetList.clearSelection();

            me.updateModel();
        },
        toggleSourceSelection: function (item) {
            this.sourceList.toggle(item);
        },
        toggleTargetSelection: function (item) {
            this.targetList.toggle(item);
        },
        isSelectedInSource: function (item) {
            return this.sourceList.isSelected(item);
        },
        isSelectedInTarget: function (item) {
            return this.targetList.isSelected(item);
        }
    };
})();
(function () {
    "use strict";

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
(function () {
    "use strict";

    angular.module("angularSideBySideSelect")
        .run(["$templateCache", function ($templateCache) {
            var template = '<div class="side-by-side-select-control">' +
                '    <div class="side-by-side-select-control__side side-by-side-select-control__side--source">' +
                '        <div class="side-by-side-select-control__search-form">' +
                '            <input class="form-control" ' +
                '                   type="text" ' +
                '                   placeholder="{{searchFieldPlaceholder}}" ' +
                '                   ng-show="showSearchField" ' +
                '                   ng-change="sideBySideSelectController.onSearchChange(data.searchString)"' +
                '                   ng-model="data.searchString"/>' +
                '        </div>' +
                '        <div class="side-by-side-select-control__panel side-by-side-select-control__panel--source">' +
                '            <div ng-show="sourceTitle" class="side-by-side-select-control__panel-heading">{{sourceTitle}}</div>' +
                '            <div class="side-by-side-select-control__panel-body">' +
                '                <div ng-hide="sideBySideSelectController.getSourceItems().length">{{sourceEmptyText}}</div>' +
                '                <div class="side-by-side-select-control__item side-by-side-select-control__item--source"' +
                '                     ng-class="{\'side-by-side-select-control__item--active\': sideBySideSelectController.isSelectedInSource(item)}"' +
                '                     ng-repeat="item in sideBySideSelectController.getSourceItems(data.searchString) track by $index"' +
                '                     ng-show="sideBySideSelectController.getSourceItems(data.searchString).length">' +

                '                    <source-item-directive ' +
                '                       item="item" ' +
                '                       on-select="sideBySideSelectController.toggleSourceSelection(item)" ' +
                '                       is-selected="sideBySideSelectController.isSelectedInSource(item)">' +
                '                    </source-item-directive>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +

                '    <div class="side-by-side-select-control__arrows">' +
                '        <button class="side-by-side-select-control__move-button side-by-side-select-control__move-button--add-to-target"' +
                '                type="button"' +
                '                ng-click="sideBySideSelectController.addToTarget(sideBySideSelectController.getSourceSelection())">' +
                '        </button>' +
                '        <button class="side-by-side-select-control__move-button side-by-side-select-control__move-button--remove-from-target"' +
                '                type="button"' +
                '                ng-click="sideBySideSelectController.removeFromTarget(sideBySideSelectController.getTargetSelection())">' +
                '        </button>' +
                '    </div>' +

                '    <div class="side-by-side-select-control__side side-by-side-select-control__side--target">' +
                '        <div class="panel panel-success side-by-side-select-control__panel side-by-side-select-control__panel--target">' +
                '            <div ng-show="targetTitle" class="side-by-side-select-control__panel-heading">{{targetTitle}}</div>' +
                '            <div class="side-by-side-select-control__panel-body">' +
                '                <div ng-hide="sideBySideSelectController.getTargetItems().length">{{targetEmptyText}}</div>' +
                '                <div class="side-by-side-select-control__item side-by-side-select-control__item--target"' +
                '                     ng-repeat="item in sideBySideSelectController.getTargetItems() track by $index"' +
                '                     ng-class="{active: sideBySideSelectController.isSelectedInTarget(item)}"' +
                '                     ng-show="sideBySideSelectController.getTargetItems().length">' +

                '                    <target-item-directive' +
                '                       item="item" ' +
                '                       on-select="sideBySideSelectController.toggleTargetSelection(item)" ' +
                '                       is-selected="sideBySideSelectController.isSelectedInTarget(item)">' +
                '                    </target-item-directive>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>';


            $templateCache.put("sideBySideSelectTemplate.html", template);
        }]);
})();







