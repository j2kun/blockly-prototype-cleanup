const { Set, List, Map } = require('immutable');
const { combinations } = require('./combinations');
const { DistanceCache } = require('./cache');
const { AgglomerativeHierarchy } = require('./dendrogram');

var SUM = (a, b) => a + b;
var EPSILON = 1e-9;


function euclideanDistance(x, y) {
  let val = 0;
  let i = 0;
  for (let xi of x) {
    yi = y.get(i);
    val += (xi - yi) * (xi - yi);
    i++;
  }
  return Math.sqrt(val);
};


class WardClustering {
  constructor(pointDistanceFn) {
    if (pointDistanceFn == null) {
      pointDistanceFn = euclideanDistance;
    }

    this.pointDistanceFn = pointDistanceFn;
    this.distanceCache = new DistanceCache();
    this.silhouetteScore = new SilhouetteScore(this.pointDistanceFn);
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
    let d12 = this.distance(c1, c2);
    let d13 = this.distance(c1, c3);
    let d23 = this.distance(c2, c3);

    let coeff13 = (1.0 * n1 + n3) / n;
    let coeff23 = (1.0 * n2 + n3) / n;
    let coeff12 = -1.0 * n3 / n;
    let value = coeff13 * d13 + coeff23 * d23 - coeff12 * d12;
    return value;
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

    return dendrogram.levelSetMaximizing(levelSet =>
      this.silhouetteScore.averageSilhouetteScore(levelSet));
  }
}

/**
 * A class that computes the silhouette score of a given clustering, using
 * a given distance function to compute the distance between points.
 *
 * A silhouette score is a measure of consistency of a point with respect to
 * its clustering. Values are between -1 and 1, with larger values indicating
 * better consistency.
 *
 * Cf. Peter J. Rousseuw 1987, "Silhouettes: a Graphical Aid to the
 * Interpretation and Validation of Cluster Analsys". Computational and
 * Applied Mathematics. doi:10.1016/0377-0427(87)90125-7
 */
class SilhouetteScore {
  constructor(pointDistanceFn) {
    this.pointDistanceFn = pointDistanceFn;
  }

  averageSilhouetteScore(levelSet) {
    let levelSetAsList = levelSet.toList().map(x => x.values);

    // This is a hack because the silhouette score is kind of
    // crappy when it comes to evaluating the quality of single
    // node clusters;
    if (levelSetAsList.reduce((a, b) => a || b.size == 1, false)) {
      return 0;
    }

    // First build a map from point -> cluster index
    let pointToClusterIndex = Map().withMutations(map => {
      let i = 0;
      for (let nodeValues of levelSetAsList) {
        for (let point of nodeValues) {
          map.set(point, i);
        }
        i++;
      }
    });

    // Then return the average silhouette score of each point, relative
    // to its cluster
    let singlePointScores = pointToClusterIndex.toSeq().map(
      (value, key) => this.singlePointSilhouetteScore(
        key, value, levelSetAsList))
      .toList();

    let score = 1.0 * singlePointScores.reduce(SUM, 0) / singlePointScores.size;
    console.log("Score " + score + " for level set " + levelSet);
    return score;
  }

  /**
   * Compute the silhouette score of a single point.
   *
   * The d(p, C) be the average distance between the argument point p and
   * all non-p points in a set C. Let C_p be the cluster for p. Let
   *
   *   in(p) = d(p, C_p - {p})
   *   out(p) = min_{C != C_p} d(p, C)
   *
   * Then the silhouette score of p is
   *
   *     out(p) - in(p)
   *  --------------------
   *   max(out(p), in(p))
   */
  singlePointSilhouetteScore(point, indexOfCluster, clusters) {
    let withinCluster = clusters.get(indexOfCluster).filter(p => p != point);
    let avgDistanceToPoint = (pts =>
      pts.size == 0 ? 0.0 : pts
      .map(p => this.pointDistanceFn(p, point))
      .reduce(SUM, 0) / pts.size);

    let withinClusterAverage = avgDistanceToPoint(withinCluster);
    let acrossClusterAverages = clusters
      .filter(cluster => !cluster.equals(clusters.get(indexOfCluster)))
      .map(pts => avgDistanceToPoint(pts));

    let minAcrossClusterAverage = 0;
    if (acrossClusterAverages) {
      minAcrossClusterAverage = Math.min(...acrossClusterAverages);
    }

    let denominator = Math.max(withinClusterAverage, minAcrossClusterAverage);
    if (minAcrossClusterAverage < EPSILON) {
      console.log(acrossClusterAverages);
      throw 'wat';
    }
    if (Math.abs(denominator) < EPSILON) {
      return 0.0;
    }

    let score = (1.0 * minAcrossClusterAverage - withinClusterAverage) / denominator;
    return score;
  }
}

module.exports = {
  WardClustering,
  euclideanDistance,
};
