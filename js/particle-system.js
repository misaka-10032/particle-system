define(['underscore', 'three'], function(_, THREE) {

  "use strict";

  /**
   * @brief Constructor of Particle
   * @param {Number} Mass of the particle; default as 10.
   * @param {THREE.Vector3} pos Position of the particle; default as origin.
   * @param {THREE.Vector3} vel Velocity; default as (0, 0, 0).
   *
   * Vectors will be copied into the object.
   */
  function Particle(mass, pos, vel) {
    this.mass = mass || 10;
    this.pos = pos ? pos.clone() : new THREE.Vector3(0, 0, 0);
    this.posOld = this.pos.clone();
    this.vel = vel ? vel.clone() : new THREE.Vector3(0, 0, 0);
    this.velOld = this.vel.clone();
    // acc will be maintained by the system
    this.acc = new THREE.Vector3(0, 0, 0);
    this.accOld = this.acc.clone();
  }

  _.extend(Particle.prototype, {
    // integrate the particle over a timestep with Forward Euler.
    integrate: function(dt) {
      // keep track of old stuff
      this.velOld.copy(this.vel);
      this.posOld.copy(this.pos);
      // update vel via accOld
      this.vel.addScaledVector(this.acc, dt);
      // update pos via vel
      this.pos.addScaledVector(this.vel, dt);
    },
  });

  /**
   * @brief Constructor of BiGroup, describing binary constraints.
   * @param {Particle} p1 Particle 1.
   * @param {particle} p2 Particle 2.
   * @param {Number} r Rest length.
   * @param {Number} ks Spring constant; has default.
   * @param {Number} kd Damping constant; has default.
   */
  function BiGroup(p1, p2, r, ks, kd) {
    this.p1 = p1;
    this.p2 = p2;
    this.r  = r ;
    this.ks = ks || 100;
    this.kd = kd || 10;
  }

  /**
   * @brief Constructor of ParticleSystem.
   * @param {Array<Particle>} particles Array of particles.
   * @param {THREE.Vector3} gravity Constant force field.
   * @param {Number} kd Viscous drag coefficient.
   * @param {Array<BiGroup>} biGroups Binary constraints.
   */
  function ParticleSystem(particles, gravity, kd, biGroups) {
    this.particles = particles || [];
    this.gravity = gravity || new THREE.Vector3(0, -6.674, 0);
    this.kd = kd || 0.5;
    this.biGroups = biGroups || [];
  }

  _.extend(ParticleSystem.prototype, {

    // integrate the system over a timestep via Forward Euler.
    integrate: function(dt) {

      // reset acc as gravity
      _.each(this.particles, function(p) {
        p.accOld.copy(p.acc);
        p.acc.copy(this.gravity);
      }, this);

      // apply viscous drags
      _.each(this.particles, function(p) {
        var f = new THREE.Vector3().addScaledVector(p.vel, -this.kd);
        p.acc.addScaledVector(f, 1/p.mass);
      }, this);

      // apply binary forces
      _.each(this.biGroups, function(biGroup) {
        var p1 = biGroup.p1;
        var p2 = biGroup.p2;
        var lp = new THREE.Vector3().subVectors(p1.pos, p2.pos);
        var lv = new THREE.Vector3().subVectors(p1.vel, p2.vel);
        var f1 = biGroup.ks * (lp.length() - biGroup.r);
        var f2 = biGroup.kd * lp.dot(lv) / lp.length();
        var fb = lp.clone().normalize().multiplyScalar(f1+f2);
        var fa = fb.clone().multiplyScalar(-1);
        p1.acc.addScaledVector(fa, 1/p1.mass);
        p2.acc.addScaledVector(fb, 1/p2.mass);
      }, this);

      // integrate all the particles
      _.each(this.particles, function(p) {
        p.integrate(dt);
      }, this);
    },
  });

  // export functions
  return {
    Particle: Particle,
    BiGroup: BiGroup,
    ParticleSystem: ParticleSystem,
  };
});
