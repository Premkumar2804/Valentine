// ============================================================
//  DATE NIGHT — script.js
//  All screen logic, quiz engine, letters exchange, animations
// ============================================================

// -- CONFIG --
const targetPasscode = "1304";

// -- STATE --
let enteredCode = "";
let currentQuestionIndex = 0;

// -- QUIZ DATA --
const QUIZ_QUESTIONS = [
  {
    question: "What is my favourite place in Asia?",
    options: ["Hong Kong", "In Your Arms 🤍", "Singapore"],
    answer: 1
  },
  {
    question: "Who do I love most?",
    options: ["Mom", "Alma 💕", "Rice"],
    answer: 1
  },
  {
    question: "My favourite moment of ours?",
    options: ["Sogo", "Eye Bar", "Disneyland 🏰"],
    answer: 2
  },
  {
    question: "Who holds the key to my heart?",
    options: ["Alma 🔑", "Brad Pitt", "Johnny Depp"],
    answer: 0
  }
];

// -- HEART CANVAS PARTICLE SIMULATION --
let heartCanvasAnimId = null;
let canvasElement = null;
let canvasCtx = null;
let heartParticles = [];

function initHeartCanvas() {
  canvasElement = document.getElementById('heart-canvas');
  if (!canvasElement) return;
  canvasCtx = canvasElement.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Start loop
  animateHeartCanvas();
}

function resizeCanvas() {
  if (canvasElement) {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
  }
}

class HeartParticle {
  constructor() {
    this.reset(true);
  }

  reset(init = false) {
    this.x = Math.random() * (canvasElement ? canvasElement.width : window.innerWidth);
    this.y = init ? Math.random() * (canvasElement ? canvasElement.height : window.innerHeight) : (canvasElement ? canvasElement.height + 20 : window.innerHeight + 20);
    this.size = Math.random() * 15 + 8;
    this.speedY = -(Math.random() * 1.5 + 0.5);
    this.speedX = Math.random() * 1.0 - 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.fadeSpeed = Math.random() * 0.003 + 0.0015;
    
    const colors = [
      'rgba(255, 84, 164, ',
      'rgba(255, 51, 102, ',
      'rgba(255, 164, 177, ',
      'rgba(255, 214, 231, '
    ];
    this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.opacity -= this.fadeSpeed;

    if (this.opacity <= 0 || this.y < -20 || (canvasElement && (this.x < -20 || this.x > canvasElement.width + 20))) {
      this.reset(false);
    }
  }

  draw() {
    if (!canvasCtx) return;
    canvasCtx.save();
    canvasCtx.globalAlpha = this.opacity;
    canvasCtx.fillStyle = this.colorPrefix + '1)';
    
    canvasCtx.beginPath();
    const x = this.x;
    const y = this.y;
    const w = this.size;
    const h = this.size;
    const topCurveHeight = h * 0.3;
    
    canvasCtx.moveTo(x, y + topCurveHeight);
    canvasCtx.bezierCurveTo(
      x - w / 2, y - topCurveHeight / 2,
      x - w, y + h / 3,
      x, y + h
    );
    canvasCtx.bezierCurveTo(
      x + w, y + h / 3,
      x + w / 2, y - topCurveHeight / 2,
      x, y + topCurveHeight
    );
    
    canvasCtx.closePath();
    canvasCtx.fill();
    canvasCtx.restore();
  }
}

function animateHeartCanvas() {
  if (!canvasElement || !canvasCtx) return;
  
  const passcodeScreen = document.getElementById('screen-passcode');
  if (!passcodeScreen || passcodeScreen.style.display === 'none' || !passcodeScreen.classList.contains('active-screen')) {
    heartCanvasAnimId = requestAnimationFrame(animateHeartCanvas);
    return;
  }

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (heartParticles.length === 0) {
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
      heartParticles.push(new HeartParticle());
    }
  }

  heartParticles.forEach(p => {
    p.update();
    p.draw();
  });

  heartCanvasAnimId = requestAnimationFrame(animateHeartCanvas);
}

