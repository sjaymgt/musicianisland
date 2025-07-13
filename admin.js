// admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC2yadXwLthJ00ZO-kkw9bm4N_YFsk--Yw",
  authDomain: "musicianisland-a7187.firebaseapp.com",
  projectId: "musicianisland-a7187",
  storageBucket: "musicianisland-a7187.appspot.com",
  messagingSenderId: "515531111173",
  appId: "1:515531111173:web:6e5847543d6887b800956c"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Google Drive Upload Endpoint
const UPLOAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbysRKqme3pA6TxJ1aWQFWxx95mQX9EEuBIkOXQ5rdb26bxrnokl_zeC4cCmMhDuPR6rnQ/exec";

// ✅ Convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ✅ Upload a file to Google Drive via Apps Script
async function uploadToDrive(file, mimeType) {
  const base64 = await toBase64(file);
  const body = new URLSearchParams();
  body.append("file", base64.split(",")[1]);
  body.append("filename", file.name);
  body.append("mimeType", mimeType);

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body
  });

  const json = await res.json();
  if (json.success) return json.url;
  else throw new Error(json.message);
}

// ✅ Handle form submission
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const producer = document.getElementById("producer").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const beatFile = document.getElementById("beatFile").files[0];
  const coverImage = document.getElementById("coverImage").files[0];
  const status = document.getElementById("status");

  if (!title || !producer || isNaN(price) || !beatFile || !coverImage) {
    status.textContent = "⚠️ Please fill all fields correctly.";
    return;
  }

  try {
    status.textContent = "Uploading files to Google Drive...";

    const beatUrl = await uploadToDrive(beatFile, beatFile.type);
    const imageUrl = await uploadToDrive(coverImage, coverImage.type);

    status.textContent = "Saving beat info to Firestore...";

    await addDoc(collection(db, "Beats"), {
      title,
      producer,
      price,
      beatUrl,
      imageUrl,
      createdAt: serverTimestamp()
    });

    status.textContent = "✅ Beat uploaded and saved successfully!";
    document.getElementById("uploadForm").reset();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Upload failed: " + err.message;
  }
});
