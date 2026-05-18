require('dotenv').config();
const admin = require("firebase-admin");
const { Expo } = require("expo-server-sdk");
const http = require("http"); 

// --- 2. WEB SERVER FOR RENDER ---
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Push Server is Alive\n");
}).listen(PORT, () => {
  console.log(`Render Port Listener active on port ${PORT}`);
});
// ----------------------------------------------



// 1. Setup Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const expo = new Expo();

console.log("Cloud Backend is running and watching for new users...");

// 2. Watch for new tokens in the database
db.collection("push_tokens").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const token = data.token;

      console.log(`Sending Cloud Welcome to: ${token}`);

      // 3. Send the Push Notification via Expo
      try {
        await expo.sendPushNotificationsAsync([
          {
            to: token,
            sound: "default",
            title: "Welcome from the Cloud",
            body: "You have been successfully registered to our system.",
          },
        ]);
      } catch (error) {
        console.error("Push Error:", error);
      }
    }
  });
});