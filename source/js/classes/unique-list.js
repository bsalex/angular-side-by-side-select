(function () {
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
        }])
})();
