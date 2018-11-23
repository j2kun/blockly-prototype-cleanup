const { Set } = require('immutable');


class Dendrogram {
  /**
   * Class for a Dendrogram.
   *
   * A dendrogram is a pair of root DendrogramNode and a DendrogramTraversal
   * used to generate iterators that traverse levelsets of the tree in a
   * specific order.
   *
   * @constructor
   */
  constructor(root, traversal) {
    this.root = root;
    this.traversal = traversal;
  }
}


class DendrogramTraversal {
  constructor() {
    this.mutations = [];
  }

  addMutation(mutation) {
    this.mutations.append(mutation);
  }

  forEach(leafSet, levelSetFn) {

  }
}

class TraversalMutation {
  /**
   * A class to store a mutation of a level set via the removal and addition
   * of some nodes. For a typical dendrogram agglomeration, a mutation merges
   * two nodes, so nodesToRemove has size two, and nodesToAdd is the merged
   * node.
   */
  constructor(nodesToRemove, nodesToAdd) {
    this.nodesToRemove = nodesToRemove;
    this.nodesToAdd = nodesToAdd;
  }

  /**
   * Mutate a set of DendrogramNodes according to the data of this mutation.
   *
   * @param levelSet: a set of dendrogram nodes to mutate.
   */
  mutate(levelSet) {
    return levelSet.withMutations(
      nodeSet => {
        this.nodesToRemove.forEach(
          node => { nodeSet.remove(node); }
        );
        this.nodesToAdd.forEach(
          node => { nodeSet.add(node); }
        );
      });
  }
}


class DendrogramNode {
  /**
   * Class for a node in a Dendrogram. Every node in a dendrogram has zero or
   * two children.
   *
   * @param values: the set of values contained in this node.
   * @param leftChild: the left child of this node, or null if this node is a leaf
   * @param rightChild: the right child of this node, or null if this node is a leaf
   *
   * @constructor
   */
  constructor(values, leftChild, rightChild) {
    this.values = Set.of(...values);
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    this.parent = null;
  }

  setParent(parent) {
    this.parent = parent;
  }

  isLeaf() {
    return !this.leftChild && !this.rightChild;
  }

  /*
   * Merge two dendrogram nodes.
   *
   * The node with the smaller value set will be the left child.
   */
  merge(otherNode) {
    let mergedValues = this.values.union(otherNode.values);
    let parent = (this.values.length > otherNode.values.length
        ? new DendrogramNode(mergedValues, otherNode, this)
        : new DendrogramNode(mergedValues, this, otherNode));

    this.setParent(parent);
    otherNode.setParent(parent);
    return parent;
  }
}

module.exports = {
  Dendrogram,
  DendrogramNode,
  DendrogramTraversal,
};
