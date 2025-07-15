import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Firebase config
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

// 🎯 Elements
const usernameInput = document.getElementById("username");
const usernameError = document.getElementById("usernameError");
const usernameFeedback = document.getElementById("usernameFeedback");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const signupBtn = document.getElementById("signupBtn");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");
const successMessage = document.getElementById("successMessage");

// Reserved usernames and email keywords
const reservedUsernames = [
  "admin", "administrator", "root", "support", "help", "musician", "musicianisland", "island",
  "mod", "owner", "system", "null", "undefined"
];

// ✅ Validators
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function containsReservedInEmail(email) {
  const localPart = email.split("@")[0].toLowerCase();
  return reservedUsernames.some(word => localPart.includes(word));
}

function validateUsername(name) {
  return /^[a-zA-Z0-9_]{3,}$/.test(name);
}

async function isUsernameTaken(username) {
  const usersRef = collection(db, "Users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function suggestUsername(base) {
  const suffixes = ["1", "_official", "_x", "123"];
  for (const suffix of suffixes) {
    const trial = base + suffix;
    const taken = await isUsernameTaken(trial);
    if (!taken) return trial;
  }
  return base + Date.now().toString().slice(-3);
}

async function isEmailDisposable(email) {
  try {
    const res = await fetch(`https://www.validator.pizza/email/${encodeURIComponent(email)}`);
    const data = await res.json();
    return !data.valid && data.reason === "disposable";
  } catch (e) {
    console.warn("Email check failed:", e);
    return false; // allow if API fails
  }
}

// Live username availability
usernameInput.addEventListener("input", async () => {
  let username = usernameInput.value.toLowerCase().replace(/\s+/g, '');
  usernameInput.value = username;

  if (!validateUsername(username)) {
    usernameFeedback.textContent = "❌ Username must be 3+ characters, only letters/numbers/underscores";
    usernameFeedback.className = "username-feedback invalid";
    return;
  }

  if (reservedUsernames.includes(username)) {
    usernameFeedback.textContent = "❌ This username is reserved. Try another one.";
    usernameFeedback.className = "username-feedback invalid";
    return;
  }

  const taken = await isUsernameTaken(username);
  if (taken) {
    const suggestion = await suggestUsername(username);
    usernameFeedback.textContent = `❌ Username taken. Try "${suggestion}"`;
    usernameFeedback.className = "username-feedback invalid";
  } else {
    usernameFeedback.textContent = "✅ Username available!";
    usernameFeedback.className = "username-feedback valid";
  }
});

// ✅ Validate entire form
async function validate() {
  let valid = true;
  const username = usernameInput.value.trim().toLowerCase();
  const email = emailInput.value.trim().toLowerCase();

  if (!validateUsername(username)) {
    usernameError.textContent = "Username must be 3+ characters, letters/numbers/underscores only";
    usernameError.style.display = "block";
    valid = false;
  } else if (reservedUsernames.includes(username)) {
    usernameError.textContent = "This username is reserved. Please choose another.";
    usernameError.style.display = "block";
    valid = false;
  } else {
    usernameError.style.display = "none";
  }

  if (!validateEmail(email)) {
    emailError.textContent = "Enter a valid email address";
    emailError.style.display = "block";
    valid = false;
  } else if (containsReservedInEmail(email)) {
    emailError.textContent = "This email contains a reserved word (like 'admin')";
    emailError.style.display = "block";
    valid = false;
  } else if (await isEmailDisposable(email)) {
    emailError.textContent = "This email appears to be temporary or disposable";
    emailError.style.display = "block";
    valid = false;
  } else {
    emailError.style.display = "none";
  }

  if (passwordInput.value.length < 6) {
    passwordError.style.display = "block";
    valid = false;
  } else {
    passwordError.style.display = "none";
  }

  if (confirmInput.value !== passwordInput.value || confirmInput.value === "") {
    confirmError.style.display = "block";
    valid = false;
  } else {
    confirmError.style.display = "none";
  }

  return valid;
}

// ✅ Signup Process
signupBtn.addEventListener("click", async () => {
  if (!(await validate())) return;

  signupBtn.disabled = true;

  const username = usernameInput.value.trim().toLowerCase();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  try {
    const taken = await isUsernameTaken(username);
    if (taken) {
      usernameError.textContent = "Username already taken. Try another one.";
      usernameError.style.display = "block";
      signupBtn.disabled = false;
      return;
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await setDoc(doc(db, "Users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      createdAt: serverTimestamp()
    });

    successMessage.style.display = "block";

    setTimeout(() => {
      document.body.style.opacity = "0";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    }, 1200);

  } catch (err) {
    alert("Signup failed: " + err.message);
    signupBtn.disabled = false;
  }
});
