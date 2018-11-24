const {
  cleanup,
} = require('../cleanup_cluster');

const {
  Rectangle,
  Vector
} = require('../geometry');

describe("cleanup", function() {

  var blocks = [
    new Rectangle(new Vector(20, 21), 50, 20, {id: 0}),
    new Rectangle(new Vector(30, 15), 85, 10, {id: 1}),
    new Rectangle(new Vector(200, 30), 11, 20, {id: 2}),
    new Rectangle(new Vector(210, 45), 85, 10, {id: 3}),
    new Rectangle(new Vector(190, 35), 12, 20, {id: 4}),
    new Rectangle(new Vector(193, 36), 13, 20, {id: 5}),
  ];
  blocks.sort((a, b) => Math.random());
  var topLeft = new Vector(0, 0);

  it("should order blocks properly", function() {
    let rowSpacing = 10;
    let columnSpacing = 10;
    let output = cleanup(blocks, topLeft, rowSpacing, columnSpacing);
    expect(output[1]).toEqual(new Vector(0, 0));
    expect(output[0]).toEqual(new Vector(0, 0 + 10 + rowSpacing));

    let secondColX = 85 + columnSpacing;
    expect(output[3]).toEqual(new Vector(secondColX, 0));
    expect(output[5]).toEqual(new Vector(secondColX, 0 + 10 + rowSpacing));
    expect(output[4]).toEqual(new Vector(secondColX, 0 + 10 + 20 + 2*rowSpacing));
    expect(output[2]).toEqual(new Vector(secondColX, 0 + 10 + 2*20 + 3*rowSpacing));
  });
});
