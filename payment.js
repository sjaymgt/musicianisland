import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// 🛒 Cart & Total
const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const total = cart.reduce((sum, i) => sum + i.price, 0);

// DOM Elements
const continueBtn = document.getElementById("continueBtn");
const emailInput = document.getElementById("emailInput");
document.getElementById("paymentTotal").textContent = `₦${total}`;

// 🚫 Hide payment selection UI completely
const methodCardSection = document.getElementById("payment-methods");
if (methodCardSection) methodCardSection.style.display = "none";

let selectedMethod = "paystack"; // force-select paystack

// ✅ Enable Continue when email is valid
emailInput.addEventListener("input", () => {
  continueBtn.disabled = !emailInput.value.includes("@");
});

// ✅ On continue, skip confirmation and go to Paystack directly
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
    key: "pk_live_8f05da323a062b81c7320ddd897fae05a6ca2548", // Replace with your actual Paystack public key
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
  await addDoc(collection(db, "Orders"), {
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
