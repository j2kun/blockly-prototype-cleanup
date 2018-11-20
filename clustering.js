class AgglomerativeClustering {
  /**
   * Class for an agglomerative clustering.
   *
   * @param distanceBetweenClusters a function which, when given two
   * collections of any size, determines the distance between the clusters
   * represented by those collections.
   *
   * @constructor
   */
  constructor(distanceBetweenClusters) {
    this.distanceBetweenClusters = distanceBetweenClusters;
    this.cachedDistances = new DistanceCache();
  }

  distance(cluster1, cluster2) {
    return this.cachedDistances.getOrCompute(
      cluster1, cluster2, this.distanceBetweenClusters);
  }

  /**
   * Compute the dendrogram for a given set of points.
   *
   * @param points a set of objects (compatible with
   * this.distanceBetweenClusters) to cluster
   *
   * @return An instance of Dendrogram representing a family of clusterings
   */
  dendrogram(points) {
    let levelSet = new Set(points.map(
      p => new DendrogramNode(new Set([p]))));

    let agglomerativeTraversal = new AgglomerativeOrderTraversal(levelSet);

    while (levelSet.size > 1) {
      minPair =
    }
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
    this.values = values;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    this.parent = null;
  }

  setParent(parent) {
    this.parent = parent;
  }

  isLeaf() {
    return this.leftChild == null and this.rightChild == null;
  }

  /*
   * Merge two dendrogram nodes.
   *
   * The node with the smaller value set will be the left child.
   */
  merge(otherNode) {
    let mergedValues = this.values.concat(otherNode.values);
    let parent = (this.values.length > otherNode.values.length
        ? new DendrogramNode(mergedValues, otherNode, this)
        : new DendrogramNode(mergedValues, this, otherNode));

    this.setParent(parent);
    otherNode.setParent(parent);
    return parent;
  }
}


/**
 * A simple cache whose keys are pairs of values.
 */
class DistanceCache {
  constructor() {
    this.distances = Map();
  }

  key(a, b) {
    return Set([a, b]);
  }

  contains(a, b) {
    return distances.has(key(a, b));
  }

  get(a, b) {
    return distances.get(key(a, b));
  }

  getOrCompute(a, b, fn) {
    let value = get(a, b);
    if (!value) {
      value = fn(a, b);
      distances = distances.set(key(a, b), value);
    }
    return value;
  }

  put(a, b, value) {
    distances = distances.set(key(a, b), value);

    if (contains(a, b)) {
      distances = distances.delete(key(a, b));
    }
  }
}
