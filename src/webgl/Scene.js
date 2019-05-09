/* eslint-disable prefer-const */
import {
  OBJLoader,
} from './loaders';
import {
  OrbitControls,
} from './controls';
import RendererComposer from './postprocessing';

class Scene {
  constructor(canvas) {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    const ratio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, ratio, 0.01, 1000);
    this.renderer = new RendererComposer({
      scene: this.scene,
      camera: this.camera,
      canvas,
    });
    this.objLoader = new OBJLoader();
    this.orbitControl = new OrbitControls(this.camera);
    this.orbitControl.enabled = false;
    // this.orbitControl.autoRotate = true;
    this.orbitControl.autoRotateSpeed = 0.25;

    this.initLight();
    this.initClock();
    this.main();
  }

  initClock() {
    this.time = 0;
    this.clock = new THREE.Clock();
  }

  initLight() {
    this.light = new THREE.PointLight();
    this.light.position.set(2, 2, 2);
    this.scene.add(this.light);
  }

  main() {
    // this.cube = new THREE.Mesh(new THREE.CubeGeometry(), new THREE.MeshPhongMaterial({
    //   color: 0xFF0000,
    // }));
    // this.scene.add(this.cube);
    this.initParticles();
    // this.camera.position.z = 1;
    // this.camera.position.y = 0.1;
    // this.camera.position.set(0, 0, 0.6);
    this.camera.position.set(0,0.1,0.5)
    this.loop();
  }

  initParticles() {
    this.particles = new Particles();
    this.particles.rotation.y = THREE.Math.degToRad(45);
    this.scene.add(this.particles);
  }

  loop() {
    this.orbitControl.update();
    this.time = this.time + (this.clock.getDelta() / 10.0);
    this.particles.update(this.time);
    requestAnimationFrame(this.loop.bind(this));
    this.renderer.render();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

class Particles extends THREE.Object3D {
  constructor() {
    super();
    this.side = 400;
    this.init();
  }

  init() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, this.side, this.side);
    this.geometry.addAttribute(
      'origin',
      new THREE.BufferAttribute(
        getPlane((this.side + 1) * (this.side + 1), 1),
        3,
      ),
    );


    this.uniforms = {
      time: {
        type: 'f',
        value: 0.0,
      },
      pointSize: {
        type: 'f',
        value: 1,
      },
      big: {
        type: 'v3',
        value: new THREE.Vector3(0, 0, 255).multiplyScalar(1 / 0xff),
      },
      small: {
        type: 'v3',
        value: new THREE.Vector3(0, 0, 255).multiplyScalar(1 / 0xff),
      },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: `
        //Simplex 3D Noise
        //by Ian McEwan, Ashima Arts
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

        // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          //  x0 = x0 - 0. + 0.0 * C
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

        // Permutations
          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        // Gradients
        // ( N*N points uniformly over a square, mapped onto an octahedron.)
          float n_ = 1.0/7.0; // N=7
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

        //Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

        // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        uniform float time;
        varying float noise;
        attribute vec3 origin;
        uniform float pointSize;
        varying float size;

        void main() {

          noise = snoise(vec3(origin.x,time,origin.z));
          vec3 newPosition = vec3(origin.x,noise*0.1,origin.z);

          //Point size - snoise
          gl_PointSize = size = pointSize;
          if( position.y > 0.46 ) {
            gl_PointSize = size = 2.1;
          }
          gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 small;
        uniform vec3 big;
        varying float size;
        varying float noise;

        void main() {
          gl_FragColor = vec4( small, 1. );

          if( size > 2.0 )
          {
             gl_FragColor = vec4( big * vec3( 1. - length( gl_PointCoord.xy-vec2(.5) ) ) * 1.5, 1. );
          }
        }
      `,
    });
    this.particles = new THREE.Points(this.geometry, this.material);

    this.add(this.particles);
  }

  update(t) {
    this.uniforms.time.value = t;
  }
}

function getPoint(v) {
  v.x = Math.random() * 2 - 1;
  v.y = 0;
  v.z = Math.random() * 2 - 1;
  return v;
}

function getPlane(count) {
  let len = count * 3;
  let data = new Float32Array(len);
  let p = new THREE.Vector3();
  for (let i = 0; i < len; i += 3) {
    getPoint(p);
    data[i] = p.x;
    data[i + 1] = p.y;
    data[i + 2] = p.z;
  }
  return data;
}

export default Scene;
