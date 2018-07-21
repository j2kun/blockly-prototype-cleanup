// Prototype block cleanup algorithm

import * as solver from 'javascript-lp-solver';
import { Vector, Rectangle } from './geometry';


/* Example model with one block and two destinations
let exampleModel = {
    "optimize": "cost",
    "opType": "min",
    "constraints": {
        "x_1_1": {"min": 0},
        "x_1_2": {"min": 0},
        "block_1_moves": {"equal": 1},
        "space_1_filled": {"max": 1},
    },
    "variables": {
        "x_1_1": {
            "cost": 12,
            "block_1_moves": 1
            "space_1_filled": 1
        },
        "x_1_2": {
            "cost": 20,
            "block_1_moves": 1
            "space_2_filled": 1
        },
    },
};

let results = solver.Solve(exampleModel);
console.log(results);
*/

function chooseGrid(blocks, canvasTopLeft) {
  let vGap = 25;
  let hGap = 25;
  let minWidth = 100;
  let minHeight = 100;
  for (let b of blocks) {
    if (b.width < minWidth) {
      minWidth = b.width;
    }
    if (b.height < minHeight) {
      minHeight = b.height;
    }
  }

  minWidth += hGap;
  minHeight += vGap;

  let gridDim = 2 * Math.ceil(Math.sqrt(blocks.length));
  let grid = [];
  for (let i = 0; i < gridDim; i++) {
    for (let j = 0; j < gridDim; j++) {
      grid.push(new Vector(
        canvasTopLeft.x + minWidth * j,
        canvasTopLeft.y - minHeight * i,
      ));
    }
  }

  return grid;
}


function variable_name(block, position) {
  return ["x", block.attrs['id'], position.x, position.y].join("_");
}

function block_move_name(block) {
  return ["block", block.attrs['id'], "moves"].join("_");
}

function space_filled_name(position) {
  return ["space", position.x, position.y, "filled"].join("_");
}


function buildModel(blocks, grid) {
  let variables = {};
  let constraints = {};
  for (let block of blocks) {
    let block_move_name_coeff = block_move_name(block);

    // Require the sum of variables that have this coefficient set on them to
    // be 1, i.e., the block is moved (even if it is split across multiple
    // destinations).
    constraints[block_move_name_coeff] = {"equal": 1};

    for (let position of grid) {
      // The cost of moving is the distance from the block's upper left corner
      // to the destination position.
      let distance = block.topLeft.distance(position);

      let var_name = variable_name(block, position);
      let space_filled_name_coeff = space_filled_name(position);

      variables[var_name] = { 'cost': distance };
      variables[var_name][block_move_name_coeff] = 1;
      variables[var_name][space_filled_name_coeff] = 1;

      constraints[var_name] = { 'min': 0 };
      if (!(space_filled_name_coeff in constraints)) {
        constraints[space_filled_name_coeff] = { 'max': 1 };
      }
    }
  }

  return {
    "optimize": "cost",
    "opType": "min",
    "constraints": constraints,
    "variables": variables,
  };
}

function cleanupTransportationLP(blocks, canvasTopLeft) {
  let grid = chooseGrid(blocks, canvasTopLeft);
  let model = buildModel(blocks, grid);
  // postprocessing step

  console.log(model);

  let solverOutput = solver.Solve(model);

  console.log(solverOutput);

  /*
   * Return a map from block id to the new position vector for its topLeft.
   */
  let variableKeys = Object.keys(solverOutput).filter(
      name => name.startsWith("x_") && solverOutput[name] > 0);
  let idToPositionMap = {};

  for (let key of variableKeys) {
    let tokens = key.split("_");
    // ["x", block_id, grid_posn_x, grid_posn_y]
    let block_id = parseInt(tokens[1]);
    let grid_posn_x = parseInt(tokens[2]);
    let grid_posn_y = parseInt(tokens[3]);

    idToPositionMap[block_id] = new Vector(grid_posn_x, grid_posn_y);
  }

  return idToPositionMap;
}


module.exports = {
  cleanupTransportationLP,
};
