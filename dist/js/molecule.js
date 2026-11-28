/* Stylized glucose ring. Vendored THREE (r160) is optional; the still image remains if WebGL or the library is unavailable. */
(function () {
  var stage = document.querySelector("[data-molecule]");
  if (!stage || !window.THREE) return;

  var canvas = stage.querySelector("canvas");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });
  } catch (error) {
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  var radius = 1;

  scene.add(new THREE.AmbientLight(0xfff6f8, 0.72));
  var hemi = new THREE.HemisphereLight(0xfff8f4, 0x501060, 0.45);
  scene.add(hemi);
  var key = new THREE.DirectionalLight(0xfff7fb, 1.55);
  key.position.set(4.5, 6.2, 5);
  scene.add(key);
  var blush = new THREE.DirectionalLight(0xf0b0d0, 0.7);
  blush.position.set(-5, 1.5, -2);
  scene.add(blush);
  var rim = new THREE.PointLight(0xc04070, 8, 22);
  rim.position.set(-2.5, -1.2, 3.5);
  scene.add(rim);

  var group = new THREE.Group();
  group.rotation.set(0.62, 0.4, 0.18);
  scene.add(group);

  function material(color, radius) {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: radius > 0.28 ? 0.38 : 0.28,
      metalness: 0.03,
      clearcoat: 0.62,
      clearcoatRoughness: 0.38,
      sheen: 0.55,
      sheenRoughness: 0.46,
      sheenColor: new THREE.Color("#f0c0d0")
    });
  }

  function addSphere(position, color, radius) {
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 28), material(color, radius));
    mesh.position.set(position[0], position[1], position[2]);
    group.add(mesh);
    return mesh.position;
  }

  function addBond(a, b, color) {
    var start = new THREE.Vector3(a[0], a[1], a[2]);
    var end = new THREE.Vector3(b[0], b[1], b[2]);
    var dir = new THREE.Vector3().subVectors(end, start);
    var length = dir.length();
    var mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, length, 14),
      new THREE.MeshPhysicalMaterial({
        color: color || 0x802070,
        roughness: 0.32,
        metalness: 0.06,
        clearcoat: 0.4
      })
    );
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    group.add(mesh);
  }

  var ring = [
    [0.0, 0.12, 1.2],
    [1.12, -0.18, 0.58],
    [1.12, 0.22, -0.78],
    [0.0, -0.22, -1.32],
    [-1.12, 0.2, -0.78],
    [-1.12, -0.16, 0.58]
  ];
  var ringColors = [0xc04070, 0x802070, 0x64145e, 0x802070, 0xb03070, 0x701860];
  ring.forEach(function (point, index) {
    addSphere(point, ringColors[index], index === 0 ? 0.36 : 0.4);
  });
  for (var i = 0; i < ring.length; i += 1) addBond(ring[i], ring[(i + 1) % ring.length]);

  var arms = [
    { at: ring[1], to: [2.15, 0.42, 0.95], color: 0xf0b0d0 },
    { at: ring[2], to: [2.05, -0.48, -1.35], color: 0xf0c0d0 },
    { at: ring[3], to: [0.2, 0.62, -2.35], color: 0xf0b0d0 },
    { at: ring[4], to: [-2.12, -0.42, -1.2], color: 0xf0c0d0 },
    { at: ring[5], to: [-2.05, 0.55, 1.15], color: 0xb03070, radius: 0.3 },
    { at: [-2.05, 0.55, 1.15], to: [-2.95, -0.15, 1.95], color: 0xf0b0d0 }
  ];
  arms.forEach(function (arm) {
    addBond(arm.at, arm.to, 0x9a3878);
    addSphere(arm.to, arm.color, arm.radius || 0.24);
  });

  /* Spin around the molecule's own center. The old camera sat above the model
     and the short canvas cropped everything below the ring. */
  var savedTilt = group.rotation.clone();
  group.rotation.set(0, 0, 0);
  group.updateMatrixWorld(true);
  var sphere = new THREE.Box3().setFromObject(group).getBoundingSphere(new THREE.Sphere());
  group.children.forEach(function (child) {
    child.position.sub(sphere.center);
  });
  group.rotation.copy(savedTilt);
  radius = sphere.radius || 1;

  var clock = new THREE.Clock();
  var running = false;
  var visible = true;

  function fitCamera() {
    var vFov = camera.fov * Math.PI / 180;
    var hFov = 2 * Math.atan(Math.tan(vFov / 2) * (camera.aspect || 1));
    var pad = 1.24;
    var dist = Math.max(
      (radius * pad) / Math.sin(vFov / 2),
      (radius * pad) / Math.sin(hFov / 2)
    );
    camera.position.set(0, radius * 0.02, dist);
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.05, dist - radius * 4);
    camera.far = dist + radius * 6;
    camera.updateProjectionMatrix();
  }

  function resize() {
    var width = canvas.clientWidth || stage.clientWidth;
    var height = canvas.clientHeight || stage.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    fitCamera();
  }

  function render() {
    var t = clock.getElapsedTime();
    if (!reduce) {
      group.rotation.y = 0.4 + t * 0.28;
      group.rotation.x = 0.62 + Math.sin(t * 0.35) * 0.06;
      group.position.y = Math.sin(t * 0.7) * 0.06;
    }
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    render();
    if (!reduce && visible) requestAnimationFrame(loop);
    else running = false;
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  stage.classList.add("is-live");
  stage.setAttribute("data-motion", reduce ? "still" : "spin");
  resize();
  render();

  if (!reduce && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }, { threshold: 0.05 });
    observer.observe(stage);
    visible = true;
  }
  if (!reduce) start();

  window.addEventListener("resize", function () {
    resize();
    render();
  });
})();
