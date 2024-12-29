/* main.js - Cleaned Up Version (No ES Modules, Just Plain JS) */

// Make sure AOS is initialized
AOS.init({
  duration: 1000,
  once: false,
});

// GSAP Animation for Navbar
const navbar = document.querySelector("#navbar");
gsap.from(navbar, {
  duration: 1,
  y: -70,
  opacity: 0,
  ease: "power2.out",
});

// Smooth Scrolling for Nav Links
document.querySelectorAll("[data-link]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSelector = e.currentTarget.getAttribute("href");
    const target = document.querySelector(targetSelector);
    if (target) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: target.offsetTop - 60 },
        ease: "power2.inOut",
      });
    }
  });
});

/* =========================================
   Dynamic Title Cycle with Scramble Effect
========================================= */
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Computer Scientist", "Security Enthusiast"];
const letterColors = ["#80d8f7", "#f8a7c1", "#c69ef5", "#fcb58a", "#d7f28c"];
let currentIndex = 0;

/**
 * Displays the current title with letter-by-letter animations.
 */
function displayTitle() {
  if (!dynamicTitle) return;

  dynamicTitle.innerHTML = "";
  const text = titles[currentIndex];
  const characters = text.split("");
  const spans = [];

  characters.forEach((char, index) => {
    if (char === " ") {
      dynamicTitle.appendChild(document.createTextNode(" "));
    } else {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.color = letterColors[index % letterColors.length];
      dynamicTitle.appendChild(span);
      spans.push(span);

      // Fade/slide each letter in
      gsap.from(span, {
        duration: 0.1,
        y: -20,
        opacity: 0,
        ease: "power2.out",
        delay: index * 0.05,
      });

      // Mild color pulsing
      gsap.to(span, {
        duration: 0.6,
        color: letterColors[(index + 1) % letterColors.length],
        delay: index * 0.05,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  });

  // Run scramble after the letters appear
  gsap.delayedCall(2, () => {
    textScrambleEffect(spans, 6, 0.8);
  });
}

/**
 * Scramble effect on each letter, then move on.
 */
function textScrambleEffect(spans, scrambleCount = 8, duration = 0.8) {
  const chars = "!<>-_\\/[]{}—=+*^?#@&$%";
  let iteration = 0;
  const intervalTime = (duration / scrambleCount) * 1000;

  const interval = setInterval(() => {
    if (iteration < scrambleCount) {
      spans.forEach((span) => {
        if (span.textContent.trim() !== "") {
          const randomChar = chars[Math.floor(Math.random() * chars.length)];
          span.textContent = randomChar;
        }
      });
      iteration++;
    } else {
      clearInterval(interval);
      transitionToNextTitle();
    }
  }, intervalTime);
}

/**
 * Transition to the next title.
 */
function transitionToNextTitle() {
  gsap.to(dynamicTitle, {
    duration: 0,
    opacity: 0,
    onComplete: () => {
      dynamicTitle.style.opacity = "1";
      currentIndex = (currentIndex + 1) % titles.length;
      displayTitle();
    },
  });
}

// Initialize the text cycle
displayTitle();

/* =========================================
   Initialize Vanta WAVES background
========================================= */
window.addEventListener('DOMContentLoaded', () => {
  VANTA.WAVES({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x70714,
    shininess: 100.00,
    waveHeight: 19.50,
    waveSpeed: 0.5,
    zoom: 0.7
  });

  initThreeJS(); // 3D text
});

/* =========================================
   Three.js 3D Text Setup
========================================= */
function initThreeJS() {
  // Create a canvas for Three.js
  const canvas = document.createElement('canvas');
  canvas.id = 'three-canvas';
  // Position/size it absolutely behind hero content
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  document.querySelector('.hero').appendChild(canvas);

  // Set up renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Scene + Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Load font & create 3D text
  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const geometry = new THREE.TextGeometry('Daniil', {
      font: font,
      size: 1,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    geometry.center();

    const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
    const textMesh = new THREE.Mesh(geometry, material);
    scene.add(textMesh);

    // Rotate 360 deg (2π rad) continuously
    gsap.to(textMesh.rotation, {
      y: "+=6.28319",
      duration: 10,
      repeat: -1,
      ease: "linear",
    });

    // Slight pulsing scale
    gsap.to(textMesh.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  });

  // Handle window resizing
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}
