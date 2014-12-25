describe("Side by side directive", function () {
    "use strict";

    var $compile,
        $scope,
        $timeout;

    angular.module("customModule", [])
        .directive("customDirective", function () {
           return {
               scope : {
                   item : "="
               },
               template: "<div><span class='custom'></span>{{item.name}}</div>"
           };
        });

    beforeEach(module('angularSideBySideSelect'));
    beforeEach(module('customModule'));
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_){
        $compile = _$compile_;
        $scope = _$rootScope_.$new();
        $timeout = _$timeout_;
    }));

    beforeEach(function() {
        $scope.items = [
            {name: 1},
            {name: 2},
            {name: 3},
            {name: 4}
        ];

        $scope.getList = function () {
            return $scope.items;
        };
    });

    it('should be renderable', function() {
        $compile("<side-by-side-select items='items' ng-model='result'></side-by-side-select>")($scope);
        $scope.$digest();
    });

    it('should be renderable with titles', function() {
        $scope.title1 = "\"Source title\"";

        var element = $compile("<side-by-side-select " +
        "source-title=\"Source title\" " +
        "target-title=\"Target title\" " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        expect(element[0].querySelector('.side-by-side-select-control__panel--source .side-by-side-select-control__panel-heading').innerHTML).toEqual("Source title");
        expect(element[0].querySelector('.side-by-side-select-control__panel--target .side-by-side-select-control__panel-heading').innerHTML).toEqual("Target title");
    });

    it('should be able to use directives from another modules', function() {
        var element = $compile("<side-by-side-select " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
            "source-item-directive=\"custom-directive\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(4);
    });
});