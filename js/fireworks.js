define(['underscore', 'three', 'ps'],
       function(_, THREE, ps) {

  // timestep in integration
  var TIMESTEP = 1e-1;

  // min/max init velocity
  var MIN_VEL = 10;
  var MAX_VEL = 20;
  // boost velocity in y
  var Y_VEL = 10;

  // alpha step for fading effect
  var ALPHA_STEP = 1e-3;

  // particle attributes
  var SIZE = 10;
  var TEXTURE = 'img/particle.png';
  var COLORS = [
    new THREE.Color(0.6, 0.6, 0.2),
  ];

  // vertex shader
  var VSHADER = [
    'uniform float size;',

    'void main() {',

    '  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',

    '  gl_PointSize = size * ( 300.0 / -mvPosition.z );',

    '  gl_Position = projectionMatrix * mvPosition;',

    '}',
  ].join('\n');

  // fragment shader
  var FSHADER = [
    'uniform vec3 color;',

    'uniform sampler2D texture;',

    'void main() {',

    '  gl_FragColor = vec4( color, 1.0 );',

    '  gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',

    '  if ( gl_FragColor.a < ALPHATEST ) discard;',

    '}',
  ].join('\n');

  /**
   * @brief Constructor of Firework
   * @param {THREE.Vector3} Init position.
   */
  function Firework(pos, nParticles) {
    this.pos = pos ? pos.clone() : new THREE.Vector3(0, 0, 0);
    this.nParticles = nParticles || 100;

    // particles
    this.particles = [];
    for (var i = 0; i < this.nParticles; i++) {
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

    // shader uniforms
    this.uniforms = {
      color: {
        type: 'c',
        value: COLORS[Math.floor(Math.random()*COLORS.length)],
      },
      texture: {
        type: 'uTex',
        value: new THREE.TextureLoader().load(TEXTURE),
      },
      size: {
        type: 'uFloat',
        value: SIZE,
      },
      alpha: {
        type: 'uFloat',
        value: 1,
      },
    };

    // material
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VSHADER,
      fragmentShader: FSHADER,
      transparent: true,
      alphaTest: 0.1,
    });

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
