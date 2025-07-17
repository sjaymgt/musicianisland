import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);

const signupBtn = document.getElementById("signupBtn");
  const userAvatar = document.getElementById("userAvatar");

  // Check Auth State
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // ✅ Logged in
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      const imageUrl = docSnap.exists() && docSnap.data().image
        ? docSnap.data().image
        : "https://i.pinimg.com/736x/9f/16/72/9f1672710cba6bcb0dfd93201c6d4c00.jpg"; // default

      userAvatar.src = imageUrl;
      userAvatar.style.display = "inline-block";
      signupBtn.style.display = "none";
    } else {
      // ❌ Not logged in
      signupBtn.style.display = "inline-block";
      userAvatar.style.display = "none";
    }
  });


let currentPlaying = null;
const players = {};
let beatIdCounter = 1;



//cart
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function isInCart(id) {
  return cart.some(item => item.id === id);
}

function addToCart(beat) {
  if (!isInCart(beat.id)) {
    cart.push(beat);
    saveCart();
    updateCartUI(beat.id);
  }
}

function updateCartUI(beatId) {
  const cartBtn = document.querySelector(`.beat-card [data-id="${beatId}"]`)?.parentElement?.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.textContent = '✅ Added';
    cartBtn.disabled = true;
  }

  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    const count = cart.length;
    cartIcon.innerHTML = `🛒 <span class="cart-count">${count}</span>`;
  }

  if (cart.length===0){
    cartIcon.innerHTML = `🛒`;
  }
}

// 🛒 Cart Drawer Logic
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartIcon = document.querySelector(".cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const closeCart = document.getElementById("close-cart");

// Show cart
// Show cart
cartIcon?.addEventListener("click", () => {
  renderCartDrawer();
  cartDrawer.classList.remove("hidden");  // 👈 make sure it's visible
  cartDrawer.classList.add("show");
  cartOverlay.classList.remove("hidden");
  cartOverlay.classList.add("show");
});


// Close cart
closeCart?.addEventListener("click", hideCartDrawer);
cartOverlay?.addEventListener("click", hideCartDrawer);

function hideCartDrawer() {
  cartDrawer.classList.remove("show");
  cartDrawer.classList.add("hidden"); // 👈 hide again
  cartOverlay.classList.remove("show");
  cartOverlay.classList.add("hidden");
}




document.querySelectorAll('nav.nav a').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();

    // Activate tab link
    document.querySelectorAll('nav.nav a').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show corresponding tab content
    const tabName = tab.getAttribute('data-tab');
    document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
  });
});



// Render cart items
function renderCartDrawer() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartItemsContainer.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");

    itemDiv.innerHTML = `
  <img src="${item.imageUrl}" alt="${item.title}" />
  <div class="cart-item-details">
    <h4>${item.title}</h4>
    <div class="genre">${item.genre || "Unknown Genre"}</div>
    <div class="price">$${item.price.toFixed(2)}</div>
    <button class="remove-item-btn" data-index="${index}">🗑 Remove</button>
  </div>
`;


    cartItemsContainer.appendChild(itemDiv);

    itemDiv.querySelector(".remove-item-btn").addEventListener("click", () => {
  cart.splice(index, 1); // remove item
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartDrawer(); // re-render
});
  });
  


  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Elements
const checkoutModal = document.getElementById("checkout-modal");
const checkoutSummary = document.getElementById("checkout-summary");
const cancelCheckout = document.getElementById("cancelCheckout");
const confirmCheckout = document.getElementById("confirmCheckout");

// When user clicks "Checkout" button
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!cart.length) return alert("Cart is empty!");

  // Render cart items
  checkoutSummary.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("checkout-item");
    itemDiv.innerHTML = `
      <p><strong>${item.title}</strong></p>
      <p style="font-size: 14px; color: #888;">${item.genre}</p>
      <p>$${item.price.toFixed(2)}</p>
    `;
    checkoutSummary.appendChild(itemDiv);
    total += item.price;
  });

  const totalDiv = document.createElement("div");
  totalDiv.classList.add("checkout-total");
  totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
  checkoutSummary.appendChild(totalDiv);

  // Show modal
  hideCartDrawer();
  checkoutModal.classList.remove("hidden");
});

// Cancel button
cancelCheckout.addEventListener("click", () => {
  checkoutModal.classList.add("hidden");
});

// Confirm button
document.getElementById("confirmCheckout").addEventListener("click", () => {
  // Optionally store cart in localStorage
  localStorage.setItem("checkoutCart", JSON.stringify(cart));

  // Navigate to checkout/payment page
  window.location.href = "payment.html"; // or "payment.html"
});




// ⏱ Time formatter
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// 🍔 Mobile nav toggle
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('mobile-nav')?.classList.toggle('active');
});

// 🚀 Load Beats
async function loadBeats(sortBy = 'createdAt', searchQuery = '', selectedGenre = 'all') {
  const beatsRef = collection(db, "Beats");
  const q = query(beatsRef, orderBy(sortBy, sortBy === 'title' ? 'asc' : 'desc'));
  const querySnapshot = await getDocs(q);

  const beats = [];
  querySnapshot.forEach((doc) => {
    const beat = doc.data();
    beat.id = doc.id;
    beats.push(beat);
  });

  renderBeats(beats, sortBy, searchQuery, selectedGenre);
}

