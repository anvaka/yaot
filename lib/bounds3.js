module.exports = Bounds3;

function Bounds3(x, y, z, half) {
  this.x = typeof x === 'number' ? x : 0;
  this.y = typeof y === 'number' ? y : 0;
  this.z = typeof z === 'number' ? z : 0;
  this.half = typeof half === 'number' ? half : 0;
}

Bounds3.prototype.contains = function contains(x, y, z) {
  var half = this.half;
  return this.x - half <= x && x < this.x + half &&
    this.y - half <= y && y < this.y + half &&
    this.z - half <= z && z < this.z + half;
};

