var THREE = require('three');
var tree = require('../')();

var container, stats, particleArray;

var camera, scene, renderer, mouse = {x: 0, y: 0};
var raycaster = new THREE.Raycaster();
raycaster.params.PointCloud.threshold = 10;

init();

function init() {
  container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 3500);
  camera.position.z = 2750;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050505, 2000, 3500);

  var particles = 500000;

  var geometry = new THREE.BufferGeometry();

  var positions = new Float32Array(particles * 3);
  var colors = new Float32Array(particles * 3);

  var color = new THREE.Color();

  var n = 1000,
    n2 = n / 2; // particles spread in the cube

  for (var i = 0; i < positions.length; i += 3) {

    // positions

    var x = Math.random() * n - n2;
    var y = Math.random() * n - n2;
    var z = Math.random() * n - n2;

    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;

    // colors

    var vx = (x / n) + 0.5;
    var vy = (y / n) + 0.5;
    var vz = (z / n) + 0.5;

    color.setRGB(vx, vy, vz);

    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  tree.initAsync(positions, listenToMouse);

  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  var material = new THREE.PointCloudMaterial({
    size: 15,
    vertexColors: THREE.VertexColors
  });

  particleSystem = new THREE.PointCloud(geometry, material);
  scene.add(particleSystem);
  particleArray = [particleSystem];

  renderer = new THREE.WebGLRenderer({
    antialias: false
  });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function listenToMouse() {
  animate();
  document.body.addEventListener('mousemove', queryPoints);
}

function queryPoints(e) {
  mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  var ray = raycaster.ray;
  console.time('ray');

  var items = raycaster.intersectObjects(particleArray);
  //var items = tree.intersectRay(ray.origin, ray.direction);

  console.timeEnd('ray');
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  var time = Date.now() * 0.001;
  particleSystem.rotation.x = time * 0.25;
  particleSystem.rotation.y = time * 0.5;
  renderer.render(scene, camera);
}
