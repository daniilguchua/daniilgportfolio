/**
 * Subtle Ambient GLSL Shader Background
 * Flowing color fog using layered simplex noise + domain warping.
 * Reacts gently to mouse position and scroll progress.
 */
(() => {
  'use strict';

  // ── Bail-out checks ──
  const isMobile = window.matchMedia('(max-width: 767px)').matches ||
    /Mobi|Android/i.test(navigator.userAgent);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReduced) {
    document.body.classList.add('no-webgl');
    return;
  }

  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;

  let gl = canvas.getContext('webgl2');
  if (!gl) gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  // ── State ──
  let scrollProgress = 0;
  let mouse = { x: 0.5, y: 0.5 };
  let smoothMouse = { x: 0.5, y: 0.5 };

  // ── Shaders ──
  const vertSrc = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision highp float;

    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform float uScroll;

    // --- Simplex 3D Noise (Ashima / webgl-noise, MIT) ---
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    // --- FBM (Fractional Brownian Motion) ---
    float fbm(vec3 p) {
      float val = 0.0;
      float amp = 0.5;
      float freq = 1.0;
      for (int i = 0; i < 5; i++) {
        val += amp * snoise(p * freq);
        amp *= 0.5;
        freq *= 2.0;
      }
      return val;
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);

      float t = uTime * 0.06; // very slow movement

      // Mouse influence (very subtle)
      vec2 mouseUv = vec2(uMouse.x * aspect, uMouse.y);
      float mouseDist = length(p - mouseUv);
      vec2 mouseOffset = (mouseUv - p) * smoothstep(0.8, 0.0, mouseDist) * 0.08;

      // Scroll shifts through noise space
      float scrollShift = uScroll * 2.0;

      // Domain warping (creates flowing organic patterns)
      vec3 seed = vec3(p + mouseOffset, t + scrollShift);

      vec3 q = vec3(
        fbm(seed + vec3(0.0, 0.0, 0.0)),
        fbm(seed + vec3(5.2, 1.3, 0.0)),
        0.0
      );

      vec3 r = vec3(
        fbm(seed + 3.0 * q + vec3(1.7, 9.2, t * 0.5)),
        fbm(seed + 3.0 * q + vec3(8.3, 2.8, t * 0.3)),
        0.0
      );

      float pattern = fbm(seed + 3.0 * r);

      // Color palette
      vec3 bg      = vec3(0.024, 0.024, 0.039);   // #06060a
      vec3 purple   = vec3(0.486, 0.227, 0.929);   // #7c3aed
      vec3 purpleLt = vec3(0.659, 0.333, 0.969);   // #a855f7
      vec3 green    = vec3(0.0, 1.0, 0.533);       // #00ff88
      vec3 greenDim = vec3(0.133, 0.773, 0.373);   // #22c55e

      // Map pattern to color (kept very dim — this is a background)
      vec3 color = bg;
      float f = pattern;

      // Subtle purple wash
      color = mix(color, purple * 0.3, smoothstep(-0.3, 0.3, f) * 0.4);
      // Green accents at peaks
      float greenMix = mix(0.3, 0.5, uScroll); // more green as you scroll
      color = mix(color, green * 0.25, smoothstep(0.1, 0.7, f) * greenMix);
      // Bright highlights (very faint)
      color += purpleLt * smoothstep(0.5, 0.9, f) * 0.06;
      color += green * smoothstep(0.6, 1.0, f) * 0.04;

      // Vignette — darken edges
      float vig = 1.0 - smoothstep(0.2, 0.9, length(vUv - 0.5) * 1.3);
      color *= mix(0.4, 1.0, vig);

      // Keep overall brightness low
      color = clamp(color, 0.0, 0.35);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ── Compile & link ──
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vertSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) { document.body.classList.add('no-webgl'); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(prog));
    document.body.classList.add('no-webgl');
    return;
  }

  // ── Geometry (full-screen quad) ──
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  var aPos = gl.getAttribLocation(prog, 'aPos');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uRes = gl.getUniformLocation(prog, 'uResolution');
  var uMouse = gl.getUniformLocation(prog, 'uMouse');
  var uScroll = gl.getUniformLocation(prog, 'uScroll');

  // ── Events ──
  window.addEventListener('scroll-progress', function(e) { scrollProgress = e.detail; });
  document.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1.0 - e.clientY / window.innerHeight;
  });

  // ── Render loop ──
  var dpr = Math.min(window.devicePixelRatio, 2);

  function render(now) {
    requestAnimationFrame(render);

    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var pw = w * dpr | 0;
    var ph = h * dpr | 0;

    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
      gl.viewport(0, 0, pw, ph);
    }

    // Smooth mouse (slow lerp for ambient feel)
    smoothMouse.x += (mouse.x - smoothMouse.x) * 0.03;
    smoothMouse.y += (mouse.y - smoothMouse.y) * 0.03;

    gl.useProgram(prog);
    gl.uniform1f(uTime, now * 0.001);
    gl.uniform2f(uRes, pw, ph);
    gl.uniform2f(uMouse, smoothMouse.x, smoothMouse.y);
    gl.uniform1f(uScroll, scrollProgress);

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimationFrame(render);
})();
