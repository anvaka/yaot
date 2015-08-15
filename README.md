# yaot [![Build Status](https://travis-ci.org/anvaka/yaot.svg)](https://travis-ci.org/anvaka/yaot)

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
// matches[0] === 0 -> Point at index 0 is here too
// matches[1] === 3 -> Point at index 3 from `points` array also inisde
```

You can also query points which lies inside octants intersected by a ray. This
is very useful when you want to know which points lie under mouse cursor.

``` js
var rayOrigin = {
  x: 1, y: 0, z: 0
};
var rayDirection = {
  x: -1, y: 0, z: 0
};
var matches = tree.intersectRay(rayOrigin, rayDirection)

// If you want to limit where ray starts checking against intersection
// you can pass option `near` argumnet:
var near = 10; // by default it is 0, but could be made bigger!
var matches10PixelsAway = tree.intersectRay(rayOrigin, rayDirection, near);

// You can also limit upper bound by setting `far` argument:
var far = 100; // By default it is positive infinity, which matches all.
var matchesPointsBetween10And100Pixels =
    tree.intersectRay(rayOrigin, rayDirection, near, far);
```

To see how to use it with three.js please read about demo below.

# demo

A three.js demo is available [here](http://anvaka.github.io/yaot/demo/octree.html) ([src](https://github.com/anvaka/yaot/blob/master/demo/octree.js#L104)).
You can compare its performance to native three.js [`raycaster.intersectObjects()`
method](http://anvaka.github.io/yaot/demo/raycaster.html) ([src](https://github.com/anvaka/yaot/blob/master/demo/raycaster.js#L103)).
Open dev console on both pages to see the timers. Octree solution is 42 times faster than
native `raycaster.intersectObjects()`.

Video comparison is available here: https://www.youtube.com/watch?v=9Z-Yzb-WSKg

Keep in mind that raycaster is generalized solution which works with any three.js
objects, while octree is very much specialized.

This module is also used in the [code galaxies](http://anvaka.github.io/pm/).
Source code is [here](https://github.com/anvaka/unrender/blob/master/lib/hit-test.js).

# install

With [npm](https://npmjs.org) do:

```
npm install yaot
```

# license

MIT
