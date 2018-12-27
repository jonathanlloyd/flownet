class PRNG {
	constructor(seed) {
		this.seed = seed;
		this._current = seed;
	}

	random() {
		this._current++;
		const x = Math.sin(this._current) * 10000;
		return x - Math.floor(x);
	}

	randInt(low, up) {
		const range = up - low;
		const inRange = Math.floor(this.random() * range + 1)
		return inRange + low;
	}

	choices(array, num=1) {
		const seen = new Set();
		const choices = [];

		for(let i = 0; i < num; i++) {
			let choice;
			while (true) {
				const choiceIndex = this.randInt(0, array.length - 1);
				choice = array[choiceIndex];
				if (!seen.has(choice)) {
					seen.add(choice);
					break;
				}
			}
			choices.push(choice);
		}

		return choices;
	}
}


class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	addVector(otherVector) {
		return new Vector(this.x + otherVector.x, this.y + otherVector.y);
	}

	subVector(otherVector) {
		return new Vector(this.x - otherVector.x, this.y - otherVector.y);
	}

	multScalar(scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	distance(otherVector) {
		return Math.sqrt(
			Math.pow(this.x - otherVector.x, 2) +
			Math.pow(this.y - otherVector.y, 2)
		)
	}
}

const makeVector = (x, y) => new Vector(x, y);
const makeRandomVector = prng => makeVector(prng.random(), prng.random());


const copy = o => JSON.parse(JSON.stringify(o));


module.exports = { PRNG, makeVector, makeRandomVector, copy };
