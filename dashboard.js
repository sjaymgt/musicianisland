import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2yadXwLthJ00ZO-kkw9bm4N_YFsk--Yw",
  authDomain: "musicianisland-a7187.firebaseapp.com",
  projectId: "musicianisland-a7187",
  storageBucket: "musicianisland-a7187.appspot.com",
  messagingSenderId: "515531111173",
  appId: "1:515531111173:web:6e5847543d6887b800956c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usernameEl = document.getElementById("username");
const userEmailEl = document.getElementById("userEmail");
const userAvatarEl = document.getElementById("userAvatar");
const ordersList = document.getElementById("ordersList");
const searchInput = document.getElementById("orderSearch");
const monthFilter = document.getElementById("monthFilter");
const yearFilter = document.getElementById("yearFilter");

const defaultAvatar = "https://i.pinimg.com/736x/9f/16/72/9f1672710cba6bcb0dfd93201c6d4c00.jpg";

let currentUser = null;
let allOrders = [];

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    currentUserId = user.uid;
    const userDoc = await getDoc(doc(db, "Users", user.uid));
    const data = userDoc.data();

    usernameEl.textContent = data?.username || "Anonymous";
    userEmailEl.textContent = user.email;
    userAvatarEl.src = data?.image || defaultAvatar;

    loadOrders(user.uid);
  } else {
    location.href = "index.html";
  }
});

async function loadOrders(userId) {
  try {
    const q = query(
      collection(db, "Orders"),
      where("uid", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    allOrders = [];
    ordersList.innerHTML = "";

    if (snapshot.empty) {
      ordersList.innerHTML = `<tr><td colspan="7" class="no-orders">You haven’t purchased anything yet.</td></tr>`;
      return;
    }

    for (const orderDoc of snapshot.docs) {
      const order = orderDoc.data();
      const orderDate = order.createdAt?.toDate();

      for (const item of order.items || []) {
        const size = item.fileUrl ? await getFileSize(item.fileUrl) : "Unknown";

        allOrders.push({
          title: item.title || "Untitled",
          imageUrl: item.imageUrl,
          price: item.price,
          size,
          fileUrl: item.fileUrl,
          refId: order.reference,
          date: orderDate
        });
      }
    }

    populateYearFilter();
    renderOrders(allOrders);
  } catch (err) {
    console.error("Failed to load orders:", err);
    ordersList.innerHTML = `<tr><td colspan="7" class="error-msg">Error loading orders</td></tr>`;
  }
}

function renderOrders(data) {
  ordersList.innerHTML = "";

  if (!data.length) {
    ordersList.innerHTML = `<tr><td colspan="7" class="no-orders">No matching orders found.</td></tr>`;
    return;
  }

  data.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Title">${order.title}</td>
      <td data-label="Preview"><img src="${order.imageUrl || 'https://via.placeholder.com/80'}" class="preview-img" /></td>
      <td data-label="Price">₦${order.price || 0}</td>
      <td data-label="Size">${order.size}</td>
      <td data-label="Download">
        ${order.fileUrl
          ? `<a href="${order.fileUrl}" class="download-btn" download>Download</a>`
          : `<span class="not-available">N/A</span>`}
      </td>
      <td data-label="Ref ID">${order.refId || "N/A"}</td>
      <td data-label="Date">${order.date?.toLocaleString() || "N/A"}</td>
    `;
    ordersList.appendChild(row);
  });
}

// 🧠 File size fetcher
async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const length = response.headers.get("content-length");
    if (!length) return "Unknown";

    const bytes = parseInt(length);
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  } catch (err) {
    console.warn("Size fetch failed:", err);
    return "Unknown";
  }
}

// 📌 Search and Filter Logic
searchInput?.addEventListener("input", () => {
  applyFilters();
});
monthFilter?.addEventListener("change", () => {
  applyFilters();
});
yearFilter?.addEventListener("change", () => {
  applyFilters();
});

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const month = parseInt(monthFilter.value);
  const year = parseInt(yearFilter.value);

  const filtered = allOrders.filter(order => {
    const matchesTitle = order.title.toLowerCase().includes(search);
    const matchesMonth = isNaN(month) || order.date?.getMonth() === month;
    const matchesYear = isNaN(year) || order.date?.getFullYear() === year;
    return matchesTitle && matchesMonth && matchesYear;
  });

  renderOrders(filtered);
}

function populateYearFilter() {
  const years = new Set(allOrders.map(o => o.date?.getFullYear()).filter(Boolean));
  yearFilter.innerHTML = `<option value="">Year</option>`;
  [...years].sort((a, b) => b - a).forEach(year => {
    yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
  });
}


// 🚀 Tab switching
document.querySelectorAll(".tab-btn").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-tab");

    // Remove 'active' from all buttons and tabs
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));

    // Add 'active' to selected
    button.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});



const avatarURLs = Array.from({ length: 200 }, (_, i) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=Anime${i + 1}`
);

const editBtn = document.getElementById("editAvatarBtn");
const modal = document.getElementById("avatarModal");
const avatarGrid = document.getElementById("avatarGrid");
const confirmBtn = document.getElementById("saveAvatarBtn");
const closeBtn = document.createElement("button");
let selectedAvatarURL = null;
let currentUserId = null;

// 🔘 Close button setup
closeBtn.innerHTML = "&times;";
closeBtn.id = "closeAvatarModal";
closeBtn.className = "close-avatar-modal";
document.querySelector(".avatar-modal-content").prepend(closeBtn);

// 🟢 Open Modal
editBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;
  currentUserId = user.uid;

  modal.classList.remove("hide");
  modal.classList.add("show");
  modal.style.display = "flex";
  document.body.style.overflow = 'hidden';
  populateAnimeAvatars();
});

// 🟢 Populate Avatars
function populateAnimeAvatars() {
  avatarGrid.innerHTML = "";
  selectedAvatarURL = null;
  confirmBtn.style.display = "none";

  avatarURLs.forEach(url => {
    const wrapper = document.createElement("div");
    wrapper.className = "avatar-wrapper";

    const img = document.createElement("img");
    img.src = url;
    img.className = "user-avatar-choice";

    wrapper.appendChild(img);
    avatarGrid.appendChild(wrapper);

    img.addEventListener("click", () => {
      document.querySelectorAll(".user-avatar-choice").forEach(el => el.classList.remove("selected"));
      img.classList.add("selected");
      selectedAvatarURL = url;

      wrapper.appendChild(confirmBtn); // move button under selected
      confirmBtn.style.display = "block";
    });
  });
}

// ✅ Save Selected Avatar
confirmBtn.addEventListener("click", async () => {
  if (!selectedAvatarURL || !currentUserId) return alert("Select an avatar first.");
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Saving Image...";

  try {
    await updateDoc(doc(db, "Users", currentUserId), { image: selectedAvatarURL });
    document.getElementById("userAvatar").src = selectedAvatarURL;
    closeModal();
    alert("Avatar updated!");
  } catch (err) {
    alert("Failed to save avatar");
    console.error(err);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "Save Avatar";
  }
});

// ❌ Close modal on outside click or cancel btn
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// 🧹 Close modal utility
function closeModal() {
  modal.classList.add("hide");
  modal.classList.remove("show");
  modal.style.display = "none";
  document.body.style.overflow = '';
}