const {
  List,
  Map,
  Set,
} = require('immutable');
const {
  AgglomerativeHierarchy,
  DendrogramNode,
  DendrogramTraversal,
} = require('../dendrogram');
const {
  DistanceCache,
} = require('../cache');


describe("DendrogramNode", function() {
  var node;

  beforeEach(function() {
    node = new DendrogramNode(Set([1, 2, 3]));
  });

  it("should start as a leaf", function() {
    expect(node.isLeaf()).toBeTruthy();
  });

  describe("when merging", function() {
    let node = new DendrogramNode(Set([1, 2, 3]));
    let otherNode = new DendrogramNode(Set([4,5,6]));
    let mergedNode = node.merge(otherNode);

    it("should merge value sets", function() {
      expect(mergedNode.values).toEqual(Set([1, 2, 3, 4, 5, 6]));
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


describe("AgglomerativeHierarchy", function() {
  let points = [1,2,3,4];
  let hardCodedDistanceMap = new DistanceCache()
    .put(Set([2]), Set([3]), 1)
    .put(Set([2,3]), Set([4]), 1)
    .put(Set([2,3,4]), Set([1]), 1);

  let distanceFn = function (node1, node2) {
    return hardCodedDistanceMap.getOrCompute(
      node1.values, node2.values, (a, b) => 100);
  };

  let clusterer = new AgglomerativeHierarchy(distanceFn);
  let dendrogram = clusterer.dendrogram(points);

  it("should have all values in the root", function() {
    expect(dendrogram.root.values).toEqualImmutable(Set([1, 2, 3, 4]));
  });

  let expectedLevelSets = List([
    Set([Set([1]), Set([2]), Set([3]), Set([4])]),
    Set([Set([2, 3]), Set([1]), Set([4])]),
    Set([Set([2, 3, 4]), Set([1])]),
    Set([Set([1, 2, 3, 4])]),
  ]);

  it("should traverse level sets in merge order", function() {
    let actualLevelSets = List();

    for (let levelSet of dendrogram.levelSets()) {
      actualLevelSets = actualLevelSets.push(
        levelSet.map(x => x.values));
    }

    expect(actualLevelSets).toEqualImmutable(expectedLevelSets);
  });

  it("should choose maximal level sets appropriately", function() {
    let hardCodedLevelSetFnMap = Map()
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
