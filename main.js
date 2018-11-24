import * as d3 from 'd3';
import { Vector, Rectangle } from './geometry';
import * as cleanup from './cleanup_cluster';

let width = 800;
let height = 600;
let svg = d3.select("#demo")
  .insert("svg", ":first-child")
  .attr("width", width)
  .attr("height", height);

let originX = width / 2;
let originY = height / 2;

function fromCartesianX(x) { return originX + x; }
function fromCartesianY(y) { return originY - y; }
function toCartesianX(x) { return x - originX; }
function toCartesianY(y) { return -y + originY; }
function toCartesian(p) {
  return new Vector(toCartesianX(p.x), toCartesianY(p.y));
}

let topLeft = new Vector(toCartesianX(20), toCartesianY(20));

let blocks = [
  new Rectangle(toCartesian(new Vector(20, 21)), 50, 22, {'fill': 'green', 'id': 0}),
  new Rectangle(toCartesian(new Vector(30, 15)), 85, 20, {'fill': 'red', 'id': 1}),
  new Rectangle(toCartesian(new Vector(480, 30)), 85, 30, {'fill': 'blue', 'id': 2}),
  new Rectangle(toCartesian(new Vector(460, 45)), 12, 100, {'fill': 'purple', 'id': 3}),
  new Rectangle(toCartesian(new Vector(75, 300)), 60, 60, {'fill': 'brown', 'id': 4}),
  new Rectangle(toCartesian(new Vector(85, 310)), 100, 25, {'fill': 'black', 'id': 5}),
  new Rectangle(toCartesian(new Vector(65, 400)), 40, 70, {'fill': 'yellow', 'id': 6}),
  new Rectangle(toCartesian(new Vector(300, 200)), 30, 30, {'fill': 'blue', 'id': 7}),
  new Rectangle(toCartesian(new Vector(320, 210)), 30, 30, {'fill': 'pink', 'id': 8}),
  new Rectangle(toCartesian(new Vector(330, 240)), 30, 30, {'fill': 'red', 'id': 9}),
];


// Set up drag handlers
function dragged(d) {
  d.topLeft.x += d3.event.dx;
  d.topLeft.y -= d3.event.dy;
  updateBlocksSVG(blocks);
}


function updateBlocksSVG(rectangles) {
  let blockContainers = svg.selectAll(".block").data(rectangles);

  blockContainers.enter().append("rect")
    .merge(blockContainers)
    .attr("x", d => fromCartesianX(d.topLeft.x))
    .attr("y", d => fromCartesianY(d.topLeft.y))
    .attr("width", d => d.width)
    .attr("height", d => d.height)
    .attr("stroke", "black")
    .attr("stroke-width", 4)
    .attr("fill", d => d.attrs['fill'])
    .attr("class", "block")
    .call(d3.drag().on("drag", dragged));

  blockContainers.exit().remove();
  return blockContainers;
}


function doCleanup() {
  let newPositionMap = cleanup.cleanup(blocks, topLeft);
  console.log(newPositionMap);

  for (let block of blocks) {
    let id = block.attrs.id;
    let newPosn = newPositionMap[id];
    block.topLeft.x = newPosn.x;
    block.topLeft.y = newPosn.y;
  }

  updateBlocksSVG(blocks);
}


updateBlocksSVG(blocks);
d3.select("#cleanup_button").on('click', doCleanup);
