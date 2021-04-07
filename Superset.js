export /**
 * @class
 */
class Superset extends Set {
    constructor(entries) {
        super(entries);
    }
    /**
     * Creates an ordered array of the values of this set and caches the array internally until the set is changed
     * in some way. If you don't want caching behavior, use `[...set.values()]` or `Array.from(set.values())`.
     */
    array() {
        if (this._array === null || this._array.length !== this.size) this._array = [...this.values()];
        return this._array;
    }

    /**
     * Obtains the first value(s) in this set.
     * @param {Number} [amount=1]
     */
    first(amount = 1) {
        const iter = this.values();
        if (amount < 0) return this.last(-amount);
        if (amount === 1) return iter.next().value;
        return Array.from({ length: amount }, () => iter.next().value);
    }
    /**
     * Obtains the last value(s) in this set.
     * Uses {@link Superset#array} internally.
     * @param {Number} [amount=1]
     */
    last(amount = 1) {
        const array = this.array();
        if (amount < 0) return this.first(-amount);
        if (amount === 1) return array[array.length - 1];
        return array.slice(-amount);
    }

    /**
     * Obtains unique random value(s) from this map.
     * Uses {@link Superset#array} internally.
     * @param {Number} [amount=1]
     */
    random(amount = 1) {
        const array = this.array();
        if (array.length === 0) return typeof amount !== 'undefined' ? [] : undefined;
        if (typeof amount === 'undefined') return randomOfArray(array);
        if (amount < 0) return [];
        return Array.from({ length: amount }, () => randomOfArray(array));
    }
    /**
     * @callback loopCallback
     * @param {any} value
     * @param {this} set
     * @returns {any|undefined}
     */
    /**
     * Searches for a single element where the given function returns a truthy value.
     *
     * @param {loopCallback} fn
     * @returns {any|undefined}
     */
    find(fn) {
        for (const val of this) if (fn(val, this)) return val;
        return undefined;
    }

    /**
     * Removes elements that satisfy the provided filter function.
     *
     * @param {loopCallback} fn
     * @returns {Number} The number of removed entries
     */
    sweep(fn) {
        const sizeBefore = this.size;
        for (const val of this) if (fn(val, this)) this.delete(val);
        return sizeBefore - this.size;
    }

    /**
     * Returns elements that satisfy the provided filter function.
     */
    filter(fn) {
        const results = new Superset();
        for (const val of this) if (fn(val, this)) results.add(val);
        return results;
    }

    /**
     * Partitions the set into two sets where the first set contains the elements that
     * passed and the second contains the elements that failed.
     * @param {loopCallback} fn
     */
    partition(fn) {
        const part1 = new Superset();
        const part2 = new Superset();
        for (const val of this) {
            if (fn(val, this)) part1.add(val);
            else part2.add(val);
        }
        return [part1, part2];
    }

    /**
     * Maps each element to another value into a set.
     * @param {loopCallback} fn
     */
    map(fn) {
        const set = new Superset();
        for (const val of this) set.add(fn(val, this));
        return set;
    }

    /**
     * Checks if there exists an element that passes a test.
     * @param {loopCallback} fn
     */
    some(fn) {
        for (const val of this) if (fn(val, this)) return true;
        return false;
    }

    /**
     * Checks if all elements pass a test.
     * @param {loopCallback} fn
     */
    every(fn) {
        for (const val of this) if (!fn(val, this)) return false;
        return true;
    }
    /**
     * @callback accumCallback
     * @param {any} accumulator
     * @param {any} value
     * @param {Superset} set
     * @returns {any}
     */
    /**
     * Continuously applies a function to produce a single value.
     * @param {accumCallback} fn
     */
    reduce(fn, initial) {
        let result = initial;
        for (const val of this) result = fn(result, val, this);
        return result;
    }

    /**
     * Runs a function on each element of the set and returns the set.
     * @param {loopCallback} fn
     */
    each(fn) {
        super.forEach((v) => fn(v, this));
        return this;
    }
    /**
     * @callback tapCallback
     * @param {Superset} set
     */
    /**
     * Runs a function on the set and returns the set.
     * @param {tapCallback} fn
     * @returns {Superset}
     */
    tap() {
        fn(this);
        return this;
    }
    /**
     * @callback sortCallback
     * @param {any} firstValue
     * @param {any} secondValue
     * @returns
     */
    /**
     * Sorts the elements of the set in place and returns it.
     * @type {sortCallback} fn
     * @returns {Superset}
     */
    sort(fn) {
        const entries = [...this.entries()];
        const sorted = entries.sort((a, b) => fn(a[0], b[0]));
        this.clear();
        for (const [v] of sorted) this.add(v);
        return this;
    }

    /**
     * Returns a new `Superset` containing elements where the keys are present in both original sets.
     * @param {Superset} other
     * @returns {Superset}
     */
    intersect(other) {
        return other.filter((v) => this.has(v));
    }

    /**
     * Creates an identical shallow copy of this sets.
     * @returns {Superset}
     */
    clone() {
        return new this.constructor[Symbol.species](this);
    }

    /**
     * Combines this set with others into a new `Superset`. None of the source set are modified.
     * @param {Superset[]} sets
     */
    concat(...sets) {
        const newMap = this.clone();
        for (const set of sets) for (const val of set) newMap.add(val);
        return newMap;
    }

    /**
     * Checks if this set shares identical elements with another.
     * @param {Superset} set
     * @returns {Boolean}
     */
    equals(set) {
        if (this === set) return true;
        if (this.size !== set.size) return false;
        for (const value of this) {
            if (!set.has(value)) {
                return false;
            }
        }
        return true;
    }
}
