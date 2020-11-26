// Courtesy of orip https://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator
// This code is slightly modified and to be used for testing purposes only -- may not be secure

function pseudoRandomGenerator(seedK, keyLength){

    let seedKey = seedK;

    function RNG(seed) {
        // LCG using GCC's constants
        this.m = seedKey;//0x800000; // keySeed // 2**31;
        this.a = 1103315245;
        this.c = 12446;

        this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }
    RNG.prototype.nextInt = function() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }
    RNG.prototype.nextFloat = function() {
        // returns in range [0,1]
        return this.nextInt() / (this.m - 1);
    }
    RNG.prototype.nextRange = function(start, end) {
        // returns in range [start, end): including start, excluding end
        // can't modulu nextInt because of weak randomness in lower bits
        let rangeSize = end - start;
        let randomUnder1 = this.nextInt() / this.m;
        return start + Math.floor(randomUnder1 * rangeSize);
    }
    RNG.prototype.choice = function(array) {
        return array[this.nextRange(0, array.length)];
    }

    let rng = new RNG(22);
    // for (let i = 0; i < 10; i++)
    //     console.log(rng.nextRange(10, 50));

    let digits = new Array(256);
    for(let i = 0; i < digits.length; i++){
        digits[i]=i;
    }

    let array = new Uint8Array(keyLength);

    for (let i = 0; i < keyLength; i++)
        array[i]=rng.choice(digits);

return array;

}