// ============================================================
//  SCREEN MANAGER
// ============================================================
function showScreen(screenId) {
  const screens = document.querySelectorAll('.view-screen');
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.style.display = 'flex';
      // Wait one frame so display change registers before transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          screen.classList.add('active-screen');
        });
      });
    } else {
      screen.classList.remove('active-screen');
      setTimeout(() => {
        if (!screen.classList.contains('active-screen')) {
          screen.style.display = 'none';
        }
      }, 500);
    }
  });

  // Re-trigger scroll animations for photo album
  if (screenId === 'screen-album') {
    setTimeout(handleScrollAnimations, 200);
  }

  // Reset quiz when entering games
  if (screenId === 'screen-games') {
    currentQuestionIndex = 0;
    const bar = document.querySelector('.quiz-progress');
    if (bar) bar.style.width = '0%';
    loadQuizQuestion();
  }

  // Scroll to top of new screen
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
//  PASSCODE SCREEN
// ============================================================
const passcodeDots = document.querySelectorAll('.passcode-dots .dot');
const keys = document.querySelectorAll('.key');
const passcodeContainerEl = document.querySelector('.passcode-container');
const passcodeLoadingEl = document.querySelector('.passcode-loading');

keys.forEach(key => {
  key.addEventListener('click', () => {
    const value = key.innerText.trim();

    if (value === '😍') {
      createEmojiBurst(key, "😍", 12);
      return;
    }

    if (value === 'C') {
      enteredCode = "";
      updatePasscodeDots();
      return;
    }

    if (enteredCode.length < 4) {
      enteredCode += value;
      updatePasscodeDots();

      if (enteredCode.length === 4) {
        if (enteredCode === targetPasscode) {
          // SUCCESS — hearts burst + loading spinner → dashboard
          passcodeLoadingEl.style.display = 'block';
          createEmojiBurst(passcodeContainerEl, "❤️", 20);
          createEmojiBurst(passcodeContainerEl, "🌹", 10);
          setTimeout(() => {
            passcodeLoadingEl.style.display = 'none';
            showScreen('screen-date-night');
          }, 1400);
        } else {
          // WRONG — shake + reset
          passcodeContainerEl.classList.add('quiz-shake');
          setTimeout(() => {
            passcodeContainerEl.classList.remove('quiz-shake');
            enteredCode = "";
            updatePasscodeDots();
          }, 600);
        }
      }
    }
  });
});

function updatePasscodeDots() {
  passcodeDots.forEach((dot, index) => {
    dot.classList.remove('active', 'correct-step');
    if (index < enteredCode.length) {
      if (enteredCode[index] === targetPasscode[index]) {
        dot.classList.add('correct-step');
      } else {
        dot.classList.add('active');
      }
    }
  });
}

// ============================================================
//  NAVIGATION — Dashboard option cards
// ============================================================
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('click', () => {
    const target = card.getAttribute('data-target');
    showScreen(target);
  });
});

// Back buttons — need to stop propagation to avoid triggering parent card clicks
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    pauseAllAudio();
    const target = btn.getAttribute('data-target');
    showScreen(target);
  });
});

// Movie Night "Next Page" button
const nextToAlbumBtn = document.getElementById('next-to-album-btn');
if (nextToAlbumBtn) {
  nextToAlbumBtn.addEventListener('click', () => {
    showScreen('screen-album');
  });
}

// ============================================================
//  QUIZ PLANET
// ============================================================
const quizContentArea = document.getElementById('quiz-question-card');
const quizProgressBarEl = document.querySelector('.quiz-progress');

