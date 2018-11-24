const {
  WardClustering,
} = require('./clustering');
const { Vector, Rectangle } = require('./geometry');


const COLUMN_SPACING = 20;  // space between output columns, in pixels
const ROW_SPACING = 10;  // space between output blocks within a column, in pixels


function distanceBetweenBlocks(b1, b2) {
  let dx = b1.center().x - b2.center().x;
  let dy = b1.center().y - b2.center().y;
  return Math.sqrt(dx*dx + dy*dy);
}

function blockSizeLargestToSmallest(b1, b2) {
  // return b1.width - b2.width;
  if (b1.width > b2.width) {
    return -1;
  } else if (b1.width < b2.width) {
    return 1;
  } else if (b1.width == b2.width) {
    if (b1.height > b2.height) {
      return -1
    } else if (b1.height < b2.height) {
      return 1;
    } else {
      return 0;
    }
  }
}

function clusterCenter(cluster) {
 return cluster.map(x => x.center())
    .reduce((acc, next) => acc.add(next), new Vector(0, 0))
    .scale(1.0 / cluster.length);
}

function comparingClusterCenters(c1, c2) {
  let c1Center = clusterCenter(c1);
  let c2Center = clusterCenter(c2);
  return c1Center.compareTo(c2Center);
}

/*
 * Cleanup blocks using a simple clustering algorithm.
 *
 * Returns a map from block id to the new position vector for that
 * block's topLeft.
 */
function cleanup(blocks, canvasTopLeft, rowSpacing, columnSpacing) {
  if (!rowSpacing) {
    rowSpacing = ROW_SPACING;
  }
  if (!columnSpacing) {
    columnSpacing = COLUMN_SPACING;
  }

  let clustering = new WardClustering(distanceBetweenBlocks).cluster(blocks);
  let clusters = [...clustering].map(x => [...x.values]);
  let sortedClustering = clusters.sort(comparingClusterCenters);

  let idToPositionMap = {};
  let columnTopLeft = canvasTopLeft;

  for (let cluster of sortedClustering) {
    cluster.sort(blockSizeLargestToSmallest);
    let x = columnTopLeft.x;
    let y = columnTopLeft.y;

    for (let block of cluster) {
      idToPositionMap[block.attrs.id] = new Vector(x, y);
      y += block.height + rowSpacing;
    }

    let offsetToNextColumn = new Vector(cluster[0].width + columnSpacing, 0);
    columnTopLeft = columnTopLeft.add(offsetToNextColumn);
  }

  return idToPositionMap;
}


module.exports = {
  cleanup,
};
