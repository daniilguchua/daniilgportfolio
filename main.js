/* main.js - No 3D text, but we kept the scramble effect, 
             and we added a disco ball music player. */

// INIT AOS
AOS.init({
  duration: 1000,
  once: false,
});

// GSAP Navbar Animation
const navbar = document.querySelector("#navbar");
gsap.from(navbar, {
  duration: 1,
  y: -70,
  opacity: 0,
  ease: "power2.out",
});

// Smooth Scrolling for Nav
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
   Animated Title Cycle with Scramble
========================================= */
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Computer Scientist", "Security Enthusiast"];
const letterColors = ["#80d8f7", "#f8a7c1", "#c69ef5", "#fcb58a", "#d7f28c"];
let currentIndex = 0;

function displayTitle() {
  if (!dynamicTitle) return;
  dynamicTitle.innerHTML = "";

  const text = titles[currentIndex];
  const characters = text.split("");
  const spans = [];

  characters.forEach((char, i) => {
    if (char === " ") {
      dynamicTitle.appendChild(document.createTextNode(" "));
    } else {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.color = letterColors[i % letterColors.length];
      dynamicTitle.appendChild(span);
      spans.push(span);

      gsap.from(span, {
        duration: 0.1,
        y: -20,
        opacity: 0,
        ease: "power2.out",
        delay: i * 0.05,
      });
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

  gsap.delayedCall(2, () => {
    textScrambleEffect(spans, 6, 0.8);
  });
}

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
displayTitle();

/* =========================================
   Vanta.js Waves
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
});

/* =========================================
   Disco Ball Music Player
========================================= */
const player = document.getElementById("musicPlayer");
const prevBtn = document.getElementById("prevBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeSlider = document.getElementById("volumeSlider");

// Example playlist with 3 songs (public domain or free samples)
const playlist = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
];
let currentSongIndex = 0;
let audio = new Audio(playlist[currentSongIndex]);

// Listen for track end => auto-next
audio.addEventListener('ended', () => {
  nextTrack();
});

// Buttons
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
});
prevBtn.addEventListener('click', () => {
  currentSongIndex--;
  if (currentSongIndex < 0) currentSongIndex = playlist.length - 1;
  switchTrack();
});
nextBtn.addEventListener('click', () => {
  nextTrack();
});

// Volume
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

/* Helper to switch track and keep state */
function switchTrack() {
  audio.pause();
  audio = new Audio(playlist[currentSongIndex]);
  audio.volume = volumeSlider.value;
  audio.play();
  playPauseBtn.textContent = "Pause";
  audio.addEventListener('ended', nextTrack);
}
function nextTrack() {
  currentSongIndex++;
  if (currentSongIndex >= playlist.length) currentSongIndex = 0;
  switchTrack();
}
