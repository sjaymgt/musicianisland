import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
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
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
  if (user) {
    window.location.href = "index.html";
  }
});

// ✅ DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signinBtn = document.getElementById("signinBtn");
const togglePassword = document.getElementById("togglePassword");

// ✅ Show/hide password
togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "👁";
  }
});

// ✅ Sign In Handler
signinBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    return showToast("Please fill in both fields.");
  }

  if (!email.includes("@") || password.length < 6) {
    return showToast("Invalid email or password too short.");
  }

  signinBtn.disabled = true;
  signinBtn.textContent = "Signing In...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful ✅", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    console.error(err);
    showToast("Login failed: " + (err.message || "Try again."));
  } finally {
    signinBtn.disabled = false;
    signinBtn.textContent = "Sign In";
  }
});

// ✅ Toast system
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "success" ? "success" : ""}`;
  toast.textContent = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
