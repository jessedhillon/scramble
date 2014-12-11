if(typeof Array.prototype.shuffle == "undefined") {
    Array.prototype.shuffle = function() {
        var counter = this.length;

        while (counter > 0) {
            var temp;
            var index;

            index = Math.floor(Math.random() * counter);
            counter--;

            temp = this[counter];
            this[counter] = this[index];
            this[index] = temp;
        }

        return this;
    };
}

Array.prototype.contains = function(i, f) {
    return this.indexOf(i, f) > -1;
};
