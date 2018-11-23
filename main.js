import * as d3 from 'd3';
import { Vector, Rectangle } from './geometry';
import * as cleanup from './cleanup';
import * as dendrogram from './dendrogram';

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

let topLeft = new Vector(toCartesianX(0), toCartesianY(0));

let blocks = [
  new Rectangle(new Vector(-200, 100), 100, 25, {'fill': 'green', 'id': 0}),
  new Rectangle(new Vector(-300, -100), 50, 50, {'fill': 'red', 'id': 1}),
  new Rectangle(new Vector(-320, -130), 70, 20, {'fill': 'blue', 'id': 2}),
  new Rectangle(new Vector(-200, -140), 90, 60, {'fill': 'purple', 'id': 3}),
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
  let newPositionMap = cleanup.cleanupTransportationLP(blocks, topLeft);
  console.log(newPositionMap);

  for (let block of blocks) {
    let id = block.attrs['id'];
    let newPosn = newPositionMap[id];
    block.topLeft.x = newPosn.x;
    block.topLeft.y = newPosn.y;
  }

  updateBlocksSVG(blocks);
}


updateBlocksSVG(blocks);
d3.select("#cleanup_button").on('click', doCleanup);
