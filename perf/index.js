var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var createTree = require('../');
var queryTree = createQueryTree(100000);

// add tests
suite.add('init tree with 10k points', function() {
  createQueryTree(10000);
}).add('Intersect sphere (r = 20) tree with 100k points', function() {
  var count = 100000;
  queryTree.intersectSphere(
    getRandomPoint(count),
    getRandomPoint(count),
    getRandomPoint(count),
    20
  );
}).add('Intersect sphere (r = 200) tree with 100k points', function() {
  var count = 100000;
  queryTree.intersectSphere(
    getRandomPoint(count),
    getRandomPoint(count),
    getRandomPoint(count),
    200
  );
}).add('Intersect sphere (r = 0) tree with 100k points', function() {
  var count = 100000;
  queryTree.intersectSphere(
    getRandomPoint(count),
    getRandomPoint(count),
    getRandomPoint(count),
    0
  );
}).add('Intersect ray shot from the center into random direction', function() {
  var count = 100000;
  var rayDirection = {
    x: Math.random() - 0.5,
    y: Math.random() - 0.5,
    z: Math.random() - 0.5
  }
  queryTree.intersectRay({x : 0, y: 0, z: 0}, rayDirection);
}).add('Intersect ray shot from the edge into center', function() {
  var count = 100000;
  var rayDirection = {
    x: -1,
    y: 0,
    z: 0
  }
  queryTree.intersectRay({x : 100000, y: 0, z: 0}, rayDirection);
}).add('Intersect ray shot from the edge outside', function() {
  var count = 100000;
  var rayDirection = {
    x: 1,
    y: 0,
    z: 0
  }
  queryTree.intersectRay({x : 100000, y: 0, z: 0}, rayDirection);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Done!');
})
.run({ 'async': true });

function createPoints(count) {
  var array = new Array(count * 3);
  for (var i = 0; i < count; ++i) {
    var idx = i * 3;
    array[idx] = getRandomPoint(count);
    array[idx + 1] = getRandomPoint(count);
    array[idx + 2] = getRandomPoint(count);
  }

  return array;
}

function getRandomPoint(count) {
  return 2 * Math.random() * count - count;
}

function createQueryTree(count) {
  var points = createPoints(count);
  var tree = createTree();
  tree.init(points);
  return tree;
}
