// main.js

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
   2) Initialize Vanta.js Background with Optimized Performance
========================================= */

/* Initialize Vanta.js Fog once the DOM is loaded */
document.addEventListener("DOMContentLoaded", () => {
  VANTA.FOG({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    highlightColor: 0xBB86FC, // Soft Purple Highlights
    midtoneColor: 0x9b59b6,   // Amethyst
    lowlightColor: 0xbb86fc,  // Soft Purple
    baseColor: 0x1a1a2e,       // Darker Purple
    blurFactor: 0.8,
    speed: 1.5,
    zoom: 0.1
  });
});

/* =========================================
   3) GSAP Smooth Scroll for Navbar Links
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
   4) Minimal Scramble Function
========================================= */
// scrambleText() gradually reveals real letters from random characters
function scrambleText(text, container, durationMs) {
  return new Promise((resolve) => {
    const intervalTime = 25; // how fast we swap chars
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
   5) Title Cycle with Color Animation
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
   6) Hero Sequence Animation
========================================= */
async function initHeroAnimation() {
  const introHeading = document.querySelector(".intro-heading");
  const studentP = document.querySelector(".hero-text p");
  const exploreBtn = document.querySelector(".hero-text .btn");
  const musicPrompt = document.querySelector(".music-prompt");
  const musicPlayerSmall = document.getElementById("musicPlayerSmall");

  // Hide dynamicTitle, paragraph, button, and music player initially
  gsap.set(dynamicTitle, { opacity: 0 });
  gsap.set(studentP, { opacity: 0 });
  gsap.set(exploreBtn, { opacity: 0 });
  gsap.set(musicPrompt, { opacity: 0 });
  gsap.set(musicPlayerSmall, { opacity: 0 });

  // Animate the intro heading
  await scrambleText("Hello! I'm Daniel, and I Am a", introHeading, 2400);

  // Fade in the rotating title
  gsap.to(dynamicTitle, {
    duration: 0.4,
    opacity: 1,
    onComplete: () => {
      displayTitle();
      // Fade in music prompt
      gsap.to(musicPrompt, {
        duration: 0.5,
        opacity: 1,
        delay: 0.5,
        onComplete: () => {
          // Fade in music player
          gsap.to(musicPlayerSmall, {
            duration: 0.5,
            opacity: 1,
            delay: 0.3,
          });
          // Fade in paragraph
          gsap.to(studentP, {
            duration: 0.5,
            opacity: 1,
            delay: 0.8,
            onComplete: () => {
              // Fade in the button
              gsap.to(exploreBtn, {
                duration: 1,
                opacity: 1,
              });
            },
          });
        },
      });
    },
  });
}

// Once DOM is ready, start the hero animation
document.addEventListener("DOMContentLoaded", initHeroAnimation);

/* =========================================
   7) Music Player Logic - Small Version
========================================= */
const audioPlayerSmall = document.getElementById("audioPlayerSmall");
const progressBarSmall = document.getElementById("progressBarSmall");
const trackTitleSmall = document.getElementById("trackTitleSmall");
const trackArtistSmall = document.getElementById("trackArtistSmall");
const controlIconSmall = document.getElementById("controlIconSmall");
const playPauseBtnSmall = document.getElementById("playPauseBtnSmall");
const nextBtnSmall = document.getElementById("nextBtnSmall");
const prevBtnSmall = document.getElementById("prevBtnSmall");

/* Playlist of songs */
const playlist = [
  {
    src: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Daft-Punk-Instant-Crush.mp3",
    title: "Instant Crush",
    artist: "Daft Punk",
  },
  {
    src: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Harry-Styles-As-It-Was.mp3",
    title: "As It Was",
    artist: "Harry Styles",
  },
  {
    src: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Dua-Lipa-Physical.mp3",
    title: "Physical",
    artist: "Dua Lipa",
  },
];

let currentSongIndexSmall = 0;
let isPlayingSmall = false;

/* Load a specific track */
function loadTrackSmall(index) {
  audioPlayerSmall.src = playlist[index].src;
  trackTitleSmall.textContent = playlist[index].title;
  trackArtistSmall.textContent = playlist[index].artist;
  audioPlayerSmall.load();
  progressBarSmall.value = 0;
}

/* Toggle play/pause */
function togglePlayPauseSmall() {
  if (!isPlayingSmall) {
    audioPlayerSmall.play();
    controlIconSmall.classList.replace("fa-play", "fa-pause");
  } else {
    audioPlayerSmall.pause();
    controlIconSmall.classList.replace("fa-pause", "fa-play");
  }
  isPlayingSmall = !isPlayingSmall;
}

/* Update progress bar during playback */
audioPlayerSmall.addEventListener("timeupdate", () => {
  if (audioPlayerSmall.duration) {
    progressBarSmall.max = audioPlayerSmall.duration;
    progressBarSmall.value = audioPlayerSmall.currentTime;
  }
});

/* Seek to a specific time */
progressBarSmall.addEventListener("input", () => {
  audioPlayerSmall.currentTime = progressBarSmall.value;
});

/* Play the next track */
function nextTrackSmall() {
  currentSongIndexSmall = (currentSongIndexSmall + 1) % playlist.length;
  loadTrackSmall(currentSongIndexSmall);
  if (isPlayingSmall) audioPlayerSmall.play();
}

/* Play the previous track */
function prevTrackSmall() {
  currentSongIndexSmall = (currentSongIndexSmall - 1 + playlist.length) % playlist.length;
  loadTrackSmall(currentSongIndexSmall);
  if (isPlayingSmall) audioPlayerSmall.play();
}

/* Automatically play next track when current ends */
audioPlayerSmall.addEventListener("ended", nextTrackSmall);

/* Attach button event listeners */
playPauseBtnSmall.addEventListener("click", togglePlayPauseSmall);
nextBtnSmall.addEventListener("click", nextTrackSmall);
prevBtnSmall.addEventListener("click", prevTrackSmall);

/* Load the first track initially */
loadTrackSmall(currentSongIndexSmall);

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
window.addEventListener("scroll", () => {
  const navbar = document.querySelector("nav");
  if (window.scrollY > 50) { // Adjust scroll position as needed
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});