import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// DOM references
const userImage = document.getElementById("userImage");
const usernameEl = document.getElementById("username");
const userEmailEl = document.getElementById("userEmail");
const ordersList = document.getElementById("ordersList");

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "signup.html";

  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    usernameEl.textContent = userData.username || "Anonymous";
    userEmailEl.textContent = user.email;

    if (userData.image) {
      userImage.src = userData.image;
    } else {
      userImage.src = "https://i.pinimg.com/736x/9f/16/72/9f1672710cba6bcb0dfd93201c6d4c00.jpg";
    }
  }

  await loadOrders(user.uid);
});

async function loadOrders(uid) {
  ordersList.innerHTML = "<p class='empty-state'>Loading your beats...</p>";

  const ordersRef = collection(db, "Orders");
  const q = query(ordersRef, where("uid", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    ordersList.innerHTML = "<p class='empty-state'>You haven't made any purchases yet.</p>";
    return;
  }

  ordersList.innerHTML = "";
  snap.forEach(doc => {
    const order = doc.data();
    const div = document.createElement("div");
    div.className = "order-card";

    const date = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
      : "Unknown";

    div.innerHTML = `
      <div class="order-info">
        <h4>${order.title || "Untitled Beat"}</h4>
        <small>₦${order.price || "0.00"} • ${date}</small>
      </div>
      ${
        order.downloadUrl
          ? `<a class="download-btn" href="${order.downloadUrl}" download>Download</a>`
          : `<span style="color:#888;">Not downloadable</span>`
      }
    `;

    ordersList.appendChild(div);
  });
}
