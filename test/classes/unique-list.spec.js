describe("UniqueList", function () {
    "use strict";

    var UniqueList;

    beforeEach(module('angularSideBySideSelect'));
    beforeEach(function () {
        inject(function ($injector) {
            UniqueList = $injector.get("UniqueList");
        });
    });

    it("should be instantiable", function () {
        return new UniqueList();
    });

    describe("data", function () {
        var list,
            testData;

        function simpleComparator(a, b) {
            return a.name === b.name;
        }

        beforeEach(function () {
            testData = [
                {
                    name: "test"
                },
                {
                    name: "test2"
                }
            ];
            list = new UniqueList(simpleComparator);
        });

        it("should ignore adding item if it already exists in data", function () {
            list.setData(testData);
            list.add(testData[0]);

            expect(list.getData()).toEqual(testData);
        });
    });
});