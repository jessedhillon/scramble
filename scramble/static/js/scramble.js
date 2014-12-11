var scramble = angular.module('scramble', []);

// https://gist.github.com/c0bra/5859295
scramble.directive('ngVisible', function() {
    return function (scope, element, attr) {
        scope.$watch(attr.ngVisible, function(visible) {
            if(visible) {
                element.removeClass('ng-invisible');
            } else {
                element.addClass('ng-invisible');
            }
        });
    };
});

function DictionaryFactory($http) {
    return {
        getWord: function() {
            return $http.get('/word');
        }
    };
}

function ScrambleController($rootScope, $scope, $document, $timeout, Dictionary) {
    $scope.word = null;
    $scope.isCorrect = false;

    function getNextWord() {
        return Dictionary.getWord().success(function(response) {
            $scope.word = response.word;
        });
    }

    $scope.onComplete = function() {
        $scope.isCorrect = true;
        $timeout(function() {
            getNextWord().then(function() {
                $scope.isCorrect = false;
            });
        }, 1200);
    };

    $document.bind('keydown', function($ev) {
        $scope.$apply(function() {
            if($ev.ctrlKey || $ev.altKey) {
                return;
            }

            $ev.preventDefault();
            if($scope.isCorrect) {
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
}

scramble.controller('ScrambleController', ['$rootScope', '$scope', '$document', '$timeout', 'Dictionary',
                    ScrambleController]);
scramble.factory('Dictionary', ['$http', DictionaryFactory]);

scramble.directive('tile', function() {
    return {
        restrict: 'E',
        template: '<div class="tile" ng-class="{placed: placed, unplaced: !placed}">' +
                      '<span class="face">{{ letter }}</span></div>',
        scope: {
            letter: '=',
            placed: '='
        }
    };
});

scramble.directive('board', function() {
    return {
        restrict: 'E',
        template: '<section class="board">' +
                    '<tile letter="tile.letter" placed="tile.placed" ng-repeat="tile in attempts track by $index"></tile>' +
                    '<tile letter="tile.letter" placed="tile.placed" ng-repeat="tile in tiles | filter:isUnplaced track by $index"></tile>' +
                  '</section>',
        scope: {
            word: '=',
            onComplete: '&',
        },
        link: function($scope) {
            var _word;

            $scope.attempts = [];
            $scope.isCorrect = false;

            $scope.$watch('word', function(w, old) {
                if(w) {
                    _word = $scope.word.toUpperCase();
                    $scope.tiles = _word.split('').shuffle().map(makeTile);
                    $scope.attempts = [];
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

            function validateAttempt() {
                if(_word == $scope.attempts.map(getTileLetter).join('')) {
                    $scope.onComplete();
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
        }
    };
});
