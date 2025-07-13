import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2yadXwLthJ00ZO-kkw9bm4N_YFsk--Yw",
  authDomain: "musicianisland-a7187.firebaseapp.com",
  projectId: "musicianisland-a7187",
  storageBucket: "musicianisland-a7187.appspot.com",
  messagingSenderId: "515531111173",
  appId: "1:515531111173:web:6e5847543d6887b800956c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎵 Setup
let currentPlaying = null;
const players = {};
let beatIdCounter = 1;

// Format time mm:ss
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// 🍔 Toggle menu on mobile
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('mobile-nav')?.classList.toggle('active');
});

// 🚀 Load Beats from Firestore
async function loadBeats() {
  const beatGrid = document.querySelector('.beat-grid');
  const querySnapshot = await getDocs(collection(db, "Beats"));

  querySnapshot.forEach((doc) => {
    const beat = doc.data();
    const id = beatIdCounter++;
    const waveformId = `waveform-${id}`;

    // 🧠 Create card
    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      <div class="beat-thumbnail" data-id="${id}">
        <img src="${beat.imageUrl}" alt="${beat.title} Cover" class="beat-image" />
        <div class="play-overlay">
          <img src="https://pngimg.com/d/youtube_button_PNG34.png" alt="Play Icon" />
        </div>
      </div>
      <div class="beat-info">
        <h3>${beat.title}</h3>
        <p>By ${beat.producer}</p>
        <span>$${beat.price}</span>
      </div>
      <div class="waveform" id="${waveformId}"></div>
      <div class="wave-timer" data-id="${id}">
        <span class="current-time">0:00</span> /
        <span class="total-time">0:00</span>
      </div>
      <div class="beat-actions">
        <button class="play-btn" data-id="${id}">▶️ Play</button>
        <button class="cart-btn">Add to Cart</button>
      </div>
    `;

    beatGrid.appendChild(card);

    // 🎶 Setup waveform
    setupPlayer(id, beat.fileUrl, waveformId);
  });
}

// 🌀 Setup WaveSurfer per track
function setupPlayer(id, fileUrl, containerId) {
  const wavesurfer = WaveSurfer.create({
    container: `#${containerId}`,
    waveColor: '#ff6666',
    progressColor: '#ff4444',
    height: 64,
    barWidth: 2,
    responsive: true,
    cursorColor: 'gold',
    backend: 'MediaElement'
  });

  wavesurfer.load(fileUrl);
  players[id] = wavesurfer;

  wavesurfer.on('ready', () => {
    const total = document.querySelector(`.wave-timer[data-id="${id}"] .total-time`);
    if (total) total.textContent = formatTime(wavesurfer.getDuration());
  });

  wavesurfer.on('audioprocess', () => {
    const current = document.querySelector(`.wave-timer[data-id="${id}"] .current-time`);
    if (current) current.textContent = formatTime(wavesurfer.getCurrentTime());
  });

  wavesurfer.on('finish', () => {
    const btn = document.querySelector(`.play-btn[data-id="${id}"]`);
    const card = btn.closest('.beat-card');
    const waveform = document.querySelector(`#${containerId}`);
    if (btn) btn.textContent = '▶️ Play';
    if (card) card.classList.remove('now-playing');
    if (waveform) waveform.classList.remove('now-playing');
    const current = document.querySelector(`.wave-timer[data-id="${id}"] .current-time`);
    if (current) current.textContent = '0:00';
    currentPlaying = null;
  });

  // Add click handlers
  document.querySelector(`.play-btn[data-id="${id}"]`)?.addEventListener('click', () => togglePlay(id));
  document.querySelector(`.beat-thumbnail[data-id="${id}"]`)?.addEventListener('click', () => togglePlay(id));
}

// ⏯ Toggle play/pause
function togglePlay(id) {
  const player = players[id];
  const btn = document.querySelector(`.play-btn[data-id="${id}"]`);
  const card = btn.closest('.beat-card');
  const waveformEl = document.querySelector(`#waveform-${id}`);

  if (currentPlaying && currentPlaying !== id) {
    const prevBtn = document.querySelector(`.play-btn[data-id="${currentPlaying}"]`);
    const prevCard = prevBtn?.closest('.beat-card');
    const prevWaveform = document.querySelector(`#waveform-${currentPlaying}`);
    players[currentPlaying]?.pause();
    if (prevBtn) prevBtn.textContent = '▶️ Play';
    if (prevCard) prevCard.classList.remove('now-playing');
    if (prevWaveform) prevWaveform.classList.remove('now-playing');
  }

  if (player.isPlaying()) {
    player.pause();
    btn.textContent = '▶️ Play';
    card.classList.remove('now-playing');
    waveformEl?.classList.remove('now-playing');
    currentPlaying = null;
  } else {
    player.play();
    btn.textContent = '⏸ Pause';
    card.classList.add('now-playing');
    waveformEl?.classList.add('now-playing');
    currentPlaying = id;
  }
}

// Start
loadBeats();
