const { Set } = require('immutable');
const { combinations } = require('./combinations');
const { DistanceCache } = require('./cache');
const { AgglomerativeHierarchy } = require('./dendrogram');


function euclideanDistance(x, y) {
  // Euclidean distance
  return x.map((elt, i) => Math.pow(elt - y.get(i), 2)).reduce((a, b) => a+b, 0);
};


class WardClustering {
  constructor(pointDistanceFn) {
    if (pointDistanceFn == null) {
      pointDistanceFn = euclideanDistance;
    }

    this.pointDistanceFn = pointDistanceFn;
    this.distanceCache = new DistanceCache();
  }

  initializeCache(points) {
    let distanceCache = new DistanceCache();
    combinations(points, 2).forEach(pair => {
      distanceCache.put(
        Set([pair[0]]), Set([pair[1]]), euclideanDistance(pair[0], pair[1]));
    });
    this.distanceCache = distanceCache;
  }

  /**
   * Compute the distance between two clusters using the Lance-Williams
   * recursive method.
   */
  recursiveDistance(node1, node2) {
    if (node1.isLeaf() && node2.isLeaf()) {
      throw "Distance cache should have prepopulated all pairwise node "
        + "distances, but we tried to call recursiveDistance on leaves "
        + node1 + " and " + node2;
    }

    let c1 = node1.leftChild;
    let c2 = node1.rightChild;
    let c3 = node2;

    // if node1 is a leaf or the cache is missing its child values
    // then splitting the other node will work.
    if (c1 == null
      || c2 == null
      || !this.distanceCache.contains(c1.values, c3.values)) {
      c1 = node2.leftChild;
      c2 = node2.rightChild;
      c3 = node1;
    }

    let n1 = c1.values.size;
    let n2 = c2.values.size;
    let n3 = c3.values.size;
    let n = n1 + n2 + n3;
    let d12 = this.distanceCache.get(c1, c2);
    let d13 = this.distanceCache.get(c1, c3);
    let d23 = this.distanceCache.get(c2, c3);

    let coeff13 = (1.0 * n1 + n3) / n;
    let coeff23 = (1.0 * n2 + n3) / n;
    let coeff12 = -1.0 * n3 / n;
    return coeff13 * d13 + coeff23 * d23 - coeff12 * d12;
  }

  distance(node1, node2) {
    return this.distanceCache.getOrCompute(
      node1.values,
      node2.values,
      // intentionally ignore (a,b) since we need the node children
      (a, b) => this.recursiveDistance(node1, node2));
  }

  cluster(points) {
    this.initializeCache(points);
    let dendrogram = (new AgglomerativeHierarchy(
      (x, y) => this.distance(x, y)))
      .dendrogram(points);

    throw 'Not implemented';
    // TODO: add choice of level set maximizer.
    return dendrogram.levelSetMaximizing();
  }
}

module.exports = {
  WardClustering,
};
