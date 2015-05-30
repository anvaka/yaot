var Bounds3 = require('./lib/bounds3.js');
var TreeNode = require('./lib/treeNode.js');
var EmptyRegion = new Bounds3();

module.exports = createTree;

function createTree(options) {
  options = options || {};

  var root;
  var originalArray;
  var api = {
    init: init,
    bounds: getBounds,
    rayTrace: rayTrace,
    getRoot: getRoot
  };

  return api;

  function getRoot() {
    return root;
  }

  function rayTrace(rayOrigin, rayDirection, far) {
    if (far === undefined) far = Number.POSITIVE_INFINITY;
    intersectCheck.precise = preciseCheck;

    var indices = [];
    root.query(indices, originalArray, intersectCheck);
    return indices;

    function intersectCheck(candidate) {
      var half = candidate.half;
      var t1 = (candidate.x - half - rayOrigin.x) / rayDirection.x,
        t2 = (candidate.x + half - rayOrigin.x) / rayDirection.x,
        t3 = (candidate.y + half - rayOrigin.y) / rayDirection.y,
        t4 = (candidate.y - half - rayOrigin.y) / rayDirection.y,
        t5 = (candidate.z - half - rayOrigin.z) / rayDirection.z,
        t6 = (candidate.z + half - rayOrigin.z) / rayDirection.z,
        tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6)),
        tmin;

      if (tmax < 0) return false;

      tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
      return tmin <= tmax && tmin <= far;
    }

    function preciseCheck() {
      return true;
    }
  }

  function init(points) {
    if (!points) throw new Error('Points array is required for quadtree to work');
    if (typeof points.length !== 'number') throw new Error('Points should be array-like object');
    if (points.length % 3 !== 0) throw new Error('Points array should consist of series of x,y,z coordinates and be multiple of 3');
    originalArray = points;
    root = createRootNode(points);
    for (var i = 0; i < points.length; i += 3) {
      root.insert(i, originalArray, 0);
    }
  }

  function getBounds() {
    if (!root) return EmptyRegion;
    return root.bounds;
  }

  function createRootNode(points) {
    // Edge case deserves empty region:
    if (points.length === 0) {
      var empty = new Bounds3();
      return new TreeNode(empty);
    }

    // Otherwise let's figure out how big should be the root region
    var minX = Number.POSITIVE_INFINITY;
    var minY = Number.POSITIVE_INFINITY;
    var minZ = Number.POSITIVE_INFINITY;
    var maxX = Number.NEGATIVE_INFINITY;
    var maxY = Number.NEGATIVE_INFINITY;
    var maxZ = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < points.length; i += 3) {
      var x = points[i],
        y = points[i + 1],
        z = points[i + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    // Make bounds square:
    var side = Math.max(Math.max(maxX - minX, maxY - minY), maxZ - minZ);
    // since we need to have both sides inside the area, let's artificially
    // grow the root region:
    side += 2;
    minX -= 1;
    minY -= 1;
    minZ -= 1;
    var half = side / 2;

    var bounds = new Bounds3(minX + half, minY + half, minZ + half, half);
    return new TreeNode(bounds);
  }
}
