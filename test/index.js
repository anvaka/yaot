var test = require('tap').test;
var createTree = require('../');

test('it can query points', function (t) {
  var tree = createTree();
  // two points:
  tree.init([
    0, 0, 0,
    10, 0, 0
  ]);

  // sphere at 0, -1, 0 with radius 2
  var matches = tree.intersectSphere(0, -1, 0, 2);
  t.equals(matches.length, 1, 'Only one point intersects sphere');
  t.equals(matches[0], 0, 'That point is and index 0');

  matches = tree.intersectSphere(0, -3, 0, 2);
  t.equals(matches.length, 0, 'There are no points at 0, -3, 0');

  matches = tree.intersectSphere(0, 0, 0, 20);
  t.equals(matches.length, 2, 'Sphere with r=20 captures all');
  t.equals(matches[0], 0, 'First point is here');
  t.equals(matches[1], 3, 'Second point is here');

  t.end();
});
