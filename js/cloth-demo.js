/**
 * @brief Place a cloth demo inside a container.
 * @return {object} Contains an init function that takes the follow config:
 *
 * {
 *   divId: Id of the container.
 *   texUrl: Texture url of the cloth.
 * }
 *
 */
define(['jquery', 'underscore', 'three', 'orbit', 'stats', 'cloth'],
        function($, _, three, orbit, Stats, CLOTH) {
  return {
    init: function(config) {
      var div = $("#".concat(config.divId));
      var scene = new THREE.Scene();

      // camera
      var camera = new THREE.PerspectiveCamera(
        30, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set(1000, 50, 1500);
      scene.add(camera);

      // lights
      var aLight = new THREE.AmbientLight(0x666666);
      scene.add(aLight);

      // array of fireworks
      var cloth = new CLOTH.Cloth(null, null, null, null, config.texUrl);
      _.each(cloth.sceneObjects, function(obj) {
        scene.add(obj);
      });

      // renderer
      var renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: false,
        alpha: false,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0xeeeeee);
      renderer.autoClearColor = true;
      div.append(renderer.domElement);

      // stats
      var stats = new Stats();
      stats.domElement.setAttribute("style",
        ["position: fixed; top: 0px; left: 0px; cursor: pointer;",
         "opacity: 0.9; z-index: 10000;"].join('\n'));
      div.append(stats.domElement);

      // append replay button
      var replayBtn = $("<a>", {
        id: "replay", text: "Replay",
        style: "position:fixed; top:0px; right:0px; cursor:pointer; padding:20px;",
      });
      div.append(replayBtn);

      // orbit control
      var ctr = new THREE.OrbitControls(camera, renderer.domElement);
      ctr.maxPolarAngle = Math.PI * 0.5;
      ctr.minDistance = 1000;
      ctr.maxDistance = 7500;

      // arrow helper indicating wind dir
      var arrow = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 0),
          0, 0x0000ff);
      scene.add(arrow);

      // event listener
      window.addEventListener('resize', onWindowResize, false);
      window.addEventListener('mousedown', onMouseDown, false);
      window.addEventListener('mouseup', onMouseUp, false);
      window.addEventListener('mousemove', onMouseMove, false);
      $("#replay").click(onClickReplay);

      // begin animation!
      animate();

      function animate() {
        cloth.animate();
        render();
        stats.update();
        requestAnimationFrame(animate);
      }

      function render() {
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function screenToWorld(x, y) {
        var pos = new THREE.Vector3(
             x / window.innerWidth * 2 - 1,
            -y / window.innerHeight * 2 + 1,
            0.5);
        pos.unproject(camera);
        pos.sub(camera.position).normalize();
        var dist = -camera.position.z / pos.z;
        pos = camera.position.clone().add(pos.multiplyScalar(dist));
        return pos;
      }

      function onMouseMove(e) {
        var pos = screenToWorld(e.clientX, e.clientY);
        console.log('mouse move');
        console.log('mouse:', e.clientX, e.clientY);
        console.log('world:', pos);
        arrow.position.copy(pos);
        arrow.setDirection(pos.clone().negate().normalize());
        arrow.setLength(100);
      }

      function onMouseDown(e) {
        var pos = screenToWorld(e.clientX, e.clientY);
        console.log('mouse down');
        console.log('mouse:', e.clientX, e.clientY);
        console.log('world:', pos);
        // blow a wind
        cloth.windDir.copy(pos).negate().normalize();
        console.log('wind dir:', cloth.windDir);
      }

      function onMouseUp(e) {
        console.log('mouse up');
        // stop wind
        cloth.windDir.set(0, 0, 0);
        console.log('wind dir:', cloth.windDir);
      }

      function onClickReplay() {
        cloth.reset();
      }
    },
  };
});
