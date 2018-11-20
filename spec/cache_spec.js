describe("DistanceCache", function() {
  const { DistanceCache } = require('../cache');
  var cache;

  beforeEach(function() {
    cache = new DistanceCache();
  });

  it("should have undefined values for missing keys", function() {
    expect(cache.contains(1, 2)).toBeFalsy();
    expect(cache.get(1, 2)).toEqual(undefined);
  });

  it("can add a value with simple keys", function() {
    cache.put(1, 2, 'a');
    expect(cache.get(1, 2)).toEqual('a');
  });

  it("can compute on default", function() {
    expect(cache.getOrCompute(1, 2, (a, b) => 'a')).toEqual('a');
    expect(cache.get(1, 2)).toEqual('a');
  });

  describe("when using immutable sets", function() {
    const { Set } = require('immutable');
    let k1 = Set([1,2,3]);
    let k2 = Set([3,4,5]);
    let k1Reordered = Set([3,2,1]);
    let k2Reordered = Set([4,5,3]);

    it("should accept and retrieve single set keys", function() {
      cache.put(k1, k2, 7);
      expect(cache.get(k1, k2)).toEqual(7);
      expect(cache.contains(k1, k2)).toBeTruthy();
    });

    it("should not care about key order", function() {
      cache.put(k1, k2, 7);
      expect(cache.get(k2, k1)).toEqual(7);
      expect(cache.contains(k2, k1)).toBeTruthy();
    });

    it("should not care about element order", function() {
      cache.put(k1, k2, 7);
      expect(cache.get(k1Reordered, k2Reordered)).toEqual(7);
      expect(cache.contains(k1Reordered, k2Reordered)).toBeTruthy();
    });
  });
});