function loadQuizQuestion() {
  if (!quizContentArea) return;

  if (currentQuestionIndex >= QUIZ_QUESTIONS.length) {
    showQuizCompletion();
    return;
  }

  const percent = (currentQuestionIndex / QUIZ_QUESTIONS.length) * 100;
  if (quizProgressBarEl) quizProgressBarEl.style.width = `${percent}%`;

  const q = QUIZ_QUESTIONS[currentQuestionIndex];

  quizContentArea.style.opacity = '0';
  quizContentArea.style.transform = 'translateY(15px)';

  setTimeout(() => {
    quizContentArea.innerHTML = `
      <div class="quiz-q-num">Question ${currentQuestionIndex + 1} / ${QUIZ_QUESTIONS.length}</div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, idx) => `
          <button class="quiz-opt-btn" id="qopt-${idx}" onclick="handleQuizAnswer(${idx}, this)">
            <span class="opt-text">${opt}</span>
            <span class="indicator"></span>
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback" class="quiz-feedback-container"></div>
    `;
    quizContentArea.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    quizContentArea.style.opacity = '1';
    quizContentArea.style.transform = 'translateY(0)';
  }, 150);
}

window.handleQuizAnswer = function(selectedIndex, element) {
  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  const allBtns = document.querySelectorAll('.quiz-opt-btn');
  const feedbackEl = document.getElementById('quiz-feedback');

  // Lock all buttons
  allBtns.forEach(b => b.style.pointerEvents = 'none');

  if (selectedIndex === q.answer) {
    element.classList.add('quiz-correct');
    element.querySelector('.indicator').innerText = '❤️';
    createEmojiBurst(element, "💖", 10);
    createEmojiBurst(element, "🌹", 6);
    createEmojiBurst(element, "✨", 8);

    // Motivational correct text responses
    const correctMsgs = [
      "Perfect! You know me so well! ❤️",
      "Yay! You're my brilliant love! 💖",
      "Spot on, my sweetheart! You're amazing! 🌟",
      "Yes! My heart is doing flips for you! 💓",
      "Correct! You hold the key to my heart! 🔑"
    ];
    const msg = correctMsgs[Math.floor(Math.random() * correctMsgs.length)];
    if (feedbackEl) {
      feedbackEl.innerText = msg;
      feedbackEl.className = "quiz-feedback-container quiz-feedback-msg feedback-correct";
    }

    setTimeout(() => {
      currentQuestionIndex++;
      loadQuizQuestion();
    }, 1800);
  } else {
    element.classList.add('quiz-incorrect');
    element.querySelector('.indicator').innerText = '❌';

    // Sweet/lovely wrong answer responses
    const incorrectMsgs = [
      "Almost there, my love! Try again! 💕",
      "Oopsie! Close, but not quite, sweetheart! 🥰",
      "Try again, my darling! I believe in you! 🌸",
      "Not quite, my sweet! Let's try once more! 💖",
      "Close! Your love is warm, try another choice! 😘"
    ];
    const msg = incorrectMsgs[Math.floor(Math.random() * incorrectMsgs.length)];
    if (feedbackEl) {
      feedbackEl.innerText = msg;
      feedbackEl.className = "quiz-feedback-container quiz-feedback-msg feedback-incorrect";
    }

    quizContentArea.classList.add('quiz-shake');
    setTimeout(() => {
      quizContentArea.classList.remove('quiz-shake');
      element.classList.remove('quiz-incorrect');
      element.querySelector('.indicator').innerText = '';
      if (feedbackEl) {
        feedbackEl.innerText = "";
        feedbackEl.className = "quiz-feedback-container";
      }
      allBtns.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.classList.remove('quiz-incorrect');
        if (b.querySelector('.indicator')) b.querySelector('.indicator').innerText = '';
      });
    }, 1800);
  }
};

function showQuizCompletion() {
  if (quizProgressBarEl) quizProgressBarEl.style.width = '100%';

  quizContentArea.style.opacity = '0';
  setTimeout(() => {
    quizContentArea.innerHTML = `
      <div class="quiz-completion">
        <div class="quiz-completion-icon">🏆</div>
        <h3 style="font-size:1.6rem; color:#ff3366; margin-bottom:0.8rem;">You did it!</h3>
        <p style="color:#666; font-size:1.05rem; line-height:1.6; margin-bottom:2rem;">
          You know me perfectly! That means only one thing —<br>
          you truly are my person. 💕
        </p>
        <button class="action-btn" onclick="showScreen('screen-date-night')">
          ← Back to Date Night
        </button>
      </div>
    `;
    quizContentArea.style.transition = 'opacity 0.5s ease';
    quizContentArea.style.opacity = '1';

    // Celebratory burst!
    setTimeout(() => {
      const card = document.querySelector('.games-container');
      if (card) {
        createEmojiBurst(card, "🎉", 15);
        createEmojiBurst(card, "💖", 15);
        createEmojiBurst(card, "🌹", 10);
        createEmojiBurst(card, "✨", 12);
      }
    }, 300);
  }, 150);
}

// ============================================================
//  LETTERS EXCHANGE
// ============================================================
const envelope = document.getElementById('envelope');
if (envelope) {
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('open');
    if (envelope.classList.contains('open')) {
      createEmojiBurst(envelope, "💌", 8);
      createEmojiBurst(envelope, "💕", 6);
    }
  });
}

const sendReplyBtn = document.getElementById('send-reply-btn');
const replyTextarea = document.getElementById('reply-textarea');
const airplaneContainer = document.getElementById('airplane-animation-container');

if (sendReplyBtn) {
  sendReplyBtn.addEventListener('click', () => {
    const text = replyTextarea ? replyTextarea.value.trim() : '';
    if (!text) {
      // Shake the textarea gently
      replyTextarea.classList.add('quiz-shake');
      replyTextarea.style.borderColor = '#ff3b30';
      setTimeout(() => {
        replyTextarea.classList.remove('quiz-shake');
        replyTextarea.style.borderColor = '';
      }, 600);
      return;
    }

    // Save to LocalStorage as a keepsake
    localStorage.setItem('love_letter_reply', text);
    localStorage.setItem('love_letter_date', new Date().toLocaleDateString('en-GB'));

    // Launch airplane animation
    if (airplaneContainer) {
      const airplane = document.createElement('div');
      airplane.innerText = "✈️";
      airplane.classList.add('paper-airplane');
      airplaneContainer.appendChild(airplane);
      setTimeout(() => airplane.remove(), 2200);
    }

    // Launch heart burst
    createEmojiBurst(sendReplyBtn, "💌", 10);
    createEmojiBurst(sendReplyBtn, "💖", 8);

    // Update UI
    if (replyTextarea) replyTextarea.disabled = true;
    sendReplyBtn.disabled = true;
    sendReplyBtn.innerText = "Letter Sent! 💖";
    sendReplyBtn.style.background = "#4cd964";
    sendReplyBtn.style.boxShadow = "0 4px 15px rgba(76, 217, 100, 0.4)";
  });
}

// ============================================================
//  MUSIC PLAYER (Photo Album)
// ============================================================
const playBtns = document.querySelectorAll('.play-btn');
const seekSliders = document.querySelectorAll('.seek-slider');
const audios = document.querySelectorAll('.song-audio');

function pauseAllAudio() {
  audios.forEach((audio, i) => {
    audio.pause();
    if (playBtns[i]) playBtns[i].textContent = '▶';
  });
}

playBtns.forEach((btn, index) => {
  const audio = audios[index];
  const slider = seekSliders[index];
  if (!audio || !slider) return;

  btn.addEventListener('click', function () {
    const isPlaying = !audio.paused;

    // Pause others
    audios.forEach((a, i) => {
      if (i !== index) {
        a.pause();
        a.currentTime = 0;
        if (playBtns[i]) playBtns[i].textContent = '▶';
      }
    });

    if (isPlaying) {
      audio.pause();
      this.textContent = '▶';
    } else {
      audio.play().catch(err => console.warn("Audio play blocked:", err));
      this.textContent = '⏸';
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      slider.value = pct;
      slider.style.background = `linear-gradient(to right, var(--primary-color) ${pct}%, #535353 ${pct}%)`;
    }
  });

  slider.addEventListener('input', () => {
    if (audio.duration) {
      audio.currentTime = (slider.value / 100) * audio.duration;
      slider.style.background = `linear-gradient(to right, var(--primary-color) ${slider.value}%, #535353 ${slider.value}%)`;
    }
  });

  audio.addEventListener('ended', () => {
    btn.textContent = '▶';
    slider.value = 0;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, #535353 0%)`;
  });
});

