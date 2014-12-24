describe("List", function () {
    "use strict";

    var List;
    beforeEach(module('angularSideBySideSelect'));
    beforeEach(function () {
        inject(function ($injector) {
            List = $injector.get("List");
        });
    });

    it("should be instantiable", function () {
        return new List();
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
            list = new List(simpleComparator);
        });

        it("should allow to set data", function () {
            list.setData(testData);

            expect(list.getData()).toEqual(testData);
        });

        it("should clean data if undefined is passed as an argument to set data", function () {
            list.setData(undefined);

            expect(list.getData()).toEqual([]);
        });

        it("should clean data if null is passed as an argument to set data", function () {
            list.setData(null);

            expect(list.getData()).toEqual([]);
        });

        it("should allow to add items", function () {
            list.add({name: "test"});

            expect(list.getData()).toEqual([{name: "test"}]);
        });

        it("should allow to add the same item twice", function () {
            var item = {name: "test"};
            list.add(item);
            list.add(item);

            expect(list.getData()).toEqual([item, item]);
        });

        it("should remove data", function () {
            list.setData(testData);
            list.remove(testData[0]);

            expect(list.getData()).toEqual([testData[1]]);
        });

        it("should ignore removing if not existent item", function () {
            list.remove(testData[0]);

            expect(list.getData()).toEqual([]);
        });

        it("should not contain item that is not in data", function () {
            list.setData(testData);
            expect(list.contains({name: "test3"})).toBeFalsy();
        });

        it("should contain items from data", function () {
            list.setData(testData);
            expect(list.contains({name: "test2"})).toBeTruthy();
        });

        it("should set data safely, without reference to the source", function () {
            list.setData(testData);
            testData.splice(0, 1);

            expect(list.getData().length).toEqual(2);
        });

        it("should get data safely, without reference to the source", function () {
            list.setData(testData);
            list.getData().splice(0, 1);
            expect(list.getData().length).toEqual(2);
        });

        describe("selection", function () {
            beforeEach(function () {
               list.setData(testData);
            });

            it("should have empty selection at the start", function () {
                expect(list.getSelection()).toEqual([]);
            });

            it("should add item to selection", function () {
                list.select(testData[1]);
                expect(list.getSelection()).toEqual([testData[1]]);
            });

            it("should not add item twice to select twice called", function () {
                list.select(testData[1]);
                list.select(testData[1]);
                expect(list.getSelection()).toEqual([testData[1]]);
            });

            it("should not add item twice to select twice called using comparator", function () {
                list.select(testData[1]);
                list.select({name: "test2"});
                expect(list.getSelection()).toEqual([testData[1]]);
            });

            it("should allow to find out if item is selected", function () {
                list.select(testData[1]);
                expect(list.isSelected(testData[1])).toBeTruthy();
            });

            it("should allow to find out if item is selected comparing items with comparator", function () {
                list.select(testData[0]);
                expect(list.isSelected({name: "test"})).toBeTruthy();
            });

            it("should not show not selected items as selected", function () {
                expect(list.isSelected(testData[1])).toBeFalsy();
            });

            it("should remove item from selection", function () {
                list.select(testData[1]);
                list.deselect(testData[1]);
                expect(list.getSelection()).toEqual([]);
            });

            it("should ignore deselection of not selected items", function () {
                list.deselect(testData[1]);
                expect(list.getSelection()).toEqual([]);
            });

            it("should clear selection", function () {
                list.select(testData[0]);
                list.select(testData[1]);
                list.clearSelection();
                expect(list.getSelection()).toEqual([]);
            });

            it("should select items with toggle", function () {
                list.toggle(testData[0]);
                expect(list.getSelection()).toEqual([testData[0]]);
            });

            it("should deselect items with toggle", function () {
                list.toggle(testData[0]);
                list.toggle(testData[0]);
                expect(list.getSelection()).toEqual([]);
            });

            it("should not select items that data does not contain", function () {
                list.select({name: "test3"});

                expect(list.getSelection()).toEqual([]);
            });
        });
    });
});