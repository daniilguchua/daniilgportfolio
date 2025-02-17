/* MAIN.JS */

// Global responsive check
const isMobile = window.innerWidth < 768;

/*
 * AOS Initialization
 */
AOS.init({
  duration: 1000,
  once: true,
  easing: 'ease-in-out',
  offset: 100,
  mirror: false,
});

/*
  Vanta.js Fog Initialization with responsive adjustments
*/
document.addEventListener("DOMContentLoaded", () => {
  VANTA.FOG({
    el: "#vanta-bg",
    mouseControls: !isMobile, // Disable mouse controls on mobile
    touchControls: true,
    gyroControls: false,
    highlightColor: 0x3f1791,
    midtoneColor: 0x0,
    lowlightColor: 0x0,
    baseColor: 0x0,
    blurFactor: isMobile ? 1.0 : 1.2, // Adjust blur factor based on device
    speed: isMobile ? 0.8 : 1,         // Lower speed on mobile for smoother performance
    zoom: isMobile ? 0.3 : 0.2,        // Adjust zoom based on device
    THREE: THREE,
  });
});

/*
  Particles.js with responsive particle count
*/
document.addEventListener("DOMContentLoaded", () => {
  // Use fewer particles on mobile devices for better performance
  const particleCount = isMobile ? 30 : 50;
  
  particlesJS("particles-js", {
    "particles": {
      "number": {
        "value": particleCount,
        "density": { "enable": true, "value_area": 800 }
      },
      "color": {
        "value": ["#BB86FC", "#9933FF", "#AA66CC"]
      },
      "shape": {
        "type": "circle",
        "stroke": { "width": 0, "color": "#000000" }
      },
      "opacity": {
        "value": 0.6,
        "random": true
      },
      "size": {
        "value": 3,
        "random": true
      },
      "line_linked": { "enable": false },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "bottom",
        "out_mode": "out"
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": false },
        "onclick": { "enable": false },
        "resize": true
      }
    },
    "retina_detect": true
  });
});

/*
  GSAP Smooth Scroll for Navbar Links
*/
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger, MotionPathPlugin);

document.querySelectorAll('a[data-link]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const sectionRect = targetSection.getBoundingClientRect();
      const sectionTop = window.pageYOffset + sectionRect.top;
      // Optionally, you can adjust scroll duration based on device:
      const duration = isMobile ? 0.8 : 1;
      const scrollToPosition = sectionTop - navbarHeight - 20;

      gsap.to(window, {
        duration: duration,
        scrollTo: { y: scrollToPosition, autoKill: false },
        ease: "power2.inOut"
      });
    }
  });
});

/*
  Hero Text Scramble & Rotating Title
*/
function scrambleText(text, container, durationMs) {
  return new Promise(resolve => {
    const intervalTime = 50;
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

      // Scrambled portion
      let scrambledPart = "";
      for (let i = revealCount; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || /[.,!?]/.test(ch)) {
          scrambledPart += ch;
        } else {
          scrambledPart += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
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

// Titles rotating through
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Full-Stack Developer", "ML Engineer"];
let currentIndex = 0;

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

      // Fade each character in
      gsap.from(span, {
        duration: 0.1,
        opacity: 0,
        ease: "power2.out",
        delay: i * 0.05,
      });

      // Subtle color cycling
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

  // After 2s, scramble once, then go to next title
  gsap.delayedCall(2, () => textScramble(spans, 6, 0.8));
}

// This mini scramble leads to the next title
function textScramble(spans, scrambleCount, duration) {
  const chars = "!<>-_\\/[]{}—=+*^?#@&$%";
  let iteration = 0;
  const intervalTime = (duration / scrambleCount) * 1000;

  const interval = setInterval(() => {
    if (iteration < scrambleCount) {
      spans.forEach(span => {
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

function nextTitle() {
  currentIndex = (currentIndex + 1) % titles.length;
  displayTitle();
}

// Accent colors for the rotating characters
function getRandomAccentColor() {
  const accents = ["#3A0CA3", "#7209B7", "#B5179E", "#F72585"];
  return accents[Math.floor(Math.random() * accents.length)];
}

/*
  Hero Animation Sequence
*/
async function initHeroAnimation() {
  const introHeading = document.querySelector(".intro-heading");
  const studentP = document.querySelector(".hero-text p");
  const exploreBtn = document.querySelector(".hero-text .shiny-cta");
  const navbar = document.querySelector("nav");

  // Hide dynamicTitle, paragraph, button, navbar initially
  gsap.set(dynamicTitle, { opacity: 0 });
  gsap.set(studentP, { opacity: 0 });
  gsap.set(exploreBtn, { opacity: 0 });
  gsap.set(navbar, { opacity: 0 });

  // Start scramble on the heading
  await scrambleText("Hello! I'm Daniil, an Aspiring", introHeading, 2400);

  // Fade in dynamicTitle
  gsap.to(dynamicTitle, {
    duration: 0.4,
    opacity: 1,
    onComplete: () => {
      displayTitle(); // Start rotating titles
      // Fade in paragraph
      gsap.to(studentP, {
        duration: 0.5,
        opacity: 1,
        delay: 0.5,
        onComplete: () => {
          // Fade in button and navbar
          gsap.to([exploreBtn, navbar], {
            duration: 1,
            opacity: 1,
            stagger: 0.2,
            onComplete: () => {
              startDriftingStars();
            }
          });
        },
      });
    },
  });
}

document.addEventListener("DOMContentLoaded", initHeroAnimation);

/*
  Hamburger Menu for Mobile
*/
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector("nav ul");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const isActive = navLinks.classList.contains("active");
      hamburger.setAttribute("aria-expanded", isActive);
      hamburger.innerHTML = isActive
        ? '<i class="fa-solid fa-times"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  });
});

/*
  Active Link Highlighting with responsive threshold
*/
const sections = document.querySelectorAll("section, header");
const navItems = document.querySelectorAll("nav ul li a");

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: isMobile ? 0.4 : 0.6,
};

const observer = new IntersectionObserver(entries => {
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

sections.forEach(section => observer.observe(section));

/*
  Hide/Show Navbar on Scroll
*/
let lastScrollY = window.scrollY;
const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    navbar.classList.add("navbar-hidden");
  } else {
    navbar.classList.remove("navbar-hidden");
  }
  lastScrollY = window.scrollY;
});

/*
  Swiper Initialization with responsive settings
*/
document.addEventListener("DOMContentLoaded", function () {
  const aboutSwiper = new Swiper(".about-swiper", {
    loop: true,
    speed: 1200,
    effect: "cube",
    cubeEffect: {
      shadow: false,
      shadowOffset: 0,
      shadowScale: 0,
      slideShadows: false,
    },
    initialSlide: 1,
    navigation: {
      nextEl: ".swiper-button-next.simple-swiper-btn",
      prevEl: ".swiper-button-prev.simple-swiper-btn",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    // On mobile, force one slide view
    slidesPerView: isMobile ? 1 : "auto",
    on: {
      slideChangeTransitionStart: function (swiper) {
        const currentSlide = swiper.slides[swiper.activeIndex];
        const aboutContent = currentSlide.querySelector(".about-slide-content");
        gsap.fromTo(
          aboutContent,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
        );
      },
    },
  });
});

