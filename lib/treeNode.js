var Bounds3 = require('./bounds3.js');
var MAX_ITEMS = 4;

module.exports = TreeNode;

function TreeNode(bounds) {
  this.bounds = bounds;
  this.q0 = null;
  this.q1 = null;
  this.q2 = null;
  this.q3 = null;
  this.q4 = null;
  this.q5 = null;
  this.q6 = null;
  this.q7 = null;
  this.items = null;
}

TreeNode.prototype.subdivide = function subdivide() {
  var bounds = this.bounds;
  var quarter = bounds.half / 2;

  this.q0 = new TreeNode(new Bounds3(bounds.x - quarter, bounds.y - quarter, bounds.z - quarter, quarter));
  this.q1 = new TreeNode(new Bounds3(bounds.x + quarter, bounds.y - quarter, bounds.z - quarter, quarter));
  this.q2 = new TreeNode(new Bounds3(bounds.x - quarter, bounds.y + quarter, bounds.z - quarter, quarter));
  this.q3 = new TreeNode(new Bounds3(bounds.x + quarter, bounds.y + quarter, bounds.z - quarter, quarter));
  this.q4 = new TreeNode(new Bounds3(bounds.x - quarter, bounds.y - quarter, bounds.z + quarter, quarter));
  this.q5 = new TreeNode(new Bounds3(bounds.x + quarter, bounds.y - quarter, bounds.z + quarter, quarter));
  this.q6 = new TreeNode(new Bounds3(bounds.x - quarter, bounds.y + quarter, bounds.z + quarter, quarter));
  this.q7 = new TreeNode(new Bounds3(bounds.x + quarter, bounds.y + quarter, bounds.z + quarter, quarter));
};

TreeNode.prototype.insert = function insert(idx, array, depth) {
  var isLeaf = this.q0 === null;
  if (isLeaf) {
    // TODO: this memory could be recycled to avoid GC
    if (this.items === null) {
      this.items = [idx];
    } else {
      this.items.push(idx);
    }
    if (this.items.length >= MAX_ITEMS && depth < 16) {
      this.subdivide();
      for (var i = 0; i < this.items.length; ++i) {
        this.insert(this.items[i], array, depth + 1);
      }
      this.items = null;
    }
  } else {
    var x = array[idx],
      y = array[idx + 1],
      z = array[idx + 2];
    var bounds = this.bounds;
    var quadIdx = 0; // assume NW
    if (x > bounds.x) {
      quadIdx += 1; // nope, we are in E part
    }
    if (y > bounds.y) {
      quadIdx += 2; // Somewhere south.
    }
    if (z > bounds.z) {
      quadIdx += 4; // Somewhere far
    }

    var child = getChild(this, quadIdx);
    child.insert(idx, array, depth + 1);
  }
};

TreeNode.prototype.query = function queryBounds(results, sourceArray, intersects, preciseCheck) {
  if (!intersects(this.bounds)) return;
  var items = this.items;
  var needsCheck = typeof preciseCheck === 'function';
  if (items) {
    for (var i = 0; i < items.length; ++i) {
      var idx = items[i];
      if (needsCheck) {
        if (preciseCheck(sourceArray[idx], sourceArray[idx + 1], sourceArray[idx + 2])) {
          results.push(idx);
        }
      } else {
        results.push(idx);
      }
    }
  }

  if (!this.q0) return;

  this.q0.query(results, sourceArray, intersects, preciseCheck);
  this.q1.query(results, sourceArray, intersects, preciseCheck);
  this.q2.query(results, sourceArray, intersects, preciseCheck);
  this.q3.query(results, sourceArray, intersects, preciseCheck);
  this.q4.query(results, sourceArray, intersects, preciseCheck);
  this.q5.query(results, sourceArray, intersects, preciseCheck);
  this.q6.query(results, sourceArray, intersects, preciseCheck);
  this.q7.query(results, sourceArray, intersects, preciseCheck);
};

function getChild(node, idx) {
  if (idx === 0) return node.q0;
  if (idx === 1) return node.q1;
  if (idx === 2) return node.q2;
  if (idx === 3) return node.q3;
  if (idx === 4) return node.q4;
  if (idx === 5) return node.q5;
  if (idx === 6) return node.q6;
  if (idx === 7) return node.q7;
}