// ============================================================
//  EMOJI BURST ENGINE  (reused everywhere)
// ============================================================
function createEmojiBurst(targetElement, emoji, count = 10) {
  const rect = targetElement.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const bubble = document.createElement('div');
      bubble.innerText = emoji;
      bubble.classList.add('bubble-emoji');

      const size = Math.random() * 1.6 + 1.1;
      bubble.style.fontSize = `${size}rem`;
      bubble.style.left = `${cx + (Math.random() * 40 - 20)}px`;
      bubble.style.top = `${cy + (Math.random() * 20 - 10)}px`;

      const rx = Math.random() * 100 - 50;
      const rxEnd = Math.random() * 280 - 140;
      bubble.style.setProperty('--random-x', `${rx}px`);
      bubble.style.setProperty('--random-x-end', `${rxEnd}px`);

      const dur = Math.random() * 1.4 + 1.0;
      bubble.style.animationDuration = `${dur}s`;

      document.body.appendChild(bubble);
      setTimeout(() => bubble.remove(), dur * 1000 + 50);
    }, i * 45);
  }
}

// ============================================================
//  SCROLL REVEAL OBSERVER
// ============================================================
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 120);
      obs.unobserve(entry.target);
    }
  });
}, { root: null, rootMargin: '0px', threshold: 0.1 });

