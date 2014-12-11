var scramble = angular.module('scramble', ['ngAnimate']);

// https://gist.github.com/c0bra/5859295
scramble.directive('ngVisible', ['$animate', function($animate) {
    return function ($scope, $element, $attr) {
        $scope.$watch($attr.ngVisible, function(visible) {
            if(visible) {
                $animate.removeClass($element, 'ng-invisible');
                // $element.removeClass('ng-invisible');
                // $animate.enter($element);
            } else {
                $animate.addClass($element, 'ng-invisible');
                // $element.addClass('ng-invisible');
                // $animate.leave($element);
            }
        });
    };
}]);

scramble.factory('Dictionary', ['$http',
function($http) {
    return {
        getWord: function() {
            return $http.get('/word');
        }
    };
}]);

scramble.controller('ScrambleController', ['$rootScope', '$scope', '$document', '$timeout', 'Dictionary',
function ScrambleController($rootScope, $scope, $document, $timeout, Dictionary) {
    $scope.word = null;
    $scope.ready = false;
    $scope.isCorrect = false;

    function getNextWord() {
        return Dictionary.getWord().success(function(response) {
            $scope.word = response.word;
            $scope.ready = true;
            $scope.isCorrect = false;
        });
    }

    $scope.onComplete = function() {
        $scope.isCorrect = true;
        $scope.ready = false;
        $timeout(function() {
            getNextWord().then(function() {
                $scope.isCorrect = false;
                $scope.ready = true;
            });
        }, 1200);
    };

    $scope.onReady = function() {
        $scope.ready = true;
    };

    $scope.onError = function() {
        $scope.ready = false;
    };

    $document.bind('keydown', function($ev) {
        $scope.$apply(function() {
            if($ev.ctrlKey || $ev.altKey) {
                return;
            }

            $ev.preventDefault();
            if(!$scope.ready) {
                return; // don't handle keystrokes until we reset
            }

            if($ev.which == 8) { // backspace
                $rootScope.$emit('board.eraseLetter');
            } else {
                var c = String.fromCharCode($ev.which).toUpperCase();
                $rootScope.$emit('board.guessLetter', c);
            }
        });
    });

    getNextWord();
}]);

scramble.directive('tile', function() {
    return {
        restrict: 'E',
        template: '<div class="tile" ng-class="{placed: placed, unplaced: !placed}" ng-click="onClick($ev)">' +
                      '<span class="face">{{ letter }}</span></div>',
        require: '^board',
        scope: {
            letter: '=',
            placed: '='
        },
        link: function($scope, $element, $attrs, $board) {
            function onClick($ev) {
                $board.handleTileClick($scope, $element);
            }

            $scope.onClick = onClick;
        }
    };
});

scramble.directive('board', ["$timeout", function($timeout) {
    return {
        restrict: 'E',
        template: '<section class="board" ng-class="{error: hasError}">' +
                    '<tile letter="tile.letter" placed="tile.placed" ng-repeat="tile in attempts track by $index"></tile>' +
                    '<tile letter="tile.letter" placed="tile.placed" ng-repeat="tile in tiles | filter:isUnplaced track by $index"></tile>' +
                  '</section>',
        scope: {
            word: '=',
            onComplete: '&',
            onError: '&',
            onReady: '&'
        },
        link: function($scope) {
            var _word;

            $scope.attempts = [];
            $scope.isCorrect = false;
            $scope.hasError = false;

            $scope.$watch('word', function(w, old) {
                if(w) {
                    _word = $scope.word.toUpperCase();
                    reset(true);
                }
            });

            function makeTile(c) {
                return {
                    letter: c,
                    placed: false
                };
            }

            function getTileLetter(t) {
                return t.letter;
            }

            function isUnplaced(t) {
                return !t.placed;
            }

            function guessLetter(c) {
                var unplaced = $scope.tiles.filter(isUnplaced);
                var letters = unplaced.map(getTileLetter);

                if(letters.contains(c)) {
                    var index = letters.indexOf(c);
                    var t = unplaced[index];

                    if(!t.placed) {
                        t.placed = true;
                        $scope.attempts.push(t);
                    }
                }
            }

            function eraseLetter() {
                if($scope.attempts.length > 0) {
                    var t = $scope.attempts.pop();
                    var index = $scope.tiles.indexOf(t);
                    $scope.tiles[index].placed = false;
                }
            }

            function reset(shuffle) {
                if(shuffle) {
                    var letters = _word.split('');
                    letters = letters.shuffle();
                    $scope.tiles = letters.map(makeTile);
                } else {
                    $scope.tiles.map(function(t) {
                        t.placed = false;
                    });
                }

                $scope.attempts = [];
                $scope.onReady();
            }

            function validateAttempt() {
                if(_word == $scope.attempts.map(getTileLetter).join('')) {
                    $scope.onComplete();
                } else {
                    if(_word.length == $scope.attempts.length) {
                        $scope.hasError = true;
                        $timeout(function() {
                            $scope.hasError = false;
                            $scope.onError();
                            reset();
                        }, 800);
                    }
                }
            }

            var unbind = [
                $scope.$root.$on('board.guessLetter', function($ev, c) {
                    guessLetter(c);
                    validateAttempt();
                }),
                $scope.$root.$on('board.eraseLetter', function($ev) {
                    eraseLetter();
                    validateAttempt();
                })
            ];

            $scope.$on('$destroy', function() {
                unbind.map(function(u) {
                    u();
                });
            });

            $scope.isUnplaced = isUnplaced;
            $scope.validateAttempt = validateAttempt;
        },
        controller: ['$scope', function($scope) {
            function getIndexByElementClassName(target, className) {
                var board = target.parent();
                var tiles = board.children();

                var j = 0;
                for(var i = 0; i < tiles.length; i++) {
                    var el = angular.element(tiles[i]);

                    if(el.find('div').hasClass(className)) {
                        if(el[0] == target[0]) {
                            return j;
                        }
                        j++;
                    }
                }

                return -1;
            }

            function getUnplacedIndexByElement(target) {
                return getIndexByElementClassName(target, 'unplaced');
            }

            function getPlacedIndexByElement(target) {
                return getIndexByElementClassName(target, 'placed');
            }

            function guessTileByClick(tileIndex) {
                var unplaced = $scope.tiles.filter($scope.isUnplaced);
                var t = unplaced[tileIndex];

                if(!t.placed) {
                    t.placed = true;
                    $scope.attempts.push(t);
                }

                $scope.validateAttempt();
            }

            function eraseTileByClick(tileIndex) {
                var t = $scope.attempts.splice(tileIndex, 1)[0];
                var index = $scope.tiles.indexOf(t);
                $scope.tiles[index].placed = false;
            }

            // this logic is highly coupled
            this.handleTileClick = function(tileScope, element) {
                var tileEl = element.find('div');

                if(tileEl.hasClass('unplaced')) {
                    var index = getUnplacedIndexByElement(element);

                    if(index >= 0) {
                        guessTileByClick(index);
                    }
                } else if(tileEl.hasClass('placed')) {
                    var index = getPlacedIndexByElement(element);

                    if(index >= 0) {
                        eraseTileByClick(index);
                    }
                } else {
                    console.log("how did this happen!? :wq");
                }
            };
        }]
    };
}]);
