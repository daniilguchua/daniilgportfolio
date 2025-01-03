/* =========================================
   1) Initialize AOS (Scroll Animations)
========================================= */
AOS.init({
  duration: 1000, // Animation duration in milliseconds
  once: true, // Whether animation should happen only once - while scrolling down
  easing: 'ease-in-out', // Default easing for AOS animations
  offset: 100, // Offset (in px) from the original trigger point
  mirror: false, // Whether elements should animate out while scrolling past them
});

/* =========================================
   2) Initialize Vanta.js Background with Enhanced Shader Effects
========================================= */

/* Initialize Vanta.js Fog once the DOM is loaded */
document.addEventListener("DOMContentLoaded", () => {
  const vantaEffect = VANTA.FOG({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    highlightColor: 0x3f1791, // Soft Purple Highlights
    midtoneColor: 0x0,   // Amethyst
    lowlightColor: 0x0,  // Soft Purple
    baseColor: 0x0,       // Darker Purple (Darkened)
    blurFactor: 1.2,           // Increased blur for more depth
    speed: 1,                // Increased speed for dynamic movement
    zoom: 0.2,                 // Increased zoom for closer effect
    THREE: THREE               // Ensuring Three.js is utilized
  });
});

/* =========================================
   3) Particle.js Snow Effect Initialization
========================================= */

/* Initialize Particle.js Snow Effect */
document.addEventListener("DOMContentLoaded", () => {
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": 50, // Reduced number of snowflakes for a subtler effect
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": ["#BB86FC", "#9933FF", "#AA66CC"] // Shades of purple
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
      },
      "opacity": {
        "value": 0.6, // Slightly increased opacity for better visibility
        "random": true,
        "anim": {
          "enable": false,
        }
      },
      "size": {
        "value": 3,
        "random": true,
        "anim": {
          "enable": false,
        }
      },
      "line_linked": {
        "enable": false,
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "bottom",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "attract": {
          "enable": false,
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false,
        },
        "onclick": {
          "enable": false,
        },
        "resize": true
      }
    },
    "retina_detect": true
  });
});

/* =========================================
   4) GSAP Smooth Scroll for Navbar Links
========================================= */
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger, MotionPathPlugin);

/* Consolidated Smooth Scroll Listener */
document.querySelectorAll('a[data-link]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent default anchor behavior

    const targetId = this.getAttribute('href').substring(1); // Extract ID without '#'
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      const navbarHeight = document.querySelector('nav').offsetHeight; // Get navbar height
      const sectionRect = targetSection.getBoundingClientRect();
      const sectionTop = window.pageYOffset + sectionRect.top;
      const scrollToPosition = sectionTop - navbarHeight - 20; // 20px padding

      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: scrollToPosition,
          autoKill: false
        },
        ease: "power2.inOut"
      });
    }
  });
});

/* =========================================
   5) Minimal Scramble Function
========================================= */
// scrambleText() gradually reveals real letters from random characters
function scrambleText(text, container, durationMs) {
  return new Promise((resolve) => {
    const intervalTime = 50; // how fast we swap chars
    const totalSteps = durationMs / intervalTime;
    let currentStep = 0;

    container.textContent = "";
    const scrambleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:<>,.?/";

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / totalSteps;
      const revealCount = Math.floor(progress * text.length);

      // Real portion
      const realPart = text.slice(0, revealCount);

      // Scrambled remainder
      let scrambledPart = "";
      for (let i = revealCount; i < text.length; i++) {
        const ch = text[i];
        // Keep spaces/punctuation as-is
        if (ch === " " || /[.,!?]/.test(ch)) {
          scrambledPart += ch;
        } else {
          scrambledPart += scrambleChars[
            Math.floor(Math.random() * scrambleChars.length)
          ];
        }
      }

      container.textContent = realPart + scrambledPart;

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        container.textContent = text; 
        resolve(); 
      }
    }, intervalTime);
  });
}

/* =========================================
   6) Title Cycle with Color Animation
========================================= */
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Full-Stack Developer", "Cybersecurity Enthusiast"];

