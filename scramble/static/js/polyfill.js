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

if(typeof Array.prototype.contains == "undefined") {
    var indexOf = Array.prototype.indexOf;
    Array.prototype.indexOf = function(i, f) {
        if(typeof f == "undefined") {
            return indexOf.apply(this, [i]);
        }

        for(var j = 0; j < this.length; j++) {
            if(f(this[j]) === i) {
                return j;
            }
        }

        return -1;
    };

    Array.prototype.contains = function(i, f) {
        return this.indexOf(i, f) > -1;
    };
}

var pop = Array.prototype.pop;
Array.prototype.pop = function(i) {
    if(typeof i == "undefined") {
        return pop.apply(this, []);
    }

    var r = this.splice(i, 1);
    if(r.length > 0) {
        return r[0];
    }
 
    // caller is responsible for ensuring i < this.length
    return undefined;
};
