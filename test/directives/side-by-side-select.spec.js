describe("Side by side directive", function () {
    var $compile,
        $scope,
        $timeout;

    beforeEach(module('angularSideBySideSelect'));
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
        }
    });

    it('should be renderable', function() {
        $compile("<side-by-side-select items='items' ng-model='result'></side-by-side-select>")($scope);
        $scope.$digest();
    });

    it('should be renderable with titles', function() {
        $scope.title1 = "\"Source title\""

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
});