import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ✅ Firebase Config
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

// 🛒 Cart & Total
const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const total = cart.reduce((sum, i) => sum + i.price, 0);

// DOM Elements
const continueBtn = document.getElementById("continueBtn");
const emailInput = document.getElementById("emailInput");
document.getElementById("paymentTotal").textContent = `₦${total}`;

// Hide payment methods section (we only use Paystack)
const methodCardSection = document.getElementById("payment-methods");
if (methodCardSection) methodCardSection.style.display = "none";

let currentUser = null;

// ✅ Auth Check & Auto-fill Email
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;

  // Fetch email from Firestore if it exists, else fallback to auth email
  try {
    const docRef = doc(db, "Users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      emailInput.value = userData.email || user.email;
    } else {
      emailInput.value = user.email;
    }

    continueBtn.disabled = !emailInput.value.includes("@");

  } catch (err) {
    console.error("Failed to fetch user info:", err);
    emailInput.value = user.email;
  }
});

// Email validation
emailInput.addEventListener("input", () => {
  continueBtn.disabled = !emailInput.value.includes("@");
});

// 🚀 Proceed to Paystack on click
continueBtn.addEventListener("click", () => {
  const email = emailInput.value;
  if (!email.includes("@")) {
    alert("Enter a valid email.");
    return;
  }
  payWithPaystack(email);
});

// ✅ Paystack Integration
function payWithPaystack(email) {
  const handler = PaystackPop.setup({
    key: "pk_test_dbc49df467acfe0f6573455e87aeab0ef6115e3f",
    email,
    amount: total * 100,
    currency: "NGN",
    channels: ["card", "bank", "ussd", "mobile_money"],
    callback: function (response) {
      saveOrder("paystack", response.reference)
        .then(() => console.log("Order saved"))
        .catch(err => console.error("Order save failed", err));
    },
    onClose: function () {
      alert("Payment canceled");
    }
  });
  handler.openIframe();
}

// ✅ Save Order to Firestore
async function saveOrder(method, ref) {
  if (!currentUser) {
    alert("User not authenticated");
    return;
  }

  await addDoc(collection(db, "Orders"), {
    uid: currentUser.uid,
    items: cart,
    total,
    method,
    reference: ref,
    email: emailInput.value,
    createdAt: serverTimestamp()
  });

  localStorage.removeItem("cart");
  window.location.href = "thankyou.html";
}
