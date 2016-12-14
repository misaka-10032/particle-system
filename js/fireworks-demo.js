define(['jquery', 'underscore', 'three', 'stats', 'fireworks'],
       function($, _, THREE, Stats, fw) {
  return {
    init: function(config) {
      var div = $("#".concat(config.divId));
      var scene = new THREE.Scene();

      // camera
      var camera = new THREE.PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 1, 10000 );
      camera.position.set(0, 0, 250);
      scene.add(camera);

      // lights
      var aLight = new THREE.AmbientLight(0x666666);
      scene.add(aLight);

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

      // array of fireworks
      var fireworks = [new fw.Firework(null, config.texUrl)];
      scene.add(fireworks[0].sceneObject);

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

      // event listener
      window.addEventListener('resize', onWindowResize, false);
      window.addEventListener('click', onClick, false);

      // stats
      var stats = new Stats();
      stats.domElement.setAttribute("style",
        ["position: fixed; top: 0px; left: 0px; cursor: pointer;",
         "opacity: 0.9; z-index: 10000;"].join('\n'));
      div.append(stats.domElement);

      // begin animation!
      animate();

      function animate() {
        if (!fireworks.length)
          onClick({
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight,
          });

        // only keep those animated
        var animatedFireworks = [];
        _.each(fireworks, function(firework) {
          var animated = firework.animate();
          if (animated)
            animatedFireworks.push(firework);
          else
            scene.remove(firework.sceneObject);
        });
        fireworks = animatedFireworks;

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
        bg.scale.set(window.innerWidth, window.innerHeight, 1);
      }

      function onClick(e) {
        var pos = new THREE.Vector3(
            e.clientX / window.innerWidth * 2 - 1,
            -e.clientY / window.innerHeight * 2 + 1,
            0.5);
        pos.unproject(camera);
        pos.sub(camera.position).normalize();
        var dist = -camera.position.z / pos.z;
        pos = camera.position.clone().add(pos.multiplyScalar(dist));
        var firework = new fw.Firework(pos, config.texUrl);
        fireworks.push(firework);
        scene.add(firework.sceneObject);
        console.log('mouse:', e.clientX, e.clientY);
        console.log('world:', pos);
        console.log('#fireworks:', fireworks.length);
        console.log('#sceneObjects:', scene.children.length);
      }
    },
  };
});