function handleScrollAnimations() {
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.classList.remove('visible'); // Reset so re-entering triggers again
    revealObserver.observe(el);
  });
}

// ============================================================
//  EMOJI GRID INTERACTIVITY
// ============================================================
document.querySelectorAll('.emoji-item').forEach(item => {
  item.addEventListener('click', () => {
    createEmojiBurst(item, item.innerText, 8);
  });
});

// ============================================================
//  FLOATING HEARTS & ROSES BACKGROUND
// ============================================================
const floatingHeartsContainer = document.querySelector(".floating-hearts");
const BG_EMOJIS = ["❤️", "💖", "🌹", "💝", "💕", "🌹", "💓", "💗", "🌹", "💘", "🌸"];

function spawnBackgroundEmoji() {
  if (!floatingHeartsContainer) return;
  const el = document.createElement("div");
  el.classList.add("heart");
  el.innerText = BG_EMOJIS[Math.floor(Math.random() * BG_EMOJIS.length)];
  el.style.left = Math.random() * 100 + "vw";
  const dur = Math.random() * 6 + 7;
  el.style.animationDuration = `${dur}s`;
  el.style.fontSize = (Math.random() * 1.4 + 1.0) + "rem";
  // Random horizontal drift
  el.style.setProperty('--drift', `${Math.random() * 60 - 30}px`);
  floatingHeartsContainer.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000);
}

setInterval(spawnBackgroundEmoji, 550);

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Initial screen: passcode (already displayed)
  const passcodeScreen = document.getElementById('screen-passcode');
  if (passcodeScreen) {
    passcodeScreen.style.display = 'flex';
    requestAnimationFrame(() => passcodeScreen.classList.add('active-screen'));
  }

  // Initialize 3D heart particle canvas background
  initHeartCanvas();

  handleScrollAnimations();

  // Restore saved letter if exists
  const savedLetter = localStorage.getItem('love_letter_reply');
  if (savedLetter && replyTextarea) {
    replyTextarea.value = savedLetter;
  }
});
