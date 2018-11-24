const { Set, List } = require('immutable');
const {
  WardClustering,
  euclideanDistance,
} = require('../clustering');

var TOLERANCE = 1e-10;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}


describe("euclideanDistance", function() {
  it("should be correct for the same point", function() {
    let point = new Point(1, 2);
    expect(euclideanDistance(point, point)).toBeCloseTo(0.0, TOLERANCE);
  });

  it("should be correct for simple points", function() {
    let point1 = new Point(1, 2);
    let point2 = new Point(2, 1);
    expect(euclideanDistance(point1, point2))
      .toBeCloseTo(Math.sqrt(2), TOLERANCE);
  });

  it("should be correct for far points", function() {
    let point1 = new Point(11, 12);
    let point2 = new Point(2, 1);
    expect(euclideanDistance(point1, point2))
      .toBeCloseTo(Math.sqrt(121 + 81), TOLERANCE);
  });
});


describe("WardClustering", function() {
  it("should cluster simple points well", function() {
    let points = List([
      new Point(0, 0),
      new Point(1, 2),
      new Point(2, 1),
      new Point(-1, -0.5),
      new Point(10, 10),
      new Point(11, 12),
      new Point(12, 11),
      new Point(9, 9.5),
    ]);

    let expectedClustering = Set([
      Set([
        points.get(0),
        points.get(1),
        points.get(2),
        points.get(3),
      ]),
      Set([
        points.get(4),
        points.get(5),
        points.get(6),
        points.get(7),
      ]),
    ]);

    let wardClustering = (new WardClustering()).cluster(points).map(
      x => x.values);

    expect(wardClustering).toEqualImmutable(expectedClustering);
  });
});
