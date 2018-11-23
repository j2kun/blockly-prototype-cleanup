const { Set } = require('immutable');

describe("DendrogramNode", function() {
  const { DendrogramNode } = require('../dendrogram');
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

    it("should properly merge values", function() {
      expect(mergedNode.values).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    });

    it("should set the children on the merged node", function() {
      expect(mergedNode.isLeaf()).toBeFalsy();
      expect(mergedNode.leftChild).toEqual(node);
      expect(mergedNode.rightChild).toEqual(otherNode);
    });
  });
});
