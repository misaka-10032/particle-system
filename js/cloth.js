define(['underscore', 'three', 'ps'],
       function(_, THREE, ps) {

  // timestep in integration
  var TIMESTEP = 1e-1;

  // texture of cloth
  var TEXTURE = 'img/cloth1.jpg';
  //var TEXTURE = 'img/cloth2.png';
  //var TEXTURE = 'img/cloth3.png';

  // vertex shader
  var VSHADER = [
    // TODO
  ].join('\n');

  // fragment shader
  var FSHADER = [
    // TODO
  ].join('\n');

  /**
   * @brief Constructor of Cloth
   * @param {Number} w Width of cloth.
   * @param {Number} h Height of cloth.
   * @param {Number} nx Number of segments in x axis.
   * @param {Number} ny Number of segments in y axis.
   */
  function Cloth(w, h, nx, ny) {
    this.w = w || 250;
    this.h = h || 250;
    this.nx = nx || 10;
    this.ny = ny || 10;
    this.segX = this.w / this.nx;
    this.segY = this.h / this.ny;
    this.pos = new THREE.Vector3(0, 0, 0);
    this.sceneObjects = [];

    /**** cloth ****/

    // hang the cloth upside down
    this.funCloth = function(u, v) {
      var x = (u - 0.5) * this.w;
      var y = this.h * 0.5 + v * this.h / Math.sqrt(2);
      var z = v * this.h / Math.sqrt(2);
      return new THREE.Vector3(x, y, z);
    };

    this.geoCloth = new THREE.ParametricGeometry(
      this.funCloth, this.nx, this.ny);
    this.geoCloth.dynamic = true;
    this.texCloth = new THREE.TextureLoader().load(TEXTURE);
    this.texCloth.warpS = this.texCloth.warpT = THREE.RepeatWrapping;
    this.texCloth.anisotropy = 16;

    this.matCloth = new THREE.MeshPhongMaterial({
      specular: 0x030303,
      map: this.texCloth,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
    });

    this.objCloth = new THREE.Mesh(this.geoCloth, this.matCloth);
    this.objCloth.position.copy(this.pos);
    // TODO: cast shadow
    this.sceneObjects.push(this.objCloth);

    /**** poles ****/

    this.geoPole = new THREE.BoxGeometry(5, this.h * 1.5, 5);
    this.matPole = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x111111,
      shininess: 100,
    });

    this.objPole1 = new THREE.Mesh(this.geoPole, this.matPole);
    this.objPole1.position.set(-this.w/2, -this.h/4, 0);
    // TODO: cast shadow
    this.sceneObjects.push(this.objPole1);

    this.objPole2 = new THREE.Mesh(this.geoPole, this.matPole);
    this.objPole2.position.set(+this.w/2, -this.h/4, 0);
    // TODO: cast shadow
    this.sceneObjects.push(this.objPole2);

    /**** particles ****/

    this.particleIdx = function(xi, yi) {
      return xi + yi * (this.nx + 1);
    };

    var i, j, k;
    var xi, yi, xj, yj;

    this.pins = [];
    for (xi = 0; xi <= this.nx; xi++)
      this.pins.push(xi);

    this.particles = [];
    for (yi = 0; yi <= this.ny; yi++) {
      for (xi = 0; xi <= this.nx; xi++) {
        var particle = new ps.Particle(null,
          this.funCloth(xi/this.nx, yi/this.ny));
        this.particles.push(particle);
      }
    }

    var biGroup;
    this.biGroups = [];

    // internel constraints like
    //
    //          /_
    //         |\
    //
    var p1, p2, rest;

    var dx = [1, 1, 1, 0];
    var dy = [-1, 0, 1, 1];

    //var dx = [1, 0];
    //var dy = [0, 1];

    var nd = dx.length;
    for (yi = 0; yi <= this.ny; yi++) {
      for (xi = 0; xi <= this.nx; xi++) {
        for (k = 0; k < nd; k++) {
          xj = xi + dx[k];
          yj = yi + dy[k];
          if (xj > this.nx || yj < 0 || yj > this.ny)
            continue;
          i = this.particleIdx(xi, yi);
          j = this.particleIdx(xj, yj);
          p1 = this.particles[i];
          p2 = this.particles[j];
          rest = new THREE.Vector3().subVectors(p1.pos, p2.pos).length();
          biGroup = new ps.BiGroup(p1, p2, rest);
          this.biGroups.push(biGroup);
        }
      }
    }

    // edge constraints
    for (xi = 0; xi <= this.nx-2; xi++) {
      yi = yj = 0;
      xj = xi + 2;
      i = this.particleIdx(xi, yi);
      j = this.particleIdx(xj, yj);
      p1 = this.particles[i];
      p2 = this.particles[j];
      rest = new THREE.Vector3().subVectors(p1.pos, p2.pos).length();
      biGroup = new ps.BiGroup(p1, p2, rest);
      this.biGroups.push(biGroup);

      yi = yj = this.ny;
      i = this.particleIdx(xi, yi);
      j = this.particleIdx(xj, yj);
      p1 = this.particles[i];
      p2 = this.particles[j];
      rest = new THREE.Vector3().subVectors(p1.pos, p2.pos).length();
      biGroup = new ps.BiGroup(p1, p2, rest);
      this.biGroups.push(biGroup);
    }

    for (yi = 0; yi <= this.ny-2; yi++) {
      xi = xj = 0;
      yj = yi + 2;
      i = this.particleIdx(xi, yi);
      j = this.particleIdx(xj, yj);
      p1 = this.particles[i];
      p2 = this.particles[j];
      rest = new THREE.Vector3().subVectors(p1.pos, p2.pos).length();
      biGroup = new ps.BiGroup(p1, p2, rest);
      this.biGroups.push(biGroup);

      xi = xj = this.nx;
      i = this.particleIdx(xi, yi);
      j = this.particleIdx(xj, yj);
      p1 = this.particles[i];
      p2 = this.particles[j];
      rest = new THREE.Vector3().subVectors(p1.pos, p2.pos).length();
      biGroup = new ps.BiGroup(p1, p2, rest);
      this.biGroups.push(biGroup);
    }

    this.particleSystem = new ps.ParticleSystem(this.particles, null, this.biGroups);
  }

  _.extend(Cloth.prototype, {
    // update the scene object
    animate: function() {

      // integrate
      this.particleSystem.integrate(TIMESTEP);

      // pin
      _.each(this.pins, function(idx) {
        this.particles[idx].pos.copy(this.particles[idx].posOld);
        this.particles[idx].vel.set(0, 0, 0);
      }, this);

      // update vertices
      var i;
      for (i = 0; i < this.particles.length; i++) {
        this.geoCloth.vertices[i].copy(this.particles[i].pos);
      }
      this.geoCloth.verticesNeedUpdate = true;

      return true;
    },
  }, this);

  return {
    Cloth: Cloth,
  };
});
