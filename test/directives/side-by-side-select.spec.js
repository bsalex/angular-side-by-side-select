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
        }).directive("customDirective2", function () {
            return {
                scope : {
                    item : "="
                },
                template: "<div><span class='custom2'></span>{{item.name}}</div>"
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
            "source-item-directive=\"'custom-directive'\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(4);
    });

    it('should be able to resolve item template from variable and change it dynamically', function() {
        $scope.template = "custom-directive";

        var element = $compile("<side-by-side-select " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
        "source-item-directive=\"template\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        $scope.$apply(function () {
            $scope.template = "custom-directive2";
        });

        expect(element[0].querySelectorAll(".custom2").length).toEqual(4);
    });

    it('should be able to reinitialize component if it is under ng-if', function () {
        $scope.template = "custom-directive";
        $scope.flag = true;

        var element = $compile("<div>" +
        "  <div ng-if=\"flag\">" +
        "    <side-by-side-select " +
        "    ng-model=\"result\" " +
        "    items=\"items\" " +
        "    source-item-directive=\"template\"" +
        "    >" +
        "    </side-by-side-select>" +
        "  </div>" +
        "</div>")($scope);

        $scope.$digest();
        $scope.flag = false;
        $scope.$digest();
        $scope.flag = true;
        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(4);
    });
    

    it('should output init model values in target list', function() {
        $scope.result = [
            {name: 1, field: 2},
            {name: 2, field: 1}
        ];

        var element = $compile("<side-by-side-select " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
        "target-item-directive=\"'custom-directive'\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(2);
    });

    it('should watch model values in target list', function() {
        $scope.result = [];

        var element = $compile("<side-by-side-select " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
        "target-item-directive=\"'custom-directive'\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        $scope.result = [
            {name: 1, field: 2},
            {name: 2, field: 1}
        ];

        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(2);
    });

    it('should watch model values in target list if they are inserted', function() {
        $scope.result = [];

        var element = $compile("<side-by-side-select " +
        "ng-model=\"result\" " +
        "items=\"items\" " +
        "target-item-directive=\"'custom-directive'\"" +
        ">" +
        "</side-by-side-select>")($scope);

        $scope.$digest();

        [].push.apply($scope.result, [
            {name: 1, field: 2},
            {name: 2, field: 1}
        ]);

        $scope.$digest();

        expect(element[0].querySelectorAll(".custom").length).toEqual(2);
    });
});