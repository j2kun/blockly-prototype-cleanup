const {
  List,
  Map,
  Set,
} = require('immutable');
const {
  AgglomerativeClustering,
  DendrogramNode,
  DendrogramTraversal,
} = require('../dendrogram');
const {
  DistanceCache,
} = require('../cache');


describe("DendrogramNode", function() {
  var node;

  beforeEach(function() {
    node = new DendrogramNode(new Set([1, 2, 3]));
  });

  it("should start as a leaf", function() {
    expect(node.isLeaf()).toBeTruthy();
  });

  describe("when merging", function() {
    let node = new DendrogramNode(new Set([1, 2, 3]));
    let otherNode = new DendrogramNode(new Set([4,5,6]));
    let mergedNode = node.merge(otherNode);

    it("should merge value sets", function() {
      expect(mergedNode.values).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });

    it("should set the children on the merged node", function() {
      expect(mergedNode.leftChild).toEqual(node);
      expect(mergedNode.rightChild).toEqual(otherNode);
    });

    it("should not think the merged node is a leaf", function() {
      expect(mergedNode.isLeaf()).toBeFalsy();
    });
  });
});


describe("AgglomerativeClustering", function() {
  let points = [1,2,3,4];
  let hardCodedDistanceMap = new DistanceCache()
    .put(new Set([2]), new Set([3]), 1)
    .put(new Set([2,3]), new Set([4]), 1)
    .put(new Set([2,3,4]), new Set([1]), 1);

  let distanceFn = function (values1, values2) {
    return hardCodedDistanceMap.getOrCompute(
      values1, values2, (a, b) => 100);
  };

  let clusterer = new AgglomerativeClustering(distanceFn);
  let dendrogram = clusterer.dendrogram(points);

  it("should have all values in the root", function() {
    expect(dendrogram.root.values).toEqualImmutable(new Set([1, 2, 3, 4]));
  });

  let expectedLevelSets = new List([
    new Set([new Set([1]), new Set([2]), new Set([3]), new Set([4])]),
    new Set([new Set([2, 3]), new Set([1]), new Set([4])]),
    new Set([new Set([2, 3, 4]), new Set([1])]),
    new Set([new Set([1, 2, 3, 4])]),
  ]);

  it("should traverse level sets in merge order", function() {
    let actualLevelSets = new List();

    for (let levelSet of dendrogram.levelSets()) {
      actualLevelSets = actualLevelSets.push(
        levelSet.map(x => x.values));
    }

    expect(actualLevelSets).toEqualImmutable(expectedLevelSets);
  });

  it("should choose maximal level sets appropriately", function() {
    let hardCodedLevelSetFnMap = new Map()
      .set(expectedLevelSets.get(0), 1)
      .set(expectedLevelSets.get(1), 2)
      .set(expectedLevelSets.get(2), 3)
      .set(expectedLevelSets.get(3), 1);

    let levelSetFn = function (levelSet) {
      let key = levelSet.map(x => x.values)
      return hardCodedLevelSetFnMap.has(key)
        ? hardCodedLevelSetFnMap.get(key): -1;
    };

    expect(dendrogram.levelSetMaximizing(levelSetFn).map(x => x.values))
      .toEqualImmutable(expectedLevelSets.get(2));
  });
});
