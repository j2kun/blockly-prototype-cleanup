const { combinations, } = require('../combinations');
const { Set, } = require('immutable');


describe("combinations", function() {
  it("returns empty set on bad input", function() {
    expect(combinations([1,2,3], 0)).toEqual([]);
    expect(combinations([1,2,3], -1)).toEqual([]);
    expect(combinations([1,2,3], 4)).toEqual([]);
  });

  it("returns the input set when k is the size of the input", function() {
    expect(combinations([1,2,3], 3)).toEqual([[1,2,3]]);
  });

  it("returns singletons when k=1", function() {
    expect(combinations([1,2,3], 1)).toEqual([[1], [2], [3]]);
  });

  it("returns pairs when k=2", function() {
    expect(combinations([1,2,3], 2)).toEqual([[1,2], [1,3], [2,3]]);
  });

  it("returns triplets when k=3", function() {
    expect(combinations([1,2,3,4], 3)).toEqual(
      [[1,2,3], [1,2,4], [1,3,4], [2,3,4]]);
  });

  it("handles immutablejs set correctly", function() {
    expect(combinations(Set([1,2,3,4]), 3)).toEqual(
      [[1,2,3], [1,2,4], [1,3,4], [2,3,4]]);
  });
});
