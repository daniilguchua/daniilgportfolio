/* main.js */

/* =========================================
   1) AOS (Scroll Animations)
========================================= */
AOS.init({
  duration: 1000,
  once: false,
});

/* =========================================
   2) GSAP: fade-in navbar
========================================= */
gsap.from("#navbar", {
  duration: 1,
  y: -70,
  opacity: 0,
  ease: "power2.out",
});

/* Smooth-scrolling for nav links */
document.querySelectorAll("[data-link]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSelector = link.getAttribute("href");
    const targetElem = document.querySelector(targetSelector);
    if (targetElem) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: targetElem.offsetTop - 60 },
        ease: "power2.inOut",
      });
    }
  });
});

/* =========================================
   3) Minimal Scramble Function
========================================= */
function scrambleText(text, container, durationMs) {
  return new Promise((resolve) => {
    const intervalTime = 25;
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
        container.textContent = text; // finalize
        resolve();
      }
    }, intervalTime);
  });
}

/* =========================================
   4) Title cycle with color animation
========================================= */
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Computer Scientist", "Security Enthusiast"];

const letterColors = [
  "#80d8f7",
  "#f8a7c1",
  "#c69ef5",
  "#fcb58a",
  "#d7f28c",
];

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
      span.style.color = letterColors[i % letterColors.length];
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
        duration: 0.6,
        color: letterColors[(i + 1) % letterColors.length],
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

// Scramble for rotating titles
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

function nextTitle() {
  currentIndex = (currentIndex + 1) % titles.length;
  displayTitle();
}

/* =========================================
   5) Hero Sequence
========================================= */
async function initHeroAnimation() {
  const introHeading = document.querySelector(".intro-heading");
  const studentP = document.querySelector(".hero-text p");
  const seeMyWorkBtn = document.querySelector(".hero-text .btn");

  // Hide dynamicTitle, paragraph, button
  gsap.set(dynamicTitle, { opacity: 0 });
  gsap.set(studentP, { opacity: 0 });
  gsap.set(seeMyWorkBtn, { opacity: 0 });

  // Force heading invisible on load to prevent flash
  gsap.set(introHeading, { opacity: 0 });
  introHeading.textContent = "";

  // 1) Show heading, scramble
  gsap.set(introHeading, { opacity: 1 });
  await scrambleText("Hi! My Name Is Daniil! And I Am A", introHeading, 2400);

  // 2) After scramble, short wait → fade in #dynamicTitle
  setTimeout(() => {
    gsap.to(dynamicTitle, {
      duration: 0.4,
      opacity: 1,
      onComplete: () => {
        displayTitle();
        // Fade in paragraph
        gsap.to(studentP, {
          duration: 0.5,
          opacity: 1,
          delay: 0.8,
          onComplete: () => {
            // Finally fade in the button
            gsap.to(seeMyWorkBtn, {
              duration: 1,
              opacity: 1,
            });
          },
        });
      },
    });
  }, 500);
}

// Kick off once DOM loads
document.addEventListener("DOMContentLoaded", initHeroAnimation);

/* =========================================
   6) Vanta Waves (Background)
========================================= */
window.addEventListener("DOMContentLoaded", () => {
  VANTA.WAVES({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    color: 0x1d2951,
    shininess: 40.0,
    waveHeight: 15.0,
    waveSpeed: 1.3,
    zoom: 1.05,
  });
});

/* =========================================
   7) Particle Trail Cursor
========================================= */
new cursoreffects.fairyDustCursor({
  colors: ["#ff7f50", "#ffb347", "#ffd700"],
  elementCount: 15,
  clearCheckInterval: 2000,
});

/* =========================================
   8) Disco Ball + Music Player
========================================= */

// 1) Generate squares for smaller disco ball
var radius = 35;
var squareSize = 5;
var prec = 19.55;
var fuzzy = 0.001;
var inc = (Math.PI - fuzzy) / prec;
var discoBall = document.getElementById("discoBall");
let squaresArray = [];

