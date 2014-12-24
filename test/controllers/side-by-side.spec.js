describe("Side by side controller", function () {
    "use strict";

    var $scope, $q, $controller, controller, List, UniqueList;

    beforeEach(module('angularSideBySideSelect'));
    beforeEach(function () {
        inject(function (_$controller_, _$rootScope_, _$q_, _List_, _UniqueList_) {
            $q = _$q_;
            $scope = _$rootScope_.$new();
            $controller = _$controller_;
            List = _List_;
            UniqueList = _UniqueList_;
        });
    });


    beforeEach(function () {
        controller = $controller("SideBySideSelectController", {
            $scope: $scope,
            List: List,
            UniqueList: UniqueList
        });
    });

    it("should be instantiable", function () {
        expect(controller).toBeDefined();
    });

    describe("initialization", function () {
        it("should throw error if neither onGetItems nor items set", function () {
            expect(controller.initialize).toThrowError();
        });

        it("should throw error if onGetItems is not set and items is not an array", function () {
            $scope.items = {};

            controller = $controller("SideBySideSelectController", {
                $scope: $scope,
                List: List,
                UniqueList: UniqueList
            });
            expect(controller.initialize).toThrowError();
        });
    });

    describe("data", function () {
        var testData,
            scopeListener;

        beforeEach(function () {
            testData = [{name: "test"}, {name: "test2"}];

            $scope.onGetItems = sinon.stub().returns(testData);
            $scope.onGetItemsIsSet = true;

            $scope.itemsComparator = function (args) {
                return args.a.name === args.b.name;
            };

            scopeListener = sinon.spy();
            $scope.$on("targetDataUpdated", scopeListener);

            controller = $controller("SideBySideSelectController", {
                $scope: $scope,
                List: List,
                UniqueList: UniqueList
            });

            controller.initialize();
        });

        it("should get source items using function provided in scope", function () {
            expect(controller.getSourceItems()).toEqual(testData);
        });

        it("should indicate that item is in source list", function () {
            expect(controller.isInSourceList(testData[0])).toBeTruthy();
        });

        it("should indicate that item is in source list with comparator", function () {
            expect(controller.isInSourceList({name: "test2"})).toBeTruthy();
        });

        it("should not indicate that item is in source list if it is not there", function () {
            expect(controller.isInSourceList({name: "test3"})).toBeFalsy();
        });

        it("should get new source items with provided search string on search string change", function () {
            var newData = [{name: "test3"}];
            $scope.onGetItems.withArgs({text: "new search string"}).returns(newData);

            controller.onSearchChange("new search string");

            expect(controller.getSourceItems()).toEqual(newData);
        });

        it("should set new source items on resolve if onGetItems returns a promise", function () {
            var newData = [{name: "test3"}],
                deferred = $q.defer();

            $scope.onGetItems.withArgs({text: "new search string"}).returns(deferred.promise);
            controller.onSearchChange("new search string");

            expect(controller.getSourceItems()).toEqual(testData);

            $scope.$apply(function () {
                deferred.resolve(newData);
            });

            expect(controller.getSourceItems()).toEqual(newData);
        });

        it("should clean source items on reject if onGetItems returns a promise", function () {
            var deferred = $q.defer();
            $scope.onGetItems.withArgs({text: "new search string"}).returns(deferred.promise);
            controller.onSearchChange("new search string");

            expect(controller.getSourceItems()).toEqual(testData);

            $scope.$apply(function () {
                deferred.reject();
            });

            expect(controller.getSourceItems()).toEqual([]);
        });

        it("should get source items using provided array if function is not set", function () {
            delete $scope.onGetItems;
            $scope.onGetItemsIsSet = false;
            $scope.items = testData;

            expect(controller.getSourceItems()).toEqual(testData);
        });

        it("should have empty target items at the start", function () {
            expect(controller.getTargetItems()).toEqual([]);
        });

        describe("adding", function () {
            it("should add items to target list", function () {
                controller.addToTarget([testData[1]]);

                expect(controller.getTargetItems()).toEqual([testData[1]]);
            });

            it("should trigger event on item added to target", function () {
                controller.addToTarget([testData[1]]);

                expect(scopeListener).toHaveBeenCalledOnce();
            });

            it("should add single item to target list", function () {
                controller.addToTarget(testData[1]);

                expect(controller.getTargetItems()).toEqual([testData[1]]);
            });

            it("should indicate that added item in target list", function () {
                controller.addToTarget(testData[1]);

                expect(controller.isInTargetList(testData[1])).toBeTruthy();
            });

            it("should indicate that added item in target list with comparator", function () {
                controller.addToTarget(testData[1]);

                expect(controller.isInTargetList({name: "test2"})).toBeTruthy();
            });

            it("should not indicate that item is in target list if it is not there", function () {
                expect(controller.isInTargetList({name: "test3"})).toBeFalsy();
            });

            it("should allow to add one item twice", function () {
                controller.addToTarget(testData[1]);
                controller.addToTarget(testData[1]);

                expect(controller.getTargetItems()).toEqual([testData[1], testData[1]]);
            });

            it("should not remove item from source item if it has been added to target items", function () {
                controller.addToTarget(testData[1]);

                expect(controller.getSourceItems()).toEqual(testData);
            });

            it("should contain item from target in source", function () {
                controller.addToTarget(testData[1]);

                expect(controller.isInSourceList(testData[1])).toBeTruthy();
            });

            it("should reset source selection on items has been added to target", function () {
                controller.toggleSourceSelection(testData[1]);

                expect(controller.getSourceSelection()).toEqual([testData[1]]);

                controller.addToTarget(testData[1]);

                expect(controller.getSourceSelection()).toEqual([]);
            });

            describe("with allowDuplicates false", function () {
                beforeEach(function () {
                    $scope.allowDuplicates = false;

                    controller = $controller("SideBySideSelectController", {
                        $scope: $scope,
                        List: List,
                        UniqueList: UniqueList
                    });

                    controller.initialize();
                });

                it("should not allow to add one item twice", function () {
                    controller.addToTarget(testData[1]);
                    controller.addToTarget(testData[1]);

                    expect(controller.getTargetItems()).toEqual([testData[1]]);
                });

                it("should remove item from source item if it has been added to target items", function () {
                    controller.addToTarget(testData[1]);

                    expect(controller.getSourceItems()).toEqual([testData[0]]);
                });

                it("should not contain item from target in source", function () {
                    controller.addToTarget(testData[1]);

                    expect(controller.isInSourceList(testData[1])).toBeFalsy();
                });
            });
        });

        describe("removing", function () {
            beforeEach(function () {
                controller.addToTarget(testData);
                scopeListener.reset();
            });

            it("should remove items from target list", function () {
                controller.removeFromTarget([testData[0]]);

                expect(controller.getTargetItems()).toEqual([testData[1]]);
            });

            it("should remove single item from target list", function () {
                controller.removeFromTarget(testData[0]);

                expect(controller.getTargetItems()).toEqual([testData[1]]);
            });

            it("should trigger event on item removed from target", function () {
                controller.removeFromTarget([testData[0]]);

                expect(scopeListener).toHaveBeenCalledOnce();
            });
        });

        describe("selection", function () {
            beforeEach(function () {
                controller.addToTarget(testData);
            });

            describe("source", function () {
                it("should toggle item selection", function () {
                    controller.toggleSourceSelection(testData[1]);
                    expect(controller.getSourceSelection()).toEqual([testData[1]]);
                    expect(controller.isSelectedInSource(testData[1])).toBeTruthy();

                    controller.toggleSourceSelection(testData[1]);
                    expect(controller.getSourceSelection()).toEqual([]);
                    expect(controller.isSelectedInSource(testData[1])).toBeFalsy();
                });

                it("should search item in selection with provided comparator", function () {
                    controller.toggleSourceSelection(testData[0]);
                    expect(controller.isSelectedInSource({name:"test"})).toBeTruthy();
                });
            });

            describe("target", function () {
                it("should toggle item selection", function () {
                    controller.toggleTargetSelection(testData[1]);
                    expect(controller.getTargetSelection()).toEqual([testData[1]]);
                    expect(controller.isSelectedInTarget(testData[1])).toBeTruthy();

                    controller.toggleTargetSelection(testData[1]);
                    expect(controller.getTargetSelection()).toEqual([]);
                    expect(controller.isSelectedInTarget(testData[1])).toBeFalsy();
                });

                it("should clean target selection on items removed from target", function () {
                    controller.toggleTargetSelection(testData[1]);

                    controller.removeFromTarget(testData[1]);

                    expect(controller.getTargetSelection()).toEqual([]);
                    expect(controller.isSelectedInTarget(testData[1])).toBeFalsy();
                });

                it("should clean target selection on target items set", function () {
                    controller.toggleTargetSelection(testData[1]);

                    controller.setTargetItems(testData[1]);

                    expect(controller.getTargetSelection()).toEqual([]);
                    expect(controller.isSelectedInTarget(testData[1])).toBeFalsy();
                });

                it("should search item in selection with provided comparator", function () {
                    controller.toggleTargetSelection(testData[0]);
                    expect(controller.isSelectedInTarget({name:"test"})).toBeTruthy();
                });
            });
        });
    });
});