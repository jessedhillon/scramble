var scramble = angular.module('scramble', []);

scramble.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

function ScrambleController($scope, $document) {
    function tileLetter(t) {
        return t.letter;
    }

    function isUnplaced(t) {
        return !t.placed;
    }

    function guessLetter(c) {
        var unplaced = $scope.tiles.filter(isUnplaced);
        var letters = unplaced.map(tileLetter);

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
        return $scope.word == $scope.attempts.map(tileLetter).join('');
    }

    $document.bind('keydown', function($ev) {
        $scope.$apply(function() {
            if($ev.ctrlKey || $ev.altKey) {
                return;
            }

            if($ev.which == 8) { // backspace
                $ev.preventDefault();
                eraseLetter();
            } else {
                var c = String.fromCharCode($ev.which).toUpperCase();
                guessLetter(c);
            }

            $scope.isCorrect = validateAttempt();
        });
    });

    $scope.word = "foobar".toUpperCase();
    $scope.attempts = [];
    $scope.isCorrect = false;

    var letters = $scope.word.slice(0).split('').shuffle();

    $scope.tiles = letters.map(function(c) {
        return {
            letter: c,
            placed: false
        };
    });

    $scope.isUnplaced = isUnplaced;
}

scramble.controller("ScrambleController", ["$scope", "$document", ScrambleController]);