let currentIndex = 0;

// Displays the rotating title with color cycling
function displayTitle() {
  if (!dynamicTitle) return;
  dynamicTitle.innerHTML = "";

  const text = titles[currentIndex];
  const chars = text.split("");
  const spans = [];

  chars.forEach((char, i) => {
    if (char === " ") {
      dynamicTitle.appendChild(document.createTextNode(" "));
    } else {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.color = getRandomAccentColor();
      dynamicTitle.appendChild(span);
      spans.push(span);

      // Fade each char in
      gsap.from(span, {
        duration: 0.1,
        opacity: 0,
        ease: "power2.out",
        delay: i * 0.05,
      });

      // Color cycling 
      gsap.to(span, {
        duration: 1,
        color: getRandomAccentColor(),
        delay: i * 0.05,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  });

  // After 2s, scramble once
  gsap.delayedCall(2, () => textScramble(spans, 6, 0.8));
}

// This random scramble triggers after 2s, then calls nextTitle
function textScramble(spans, scrambleCount, duration) {
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
      nextTitle();
    }
  }, intervalTime);
}

// Move to next title in the array
function nextTitle() {
  currentIndex = (currentIndex + 1) % titles.length;
  displayTitle();
}

// Utility function to get a random accent color
function getRandomAccentColor() {
  const accents = ["#BB86FC", "#03DAC6", "#CF6679"]; // Soft Purple, Teal, Coral
  return accents[Math.floor(Math.random() * accents.length)];
}

/* =========================================
   7) Hero Sequence Animation
========================================= */
async function initHeroAnimation() {
  const introHeading = document.querySelector(".intro-heading");
  const studentP = document.querySelector(".hero-text p");
  const exploreBtn = document.querySelector(".hero-text .btn");
  const navbar = document.querySelector("nav");

  // Hide dynamicTitle, paragraph, button, and navbar initially
  gsap.set(dynamicTitle, { opacity: 0 });
  gsap.set(studentP, { opacity: 0 });
  gsap.set(exploreBtn, { opacity: 0 });
  gsap.set(navbar, { opacity: 0 });

  // Animate the intro heading
  await scrambleText("Hello! I'm Daniel, and I Am a", introHeading, 2400);

  // Fade in the rotating title
  gsap.to(dynamicTitle, {
    duration: 0.4,
    opacity: 1,
    onComplete: () => {
      displayTitle();
      // Fade in paragraph
      gsap.to(studentP, {
        duration: 0.5,
        opacity: 1,
        delay: 0.5,
        onComplete: () => {
          // Fade in the button and navbar simultaneously
          gsap.to([exploreBtn, navbar], {
            duration: 1,
            opacity: 1,
            stagger: 0.2, // Slight delay between them
          });
        },
      });
    },
  });
}

// Once DOM is ready, start the hero animation
document.addEventListener("DOMContentLoaded", initHeroAnimation);

/* =========================================
   8) Hamburger Menu for Mobile Navigation (Updated)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector("nav ul");

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const isActive = navLinks.classList.contains("active");
    hamburger.setAttribute("aria-expanded", isActive);
    if (isActive) {
      hamburger.innerHTML = '<i class="fa-solid fa-times"></i>';
    } else {
      hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });

  // Close the mobile menu when a link is clicked
  document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  });
});

/* =========================================
   9) Active Link Highlighting
========================================= */
const sections = document.querySelectorAll("section, header");
const navItems = document.querySelectorAll("nav ul li a");

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.6, // 60% of the section is visible
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => {
        link.classList.remove("active-link");
        if (link.getAttribute("href").substring(1) === entry.target.id) {
          link.classList.add("active-link");
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => {
  observer.observe(section);
});

/* =========================================
   10) Change Navbar Style on Scroll
========================================= */
/* Hide/Show Navbar on Scroll */
let lastScrollY = window.scrollY;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // Scrolling down
        navbar.classList.add("navbar-hidden");
    } else {
        // Scrolling up
        navbar.classList.remove("navbar-hidden");
    }
    lastScrollY = window.scrollY;
});