for (let t = fuzzy; t < Math.PI; t += inc) {
  let z = radius * Math.cos(t);
  let currentRadius = Math.abs(
    (radius * Math.cos(0) * Math.sin(t)) -
    (radius * Math.cos(Math.PI) * Math.sin(t))
  ) / 2.5;

  let circumference = Math.abs(2 * Math.PI * currentRadius);
  let squaresThatFit = Math.floor(circumference / squareSize);
  let angleInc = (Math.PI * 2 - fuzzy) / squaresThatFit;

  for (let i = angleInc / 2 + fuzzy; i < Math.PI * 2; i += angleInc) {
    let square = document.createElement("div");
    let squareTile = document.createElement("div");
    squareTile.style.width = squareSize + "px";
    squareTile.style.height = squareSize + "px";
    squareTile.style.transformOrigin = "0 0 0";
    squareTile.style.transform = `rotate(${i}rad) rotateY(${t}rad)`;

    // Slightly random gray
    squareTile.style.backgroundColor = randomGrayColor();

    square.className = "square";
    squareTile.style.animation = "reflect 2s linear infinite";
    squareTile.style.animationDelay = String(randomNumber(0, 20) / 10) + "s";
    squareTile.style.backfaceVisibility = "hidden";

    let x = radius * Math.cos(i) * Math.sin(t);
    let y = radius * Math.sin(i) * Math.sin(t);
    square.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px)`;

    square.appendChild(squareTile);
    discoBall.appendChild(square);
    squaresArray.push(squareTile);
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomGrayColor() {
  let c = randomNumber(130, 220);
  return `rgb(${c}, ${c}, ${c})`;
}

// We have 5 darkish color combos for the disco ball
const discoColors = [
  ["#4a148c","#333"],   // deep purple
  ["#311b92","#333"],   // indigo
  ["#1a237e","#333"],   // dark blue
  ["#6a1b9a","#333"],   // purple
  ["#4527a0","#333"],   // deep indigo
];

// This changes the disco ball’s “shader” (the main sphere gradient + squares color)
function changeDiscoBallShader() {
  const choice = discoColors[Math.floor(Math.random() * discoColors.length)];
  // Update discoBallMiddle
  const discoBallMiddle = document.getElementById("discoBallMiddle");
  discoBallMiddle.style.background = `linear-gradient(to bottom, ${choice[0]}, ${choice[1]})`;

  // Recolor squares to match or be random dark
  squaresArray.forEach(tile => {
    tile.style.backgroundColor = choice[0];
  });
}

// 2) Basic Music Player
const audioPlayer = document.getElementById("audioPlayer");
const progressBar = document.getElementById("progressBar");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const controlIcon = document.getElementById("controlIcon");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

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

let currentSongIndex = 0;
let isPlaying = false;

// Load the initial track
loadTrack(currentSongIndex);

function loadTrack(index) {
  audioPlayer.src = playlist[index].src;
  trackTitle.textContent = playlist[index].title;
  trackArtist.textContent = playlist[index].artist;
  audioPlayer.load();
  progressBar.value = 0;
}

function togglePlayPause() {
  if (!isPlaying) {
    audioPlayer.play();
    controlIcon.classList.remove("fa-play");
    controlIcon.classList.add("fa-pause");
  } else {
    audioPlayer.pause();
    controlIcon.classList.remove("fa-pause");
    controlIcon.classList.add("fa-play");
  }
  isPlaying = !isPlaying;
}

// Update progress bar
audioPlayer.addEventListener("timeupdate", () => {
  if (audioPlayer.duration) {
    progressBar.max = audioPlayer.duration;
    progressBar.value = audioPlayer.currentTime;
  }
});

// Seek
progressBar.addEventListener("input", () => {
  audioPlayer.currentTime = progressBar.value;
});

// On track end → next track
audioPlayer.addEventListener("ended", () => {
  nextTrack();
  audioPlayer.play();
  isPlaying = true;
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
});

// Next / Prev
function nextTrack() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadTrack(currentSongIndex);
  // Each skip → random disco color
  changeDiscoBallShader();
}

function prevTrack() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentSongIndex);
  // Each skip → random disco color
  changeDiscoBallShader();
}

// Button events
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", () => {
  nextTrack();
  if (isPlaying) audioPlayer.play();
});
prevBtn.addEventListener("click", () => {
  prevTrack();
  if (isPlaying) audioPlayer.play();
});
