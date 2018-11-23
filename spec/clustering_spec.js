const { Set, List } = require('immutable');
const {
  WardClustering,
} = require('../clustering');


describe("WardClustering", function() {
  it("should cluster simple points well", function() {
    let points = List([
      List([0, 0]),
      List([1, 2]),
      List([2, 1]),
      List([-1, -0.5]),
      List([10, 10]),
      List([11, 12]),
      List([12, 11]),
      List([9, 9.5]),
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
