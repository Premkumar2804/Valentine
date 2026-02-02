const questionContainer = document.querySelector("#main-question");
const resultContainer = document.querySelector(".result-container");
const gifResult = document.querySelector(".gif-result");
const heartLoader = document.querySelector(".cssload-main");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");


// ==========================================
//  CONFIG: CUSTOMIZE YOUR PAGE HERE
// ==========================================
const CONFIG = {
  // Passcode to unlock the first screen
  passcode: "1234",

  // Target Date for the countdown (Valentine's Day)
  // Month is 0-indexed: 0 = Jan, 1 = Feb, ... 11 = Dec
  targetDate: new Date(2026, 1, 14) // Feb 14, 2026
};
// ==========================================

// --- 5-Step Intro Flow Logic ---

// 1. Passcode Logic
const passcodeDots = document.querySelectorAll('.passcode-dots .dot');
const keys = document.querySelectorAll('.key');
let enteredCode = "";

keys.forEach(key => {
  key.addEventListener('click', () => {
    const value = key.innerText;

    if (value === '😍') {
      createBubble(key, "😍");
      return; // Don't add emoji to the passcode
    }

    if (value === 'C') {
      enteredCode = "";
      updateDots();
      return;
    }

    if (enteredCode.length < 4) {
      enteredCode += value;
      updateDots(); // Update visual immediately

      if (enteredCode.length === 4) {
        // Determine if full code is correct
        if (enteredCode === CONFIG.passcode) {
          // Full Success: Show spinner and transition
          const loadingSpinner = document.querySelector('.passcode-loading');
          if (loadingSpinner) loadingSpinner.style.display = 'block';

          setTimeout(() => {
            transitionTo('intro-passcode', 'intro-google');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
          }, 1500);
        } else {
          // Error: Shake and Reset
          const container = document.querySelector('.passcode-container');
          container.classList.add('shake');

          setTimeout(() => {
            container.classList.remove('shake');
          }, 500);

          setTimeout(() => {
            enteredCode = "";
            updateDots();
          }, 400);
        }
      }
    }
  });
});

function createBubble(targetElement) {
  // Create a LARGE burst of hearts (YouTube style)
  const burstCount = 15; // Bunch of bubbles

  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => {
      const bubble = document.createElement('div');
      // Mix of emojis for variety or keep uniform
      bubble.innerText = "😍";
      bubble.classList.add('bubble-emoji');

      // Randomize styling
      const size = Math.random() * 2 + 1.5; // Bigger sizes: 1.5rem to 3.5rem
      bubble.style.fontSize = `${size}rem`;

      // Randomize Animation Duration for organic feel
      const duration = Math.random() * 1.5 + 1.5; // 1.5s to 3s
      bubble.style.animationDuration = `${duration}s`;

      // Position it at the center of the button
      const rect = targetElement.getBoundingClientRect();

      // Start centered but with WIDER jitter
      const startX = rect.left + (rect.width / 2) - 20 + (Math.random() * 60 - 30);
      const startY = rect.top + (Math.random() * 40 - 20);

      bubble.style.left = `${startX}px`;
      bubble.style.top = `${startY}px`;

      // Wide Trajectory
      // Move left or right by -100px to +100px
      const randomX = Math.random() * 60 - 30;
      const randomXEnd = Math.random() * 200 - 100;

      bubble.style.setProperty('--random-x', `${randomX}px`);
      bubble.style.setProperty('--random-x-end', `${randomXEnd}px`);

      document.body.appendChild(bubble);

      // Remove after animation
      setTimeout(() => {
        bubble.remove();
      }, duration * 1000);
    }, i * 50); // Fast stagger
  }
}

function updateDots() {
  passcodeDots.forEach((dot, index) => {
    dot.classList.remove('active', 'correct-step');

    if (index < enteredCode.length) {
      // Check if this specific digit is correct according to the config
      if (enteredCode[index] === CONFIG.passcode[index]) {
        dot.classList.add('correct-step'); // Green Tick
      } else {
        dot.classList.add('active'); // White Dot
      }
    }
  });
}

// 2. Google Search Logic
const googleSearchBtn = document.querySelector('.js-google-search-btn');
const googleInput = document.querySelector('.search-input');

function handleGoogleSearch() {
  // Only proceed if user has typed something
  if (googleInput && googleInput.value.trim() !== "") {
    transitionTo('intro-google', 'intro-timer');
    startTimer();
  }
}

if (googleSearchBtn) {
  googleSearchBtn.addEventListener('click', handleGoogleSearch);
}

if (googleInput) {
  googleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleGoogleSearch();
    }
  });
}

// 3. Timer Logic
let timerInterval;

function startTimer() {
  function updateTimer() {
    const now = new Date();
    const diff = CONFIG.targetDate - now; // Countdown logic

    if (diff <= 0) {
      // Target reached
      document.getElementById('days').innerText = "00";
      document.getElementById('hours').innerText = "00";
      document.getElementById('minutes').innerText = "00";
      document.getElementById('seconds').innerText = "00";
      clearInterval(timerInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

// Navigation Buttons Generic Logic
document.querySelectorAll('.next-step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const nextId = btn.getAttribute('data-next');
    const currentScreen = btn.closest('.intro-screen');

    if (nextId === 'main-question') {
      // Final transition to original flow
      currentScreen.style.display = 'none';
      questionContainer.style.display = 'block';
      clearInterval(timerInterval);
    } else {
      transitionTo(currentScreen.id, nextId);
    }
  });
});

document.querySelectorAll('.prev-step-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const prevId = btn.getAttribute('data-prev');
    const currentScreen = btn.closest('.intro-screen');
    transitionTo(currentScreen.id, prevId);
  });
});

