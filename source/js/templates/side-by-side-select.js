(function () {
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
                '            <div ng-show="{{sourceTitle}}" class="side-by-side-select-control__panel-heading">{{sourceTitle}}</div>' +
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
                '                ng-click="sideBySideSelectController.addToTarget(sideBySideSelectController.getSourceSelection())">' +
                '        </button>' +
                '        <button class="side-by-side-select-control__move-button side-by-side-select-control__move-button--remove-from-target"' +
                '                ng-click="sideBySideSelectController.removeFromTarget(sideBySideSelectController.getTargetSelection())">' +
                '        </button>' +
                '    </div>' +

                '    <div class="side-by-side-select-control__side side-by-side-select-control__side--target">' +
                '        <div class="panel panel-success side-by-side-select-control__panel side-by-side-select-control__panel--target">' +
                '            <div ng-show="{{targetTitle}}" class="side-by-side-select-control__panel-heading">{{targetTitle}}</div>' +
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







