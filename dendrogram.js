const { Set } = require('immutable');
const { combinations } = require('./combinations');


/**
 * A port of python's min() supporting a key for comparisons
 */
function min(array, key) {
  let best = null;
  let bestValue = null;
  for (let elt of array) {
    let eltValue = key(elt);
    if (bestValue == null || eltValue < bestValue) {
      bestValue = eltValue;
      best = elt;
    }
  }
  return best;
}


/**
 * A port of python's max() supporting a key for comparisons
 */
function max(array, key) {
  let best = null;
  let bestValue = null;
  for (let elt of array) {
    let eltValue = key(elt);
    if (bestValue == null || eltValue > bestValue) {
      bestValue = eltValue;
      best = elt;
    }
  }
  return best;
}


class AgglomerativeClustering {
  constructor(distanceFn) {
    this.distanceFn = distanceFn;
  }

  /** Return a dendrogram of clusterings for the given set of points. */
  dendrogram(points) {
    if (!points || points.length == 0) {
      return null;
    }

    // nodes start as leaves, and are merged at each step according
    // to which pair is closest by the distance function.
    let nodes = new Set(points.map(x => new DendrogramNode([x])));

    // Keep track of the merges at each step to be able to iterate over
    // the level sets later to choose the number of clusters.
    let traversal = new DendrogramTraversal(nodes);

    while (nodes.size > 1) {
      // find the next pair to merge
      let minPair = min(
        combinations(nodes, 2),
        pair => this.distanceFn(pair[0].values, pair[1].values));

      let n1 = minPair[0], n2 = minPair[1];
      let mergeMutation = new LevelSetMutation([n1, n2], [n1.merge(n2)]);

      traversal.addMutation(mergeMutation);
      nodes = mergeMutation.mutate(nodes);
    }

    let root = nodes.values().next().value;
    return new Dendrogram(root, traversal);
  }
}


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

  levelSetMaximizing(levelSetFn) {
    return max([...this.levelSets()], levelSetFn);
  }

  *levelSets() {
    for (let val of this.traversal.iterator()) {
      yield val;
    }
  }
}


class DendrogramTraversal {
  constructor(leaves) {
    this.leaves = leaves;
    this.mutations = [];
  }

  addMutation(mutation) {
    this.mutations.push(mutation);
  }

  *iterator() {
    let current = this.leaves;
    yield current;
    for (let mutation of this.mutations) {
      current = mutation.mutate(current);
      yield current;
    }
  }
}

class LevelSetMutation {
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

  toString() {
    return "Node(" + this.values + ")";
  }
}

module.exports = {
  AgglomerativeClustering,
  Dendrogram,
  DendrogramNode,
};
