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

