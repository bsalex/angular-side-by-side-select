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