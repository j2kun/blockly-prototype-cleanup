import * as d3 from 'd3';
import { Vector, Rectangle } from './geometry';

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

let blocks = [
  new Rectangle(new Vector(-200, 100), 300, 75, {'fill': 'green'}),
  new Rectangle(new Vector(-300, -100), 100, 100, {'fill': 'red'}),
];


// Set up drag handlers
function dragged(d, rect) {
  console.log("Dragging");
  d.topLeft.x += d3.event.dx;
  d.topLeft.y -= d3.event.dy;

  rect.attr("x", fromCartesianX(d.topLeft.x))
      .attr("y", fromCartesianY(d.topLeft.y));

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
    .call(d3.drag().on("drag", function(d) {
      dragged(d, blockContainers);
    }));

  blockContainers.exit().remove();
  return blockContainers;
}


let blocksSVG = updateBlocksSVG(blocks);
