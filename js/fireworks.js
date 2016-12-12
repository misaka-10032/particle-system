define(['underscore', 'three', 'ps'],
       function(_, THREE, ps) {

  // timestep in integration
  var TIMESTEP = 1e-1;

  // min/max init velocity
  var MIN_VEL = 10;
  var MAX_VEL = 20;
  // boost velocity in y
  var Y_VEL = 10;

  /**
   * @brief Constructor of Firework
   * @param {THREE.Vector3} Init position.
   */
  function Firework(pos, nParticles) {
    this.pos = pos ? pos.clone() : new THREE.Vector3(0, 0, 0);
    this.nParticles = nParticles || 100;

    // particles
    this.particles = [];
    for (i = 0; i < this.nParticles; i++) {
      var particle = new ps.Particle(this.pos, null,
        randv3(MIN_VEL, MAX_VEL), null);
      this.particles.push(particle);
    }
    this.particleSystem = new ps.ParticleSystem(this.particles);

    // geometry
    this.geometry = new THREE.Geometry();
    _.each(this.particles, function(p) {
      this.geometry.vertices.push(p.pos);
    }, this);

    // material
    var texLoader = new THREE.TextureLoader();
    var texFirework = texLoader.load("img/particle.png");
    this.material = new THREE.PointsMaterial({
      size: 10,
      map: texFirework,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });
    this.material.color.setHSL(0.2, 0.2, 0.5);

    // scene object
    this.sceneObject = new THREE.Points(this.geometry, this.material);
  }

  _.extend(Firework.prototype, {
    // update the scene object
    animate: function() {
      this.particleSystem.integrate(TIMESTEP);
      this.geometry.verticesNeedUpdate = true;
    },
  }, this);

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

  return {
    Firework: Firework,
  };
});
