# yaot

Octree in javascript. Extremely fast module to query points in 3D space. Can
be used to find points under mouse cursor in 3D scene.

# usage

This module is best suited for static scenes, where points are not changed
over time. To get started initialize the tree:

``` js
// First we need to create the tree:
var createTree = require('yaot');

var tree = createTree();
var points = [
  0, 0, 0, // First point at 0, 0, 0
  10, 0, 0 // second point at 10, 0, 0
]
tree.init(points);

// Now we are ready to query it:
// Which points lie inside sphere with center at 0, 0, 0 and radius 2?
var matches = tree.intersectSphere(0, 0, 0, 2);
// matches[0] === 0 -> the point at first index of `points` array is there!

// Let's extend our sphere:
var matches = tree.intersectSphere(0, 0, 0, 20);
// matches[0] === 0 -> Point at 0 is here too
// matches[1] === 3 -> Point at index 3 from `points` array also inisde
```

# install

With [npm](https://npmjs.org) do:

```
npm install yaot
```

# license

MIT
