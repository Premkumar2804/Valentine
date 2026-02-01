const questionContainer = document.querySelector(".question-container");
const resultContainer = document.querySelector(".result-container");
const gifResult = document.querySelector(".gif-result");
const heartLoader = document.querySelector(".cssload-main");
const yesBtn = document.querySelector(".js-yes-btn");
const noBtn = document.querySelector(".js-no-btn");

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