// 🎨 Render beat cards
function renderBeats(beats, sortBy = 'createdAt', searchQuery = '', selectedGenre = 'all') {
  const beatGrid = document.querySelector('.beat-grid');
  beatGrid.innerHTML = '';
  beatIdCounter = 1;

  beats.forEach((beat) => {
    const matchText = (beat.title + " " + beat.producer + " " + (beat.moodTags || []).join(" ")).toLowerCase();
    if (!matchText.includes(searchQuery.toLowerCase())) return;

    const genre = beat.genre || "";
    if (selectedGenre !== "all" && genre.toLowerCase() !== selectedGenre.toLowerCase()) return;

    const id = beatIdCounter++;
    const waveformId = `waveform-${id}`;
    const isNew = beat.createdAt?.toDate ? ((new Date() - beat.createdAt.toDate()) / (1000 * 60 * 60 * 24)) <= 7 : false;

    const newBadge = isNew ? `<div class="new-badge">🆕 NEW</div>` : "";
    const moodTagsHtml = (beat.moodTags || []).map(tag => `<span class="mood-tag">#${tag}</span>`).join('');

    const card = document.createElement('div');
    card.className = 'beat-card';
    card.innerHTML = `
      <div class="mood-tags-container">${moodTagsHtml}</div>
      <div class="beat-thumbnail" data-id="${id}">
        ${newBadge}
        <img src="${beat.imageUrl}" alt="${beat.title} Cover" class="beat-image" />
        <div class="play-overlay">
          <img class="play-icon" src="https://www.freeiconspng.com/thumbs/video-play-icon/video-play-icon-20.png" alt="Play Icon" />
        </div>
      </div>
      <div class="beat-info">
        <h3>${beat.title}</h3>
        <p class="genre-label">${genre}</p>
        <span>$${beat.price}</span>
      </div>
      <div class="waveform-container">
        <div class="wave-loading" id="loading-${id}"></div>
        <div class="waveform" id="${waveformId}"></div>
      </div>
      <div class="wave-timer" data-id="${id}">
        <span class="current-time">0:00</span> /
        <span class="total-time">0:00</span>
      </div>
      <div class="beat-actions">
        <button class="play-btn" data-id="${id}">▶️ Preview</button>
        <button class="cart-btn">Add to Cart</button>
      </div>
    `;

    beatGrid.appendChild(card);
    setupPlayer(id, beat.fileUrl, waveformId);
    const cartBtn = card.querySelector('.cart-btn');
if (isInCart(beat.id)) {
  cartBtn.textContent = '✅ Added';
  cartBtn.disabled = true;
} else {
  cartBtn.addEventListener('click', () => {
    addToCart(beat);
  });
}

  });
}

// 🔊 WaveSurfer setup
function setupPlayer(id, fileUrl, containerId) {
  const wavesurfer = WaveSurfer.create({
    container: `#${containerId}`,
    waveColor: '#ff6666',
    progressColor: '#ff4444',
    height: 34,
    barWidth: 2,
    responsive: true,
    cursorColor: 'gold',
    backend: 'MediaElement'
  });

  wavesurfer.load(fileUrl);
  players[id] = wavesurfer;

  const spinner = document.getElementById(`loading-${id}`);
  const waveform = document.getElementById(containerId);

  if (spinner) spinner.style.display = 'block';
  if (waveform) waveform.style.display = 'none';

  wavesurfer.on('ready', () => {
    const duration = wavesurfer.getDuration();

    // 👇 Set full duration to total-time (not just 20s)
    const total = document.querySelector(`.wave-timer[data-id="${id}"] .total-time`);
    if (total) total.textContent = formatTime(duration);

    // Find best 20s segment
    // Find best 30s segment
let bestStart = 0;
if (duration > 30) {
  const peaks = wavesurfer.exportPeaks({ channels: 1, length: 1000 });
  let maxEnergy = 0;

  for (let i = 0; i < peaks.length - 30; i++) {
    const windowEnergy = peaks.slice(i, i + 30).reduce((sum, val) => sum + Math.abs(val), 0);
    if (windowEnergy > maxEnergy) {
      maxEnergy = windowEnergy;
      bestStart = (i / peaks.length) * duration;
    }
  }
}

players[id].previewStart = bestStart;
players[id].previewEnd = bestStart + 30;


    if (spinner) spinner.style.display = 'none';
    if (waveform) {
      waveform.style.display = 'block';
      waveform.classList.add('fade-in');
    }
  });

  wavesurfer.on('audioprocess', () => {
    const current = document.querySelector(`.wave-timer[data-id="${id}"] .current-time`);
    if (current) current.textContent = formatTime(wavesurfer.getCurrentTime());

    const previewEnd = players[id].previewEnd;
    if (wavesurfer.getCurrentTime() >= previewEnd) {
      wavesurfer.pause();

      const btn = document.querySelector(`.play-btn[data-id="${id}"]`);
      const card = btn.closest('.beat-card');
      const waveform = document.querySelector(`#${containerId}`);
      const overlayImg = card.querySelector('.play-overlay img');

      if (btn) btn.textContent = '▶️ Preview';
      if (overlayImg) {
        overlayImg.src = "https://www.freeiconspng.com/thumbs/video-play-icon/video-play-icon-20.png";
        overlayImg.alt = "Play Icon";
      }
      if (card) card.classList.remove('now-playing');
      if (waveform) waveform.classList.remove('now-playing');
      const current = document.querySelector(`.wave-timer[data-id="${id}"] .current-time`);
      if (current) current.textContent = '0:00';
      currentPlaying = null;
    }
  });

  document.querySelector(`.play-btn[data-id="${id}"]`)?.addEventListener('click', () => togglePlay(id));
  document.querySelector(`.beat-thumbnail[data-id="${id}"]`)?.addEventListener('click', () => togglePlay(id));
}



