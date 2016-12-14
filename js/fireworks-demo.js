define(['jquery', 'underscore', 'three', 'stats', 'fireworks'],
       function($, _, THREE, Stats, fw) {
  return {
    init: function(config) {

      var divParent = $("#".concat(config.divId));
      var div = $("<div>", {style: "position:relative;"});
      divParent.append(div);

      var canvasWidth = div.width();
      var canvasAspect = 4/3;
      var canvasHeight = canvasWidth / canvasAspect;

      var scene = new THREE.Scene();

      // camera
      var camera = new THREE.PerspectiveCamera(
        45, canvasAspect, 1, 10000 );
      camera.position.set(0, 0, 250);
      scene.add(camera);

      // lights
      var aLight = new THREE.AmbientLight(0x666666);
      scene.add(aLight);

      // background plane for the trail
      var bg = new THREE.Mesh(
        new THREE.PlaneGeometry(canvasWidth, canvasHeight),
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
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0.2);
      renderer.autoClearColor = false;
      div.append(renderer.domElement);

      // stats
      var stats = new Stats();
      stats.domElement.setAttribute("style",
        ["position: absolute; top: 0px; left: 0px; cursor: pointer;",
         "opacity: 0.9; z-index: 10000;"].join('\n'));
      div.append(stats.domElement);

      // begin animation!
      animate();

      function animate() {
        if (!fireworks.length) {
          explodeAt(Math.random() * canvasWidth,
                    Math.random() * canvasHeight);
        }

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

      // onWindowResize
      $(window).resize(function() {
        canvasWidth = div.width();
        canvasHeight = canvasWidth / canvasAspect;
        renderer.setSize(canvasWidth, canvasHeight);
        bg.scale.set(canvasWidth, canvasHeight, 1);
      });

      function screenToWorld(x, y) {
        var pos = new THREE.Vector3(
             x / canvasWidth * 2 - 1,
            -y / canvasHeight * 2 + 1,
            0.5);
        pos.unproject(camera);
        pos.sub(camera.position).normalize();
        var dist = -camera.position.z / pos.z;
        pos = camera.position.clone().add(pos.multiplyScalar(dist));
        return pos;
      }

      function explodeAt(x, y) {
        var pos = screenToWorld(x, y);
        var firework = new fw.Firework(pos, config.texUrl);
        fireworks.push(firework);
        scene.add(firework.sceneObject);
      }

      // onDivClick
      div.click(function(e) {
        var x = e.pageX - $(this).offset().left;
        var y = e.pageY - $(this).offset().top;
        console.log('mouse click');
        console.log('mouse:', x, y);
        console.log('world:', screenToWorld(x, y));
        explodeAt(x, y);
      });
    },
  };
});
