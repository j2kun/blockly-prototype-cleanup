const { Map, Set } = require('immutable');

/**
 * A simple cache whose keys are unordered pairs of values.
 */
class DistanceCache {
  constructor() {
    this.distances = Map();
  }

  key(a, b) {
    return Set([a, b]);
  }

  contains(a, b) {
    return this.distances.has(this.key(a, b));
  }

  get(a, b) {
    return this.distances.get(this.key(a, b));
  }

  getOrCompute(a, b, fn) {
    let value = this.get(a, b);
    if (!value) {
      value = fn(a, b);
      this.put(a, b, value);
    }
    return value;
  }

  put(a, b, value) {
    this.distances = this.distances.set(this.key(a, b), value);
  }
}

module.exports = {
  DistanceCache
};
