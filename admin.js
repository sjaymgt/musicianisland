import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Firebase Config
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

// 🟢 Handle Form Submission
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("status");

  const title = document.getElementById("title").value;
  const producer = document.getElementById("producer").value;
  const price = parseFloat(document.getElementById("price").value);
  const beatUrl = document.getElementById("beatUrl").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  const genre = document.getElementById("genre").value;

  if (!beatUrl.startsWith("https://") || !imageUrl.startsWith("https://")) {
    status.textContent = "❌ Please provide valid HTTPS URLs from Vercel.";
    return;
  }

  try {
    status.textContent = "⏳ Uploading to Firestore...";

    const moodTagsInput = document.getElementById('moodTags');
const moodTags = moodTagsInput.value
  .split(',')
  .map(tag => tag.trim())
  .filter(tag => tag.length > 0);

    await addDoc(collection(db, "Beats"), {
      title,
      producer,
      price,
      fileUrl: beatUrl,
      imageUrl: imageUrl,
      genre,
      moodTags: moodTags,
      createdAt: serverTimestamp()
    });

    status.textContent = "✅ Beat successfully added!";
    e.target.reset();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error: " + err.message;
  }
});
