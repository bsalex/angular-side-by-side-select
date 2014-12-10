(function () {
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
                    return (indexOfWithComparator(item, this.data, this.comparator) !== -1)
                },
                isSelected: function (item) {
                    return (indexOfWithComparator(item, this.selection, this.comparator) !== -1)
                }
            };

            return List;
        });
})();
