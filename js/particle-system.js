define(['underscore', 'three'], function(_, THREE) {

  "use strict";

  /**
   * @brief Constructor of Particle
   * @param {Number} Mass of the particle; default as 10.
   * @param {THREE.Vector3} pos Position of the particle; default as origin.
   * @param {THREE.Vector3} vel Velocity; default as (0, 0, 0).
   * @param {THREE.Vector3} color Color of it; default as white.
   */
  function Particle(mass, pos, vel, color) {
    this.mass = mass || 10;
    this.pos = pos ? pos.clone() : new THREE.Vector3(0, 0, 0);
    this.posOld = this.pos.clone();
    this.vel = vel ? vel.clone() : new THREE.Vector3(0, 0, 0);
    this.velOld = this.vel.clone();
    this.color = color ? color.clone() : new THREE.Vector3(1, 1, 1);
    // acc will be maintained by the system
    this.acc = new THREE.Vector3(0, 0, 0);
    this.accOld = this.acc.clone();
  }

  _.extend(Particle.prototype, {
    // integrate the particle over a timestep with Symplectic Euler.
    integrate: function(dt) {
      this.velOld.copy(this.vel);
      this.posOld.copy(this.pos);
      // update vel via accOld
      this.vel.addScaledVector(this.accOld, dt);
      // update pos via vel
      this.pos.addScaledVector(this.vel, dt);
    },
  });

  /**
   * @brief Constructor of BiGroup, describing binary constraints.
   * @param {Particle} p1 Particle 1.
   * @param {particle} p2 Particle 2.
   * @param {Number} ks Spring constant; has default.
   * @param {Number} kd Damping constant; has default.
   */
  function BiGroup(p1, p2, ks, kd) {
    this.p1 = p1;
    this.p2 = p2;
    this.ks = ks || 5;
    this.kd = kd || 1e-2;
  }

  /**
   * @brief Constructor of ParticleSystem.
   * @param {Array<Particle>} particles Array of particles.
   * @param {THREE.Vector3} gravity Constant force field.
   * @param {Array<BiGroup>} biGroups Binary constraints.
   */
  function ParticleSystem(particles, gravity, biGroups) {
    this.particles = particles || [];
    this.gravity = gravity || new THREE.Vector3(0, -6.674, 0);
    this.biGroups = biGroups || [];
  }

  _.extend(ParticleSystem.prototype, {
    // integrate the system over a timestep via Symplectic Euler.
    integrate: function(dt) {

      // integrate all the particles first
      _.each(this.particles, function(p) {
        p.integrate(dt);
      }, this);

      // apply forces later
      // reset acc as gravity
      _.each(this.particles, function(p) {
        p.accOld.copy(p.acc);
        p.acc.copy(this.gravity);
      }, this);
      // TODO: apply unary forces
      // TODO: apply binary forces
    },
  });

  // export functions
  return {
    Particle: Particle,
    ParticleSystem: ParticleSystem,
  };
});
