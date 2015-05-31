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

    /**
     * Fires a ray from `rayOrigin` into `rayDirection` and collects all points
     * that lie in the octants intersected by the ray.
     *
     * This method implements An Efficient Parametric Algorithm for Octree Traversal
     * described in http://wscg.zcu.cz/wscg2000/Papers_2000/X31.pdf
     *
     * @param {Vector3} rayOrigin x,y,z coordinates where ray starts
     * @param {Vector3} rayDirection normalized x,y,z direction where ray shoots.
     * @param {number+} far maximum length of the ray. POSITIVE_INFINITY by default
     *
     * @return {Array} of indices in the source array. Each index represnts a start
     * of the x,y,z triplet of a point, that lies in the intersected octant.
     */
    intersectRay: intersectRay,

    /**
     * Once you have collected points from the octants intersected by a ray
     * (`intersectRay()` method), it may be worth to query points from the surrouning
     * area.
     */
    intersectSphere: intersectSphere,
    getRoot: getRoot
  };

  return api;

  function getRoot() {
    return root;
  }

  function intersectSphere(cx, cy, cz, r) {
    var indices = [];
    var r2 = r * r;
    root.query(indices, originalArray, intersectCheck, preciseCheck);
    return indices;

    // http://stackoverflow.com/questions/4578967/cube-sphere-intersection-test
    function intersectCheck(candidate) {
      var dist = r2;
      var half = candidate.half;
      if (cx < candidate.x - half) dist -= sqr(cx - (candidate.x - half));
      else if (cx > candidate.x + half) dist -= sqr(cx - (candidate.x + half));

      if (cy < candidate.y - half) dist -= sqr(cy - (candidate.y - half));
      else if (cy > candidate.y + half) dist -= sqr(cy - (candidate.y + half));

      if (cz < candidate.z - half) dist -= sqr(cz - (candidate.z - half));
      else if (cz > candidate.z + half) dist -= sqr(cz - (candidate.z + half));
      return dist > 0;
    }

    function preciseCheck(x, y, z) {
      return sqr(x - cx) + sqr(y - cy) + sqr(z - cz) < r2;
    }
  }

  function sqr(x) {
    return x * x;
  }

  function intersectRay(rayOrigin, rayDirection, near, far) {
    if (near === undefined) near = 0;
    if (far === undefined) far = Number.POSITIVE_INFINITY;
    near *= near;

    var indices = [];
    root.query(indices, originalArray, intersectCheck, farEnough);
    return indices.sort(byDistanceToCamera);

    function intersectCheck(candidate) {
      // using http://wscg.zcu.cz/wscg2000/Papers_2000/X31.pdf
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

    function farEnough(x, y, z) {
      var dist = (x - rayOrigin.x) * (x - rayOrigin.x) +
                  (y - rayOrigin.y) * (y - rayOrigin.y) +
                  (z - rayOrigin.z) * (z - rayOrigin.z);
      return dist >= near;
    }

    function byDistanceToCamera(idx0, idx1) {
      var x0 = rayOrigin[idx0];
      var y0 = rayOrigin[idx0 + 1];
      var z0 = rayOrigin[idx0 + 2];
      var dist0 = (x0 - rayOrigin.x) * (x0 - rayOrigin.x) +
                  (y0 - rayOrigin.y) * (y0 - rayOrigin.y) +
                  (z0 - rayOrigin.z) * (z0 - rayOrigin.z);

      var x1 = rayOrigin[idx1];
      var y1 = rayOrigin[idx1 + 1];
      var z1 = rayOrigin[idx1 + 2];

      var dist1 = (x1 - rayOrigin.x) * (x1 - rayOrigin.x) +
                  (y1 - rayOrigin.y) * (y1 - rayOrigin.y) +
                  (z1 - rayOrigin.z) * (z1 - rayOrigin.z);
      return dist0 - dist1;
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