function transitionTo(fromId, toId) {
  const fromScreen = document.getElementById(fromId);
  const toScreen = document.getElementById(toId);

  fromScreen.style.opacity = '0';
  setTimeout(() => {
    fromScreen.style.display = 'none';
    toScreen.style.display = 'flex';
    setTimeout(() => {
      toScreen.style.opacity = '1';
    }, 50);
  }, 500);
}

// 5. Envelope Logic
const envelope = document.getElementById('envelope');
if (envelope) {
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('open');
  });
}

// Change the position of no button
function moveNoButton() {
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get button dimensions
  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;

  // Calculate max allowable positions (keep within viewport with a margin)
  const padding = 20;
  const maxX = viewportWidth - btnWidth - padding;
  const maxY = viewportHeight - btnHeight - padding;

  // Generate random coordinates within bounds
  const newX = Math.max(padding, Math.floor(Math.random() * maxX));
  const newY = Math.max(padding, Math.floor(Math.random() * maxY));

  noBtn.style.position = "fixed"; // Fixed positioning ensures it stays within viewport relative to screen
  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
  noBtn.style.zIndex = "100"; // Ensure it floats above other elements
}

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("click", moveNoButton); // Add click for mobile/touch support

// Yes button functionality
yesBtn.addEventListener("click", () => {
  questionContainer.style.display = "none";
  heartLoader.style.display = "inherit";

  const timeoutId = setTimeout(() => {
    heartLoader.style.display = "none";
    resultContainer.style.display = "block";

    // Play the video
    if (gifResult) {
      gifResult.play();
    }

    // Trigger animations for elements already in view
    handleScrollAnimations();
  }, 3000);
});

// Scroll Animation Observer (Lazy Load Reveal)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Add a small delay based on index for staggered effect if multiple enter at once
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function handleScrollAnimations() {
  const animatedElements = document.querySelectorAll('.scroll-reveal');
  animatedElements.forEach(el => observer.observe(el));

  // Also observe fade-in elements if any remain
  const fadeInElements = document.querySelectorAll('.fade-in');
  fadeInElements.forEach(el => observer.observe(el));
}

// Music Player Logic
// Music Player Logic
const playBtns = document.querySelectorAll('.play-btn');
const sliders = document.querySelectorAll('.seek-slider');
const audios = document.querySelectorAll('.song-audio');

playBtns.forEach((btn, index) => {
  const audio = audios[index];
  const slider = sliders[index];

  // Toggle Play/Pause
  btn.addEventListener('click', function () {
    const isPlaying = !audio.paused;

    // Pause all other audios
    audios.forEach((otherAudio, i) => {
      if (i !== index) {
        otherAudio.pause();
        otherAudio.currentTime = 0; // Optional: Reset others
        playBtns[i].textContent = '▶';
        playBtns[i].style.backgroundColor = '#1DB954';
        playBtns[i].style.transform = 'scale(1)';
      }
    });

    if (isPlaying) {
      audio.pause();
      this.textContent = '▶';
      this.style.backgroundColor = '#1DB954';
      this.style.transform = 'scale(1)';
    } else {
      audio.play();
      this.textContent = '⏸';
      this.style.backgroundColor = '#1ed760';
      this.style.transform = 'scale(1.1)';
    }
  });

  // Update Slider as Song Plays
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      slider.value = progressPercent;
      // Update slider background to look like a progress bar
      slider.style.background = `linear-gradient(to right, #1DB954 ${progressPercent}%, #535353 ${progressPercent}%)`;
    }
  });

  // Seek Functionality
  slider.addEventListener('input', () => {
    if (audio.duration) {
      const seekTime = (slider.value / 100) * audio.duration;
      audio.currentTime = seekTime;
      // Update gradient immediately while dragging
      slider.style.background = `linear-gradient(to right, #1DB954 ${slider.value}%, #535353 ${slider.value}%)`;
    }
  });

  // Reset when song ends
  audio.addEventListener('ended', () => {
    btn.textContent = '▶';
    btn.style.backgroundColor = '#1DB954';
    btn.style.transform = 'scale(1)';
    slider.value = 100; // Keep at end
    slider.style.background = 'linear-gradient(to right, #1DB954 100%, #535353 100%)';
  });
});

// Initialize observer
document.addEventListener('DOMContentLoaded', () => {
  handleScrollAnimations();
});

// Floating Hearts Logic
const floatingHeartsContainer = document.querySelector(".floating-hearts");

function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");

  // Array of Valentine-themed emojis
  const emojis = ["❤️", "💖", "💘", "💝", "💕", "💞", "💓", "💗"];
  heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];

  // Randomize properties
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = Math.random() * 5 + 5 + "s"; // 5-10s
  heart.style.fontSize = Math.random() * 1.5 + 1 + "rem"; // 1-2.5rem

  floatingHeartsContainer.appendChild(heart);

  // Remove heart after animation completes
  setTimeout(() => {
    heart.remove();
  }, 10000); // Max animation duration (matched with max animation duration in CSS roughly)
}

// Start creating hearts
setInterval(createHeart, 500); // New heart every 500ms