// ⏯ Toggle Play/Pause
function togglePlay(id) {
  const player = players[id];
  const btn = document.querySelector(`.play-btn[data-id="${id}"]`);
  const card = btn.closest('.beat-card');
  const waveformEl = document.querySelector(`#waveform-${id}`);
  const overlayImg = card.querySelector(".play-overlay img");

  if (currentPlaying && currentPlaying !== id) {
    const prevBtn = document.querySelector(`.play-btn[data-id="${currentPlaying}"]`);
    const prevCard = prevBtn?.closest('.beat-card');
    const prevWaveform = document.querySelector(`#waveform-${currentPlaying}`);
    const prevOverlayImg = prevCard?.querySelector(".play-overlay img");

    players[currentPlaying]?.pause();
    if (prevBtn) prevBtn.textContent = '▶️ Preview';
    if (prevOverlayImg) {
      prevOverlayImg.src = "https://www.freeiconspng.com/thumbs/video-play-icon/video-play-icon-20.png";
      prevOverlayImg.alt = "Play Icon";
    }
    prevCard?.classList.remove('now-playing');
    prevWaveform?.classList.remove('now-playing');
  }

  if (player.isPlaying()) {
    player.pause();
    btn.textContent = '▶️ Preview';
    card.classList.remove('now-playing');
    waveformEl?.classList.remove('now-playing');
    if (overlayImg) {
      overlayImg.src = "https://www.freeiconspng.com/thumbs/video-play-icon/video-play-icon-20.png";
      overlayImg.alt = "Play Icon";
    }
    currentPlaying = null;
  } else {
    player.play(players[id].previewStart || 0);
    btn.textContent = '⏸ Pause';
    card.classList.add('now-playing');
    waveformEl?.classList.add('now-playing');
    if (overlayImg) {
      overlayImg.src = "https://cdn-icons-png.flaticon.com/512/222/222376.png";
      overlayImg.alt = "Pause Icon";
    }
    currentPlaying = id;
  }
}

// 🎛 Filters
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genreSelect");

function reloadBeats() {
  const sortBy = sortSelect.value;
  const query = searchInput.value;
  const genre = genreSelect.value;
  loadBeats(sortBy, query, genre);
}

sortSelect.addEventListener("change", reloadBeats);
searchInput.addEventListener("input", reloadBeats);
genreSelect.addEventListener("change", reloadBeats);


// 🏁 Init
loadBeats(); // ⛽ Firestore only, no local cache

window.addEventListener("DOMContentLoaded", () => {
  const cartIcon = document.querySelector('.cart');
  if (cartIcon) {
    const count = cart.length;
    cartIcon.innerHTML = `🛒 <span class="cart-count">${count}</span>`;
  }
});





const packsGrid = document.getElementById("packsGrid");

async function fetchFileSize(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const sizeBytes = response.headers.get("Content-Length");
    return (sizeBytes / (1024 * 1024)).toFixed(2) + " MB";
  } catch (e) {
    console.error("Failed to fetch size:", e);
    return "Unknown";
  }
}

function isRecentUpload(timestamp) {
  const uploadedDate = timestamp?.toDate?.();
  if (!uploadedDate) return false;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return uploadedDate > sevenDaysAgo;
}


async function loadPacks() {
  const querySnapshot = await getDocs(collection(db, "Packs"));
  packsGrid.innerHTML = "";

  for (const doc of querySnapshot.docs) {
    const { name, imageUrl, fileUrl, uploadedAt } = doc.data();
    const size = await fetchFileSize(fileUrl);
    const isNew = isRecentUpload(uploadedAt);

    const card = document.createElement("div");
    card.className = "pack-card";

    card.innerHTML = `
      <img src="${imageUrl}" alt="${name}" class="pack-image"/>
      <div class="pack-info">
        <h3 class="pack-title">${name}</h3>
        <p class="pack-size">${size}</p>
        ${isNew ? `<span class="badge">New Batch</span>` : ""}
        <button class="add-to-cart-btn">Add to Cart</button>
      </div>
    `;

    packsGrid.appendChild(card);
  }
}

loadPacks();