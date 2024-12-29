// AOS for scroll animations
AOS.init({
  duration: 1000,
  once: false,
});

// GSAP: fade-in navbar
const navbar = document.querySelector("#navbar");
gsap.from(navbar, {
  duration: 1,
  y: -70,
  opacity: 0,
  ease: "power2.out",
});

// Smooth scroll for nav links
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
   Title cycle with scramble
========================================= */
const dynamicTitle = document.getElementById("dynamicTitle");
const titles = ["Software Engineer", "Computer Scientist", "Security Enthusiast"];
const letterColors = ["#80d8f7", "#f8a7c1", "#c69ef5", "#fcb58a", "#d7f28c"];
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

  // After 2s, scramble
  gsap.delayedCall(2, () => textScramble(spans, 6, 0.8));
}

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
  gsap.to(dynamicTitle, {
    duration: 0,
    opacity: 0,
    onComplete: () => {
      dynamicTitle.style.opacity = 1;
      currentIndex = (currentIndex + 1) % titles.length;
      displayTitle();
    },
  });
}

displayTitle();

/* =========================================
   Vanta Waves
========================================= */
window.addEventListener('DOMContentLoaded', () => {
  VANTA.WAVES({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x70714,
    shininess: 100.0,
    waveHeight: 19.5,
    waveSpeed: 0.5,
    zoom: 0.7,
  });
});

/* =========================================
   Disco Ball Music Player
========================================= */
const musicPlayer = document.getElementById("musicPlayer");
const prevBtn = document.getElementById("prevBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeSlider = document.getElementById("volumeSlider");

// Example playlist (public domain samples)
const playlist = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
];
let currentSongIndex = 0;
let audio = new Audio(playlist[currentSongIndex]);

audio.addEventListener("ended", () => {
  nextTrack();
});

// Buttons
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
});
prevBtn.addEventListener("click", () => {
  currentSongIndex--;
  if (currentSongIndex < 0) currentSongIndex = playlist.length - 1;
  switchTrack();
});
nextBtn.addEventListener("click", () => {
  nextTrack();
});
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Helpers
function switchTrack() {
  audio.pause();
  audio = new Audio(playlist[currentSongIndex]);
  audio.volume = volumeSlider.value;
  audio.play();
  playPauseBtn.textContent = "Pause";
  audio.addEventListener("ended", nextTrack);
}
function nextTrack() {
  currentSongIndex++;
  if (currentSongIndex >= playlist.length) currentSongIndex = 0;
  switchTrack();
}
