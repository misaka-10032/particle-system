define(['jquery', 'underscore', 'three', 'stats', 'ps'],
       function($, _, THREE, Stats, ps) {

  // timestep in integration
  var TIMESTEP = 1e-1;

  // min/max init velocity
  var MIN_VEL = 10;
  var MAX_VEL = 20;
  // boost velocity in y
  var Y_VEL = 10;

  var div = $('#demo-fireworks');
  var scene = new THREE.Scene();

  // camera
  var camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(0, 0, 250);
  scene.add(camera);

  // lights
  var aLight = new THREE.AmbientLight(0x666666);
  scene.add(aLight);

  /*** firework ***/

  // uniformly sample from a sphere
  // boosting vel on y axis
  function randv3(vmin, vmax) {
    var m = Math.random() * (vmax-vmin) + vmin;
    var theta = Math.random() * Math.PI;
    var phi = Math.random() * (Math.PI*2);
    var v1 = m * Math.sin(theta) * Math.cos(phi);
    var v2 = m * Math.sin(theta) * Math.sin(phi);
    var v3 = m * Math.cos(theta);
    return new THREE.Vector3(v1, v2+Y_VEL, v3);
  }

  // particles
  var nParticles = 100;
  var particles = [];
  for (i = 0; i < nParticles; i++) {
    var particle = new ps.Particle(null, null,
      randv3(MIN_VEL, MAX_VEL), null);
    particles.push(particle);
  }
  var psFirework = new ps.ParticleSystem(particles);

  // geometry
  var geoFirework = new THREE.Geometry();

  _.each(particles, function(p) {
    geoFirework.vertices.push(p.pos);
  });

  // material
  var texLoader = new THREE.TextureLoader();
  var texFirework = texLoader.load("/img/particle.png");
  var matFirework = new THREE.PointsMaterial({
    size: 10,
    map: texFirework,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
  });
  matFirework.color.setHSL(0.2, 0.2, 0.5);

  // firework scene object
  var firework = new THREE.Points(geoFirework, matFirework);
  scene.add(firework);

  // renderer
  var renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0.2);
  renderer.autoClearColor = false;
  div.append(renderer.domElement);

  // background plane for the trail
  var bg = new THREE.Mesh(
    new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
    })
  );
  bg.position.z = -10;
  scene.add(bg);

  // event listener
  window.addEventListener( 'resize', onWindowResize, false );

  // stats
  var stats = new Stats();
  stats.domElement.setAttribute("style",
    ["position: fixed; top: 0px; left: 0px; cursor: pointer;",
     "opacity: 0.9; z-index: 10000;"].join('\n'));
  div.append(stats.domElement);

  // begin animation
  animate();

  // animate a frame
  function animate() {
    render();
    stats.update();
    requestAnimationFrame(animate);
  }

  // render the scene
  function render() {
    // update camera
    camera.lookAt(scene.position);

    // update scene objects
    psFirework.integrate(TIMESTEP);
    geoFirework.verticesNeedUpdate = true;

    // render
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    bg.scale.set(window.innerWidth, window.innerHeight, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});
