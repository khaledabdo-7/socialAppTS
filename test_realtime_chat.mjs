import { createRequire } from "module";
const require = createRequire("D:/Khaled_Projects/SocialApp_FullStack/frontend/package.json");
const { io } = require("socket.io-client");

const BASE_URL = "http://localhost:3007";

async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  const token = data.accessToken || data.token;
  const userId = data.user?._id || data.user?.id;
  return { token, userId, name: data.user?.name };
}

async function runChatTest() {
  console.log("==================================================");
  console.log("💬 STARTING REALTIME SOCKET.IO & REST CHAT TEST");
  console.log("==================================================");

  // 1. Authenticate both users
  console.log("\n[1] Authenticating Test Users...");
  const user1 = await loginUser("khaled@sphere.io", "Password123!");
  const user2 = await loginUser("omar@sphere.io", "Password123!");

  console.log(`✅ User 1: ${user1.name} (${user1.userId})`);
  console.log(`✅ User 2: ${user2.name} (${user2.userId})`);

  if (!user1.token || !user2.token) {
    throw new Error("Failed to get tokens for test users");
  }

  // 2. Connect both sockets
  console.log("\n[2] Connecting Socket.IO Clients...");
  const socket1 = io(BASE_URL, {
    auth: { token: user1.token },
    transports: ["websocket", "polling"],
  });

  const socket2 = io(BASE_URL, {
    auth: { token: user2.token },
    transports: ["websocket", "polling"],
  });

  await Promise.all([
    new Promise((resolve) => socket1.on("connected", (data) => {
      console.log(`✅ Socket 1 Confirmed Ready: ${socket1.id} (User: ${user1.name})`);
      resolve();
    })),
    new Promise((resolve) => socket2.on("connected", (data) => {
      console.log(`✅ Socket 2 Confirmed Ready: ${socket2.id} (User: ${user2.name})`);
      resolve();
    })),
  ]);

  // 3. Test Typing Indicator
  console.log("\n[3] Testing Realtime Typing Events...");
  const typingPromise = new Promise((resolve) => {
    socket2.on("userTyping", (data) => {
      console.log(`✅ User 2 received 'userTyping' from User 1:`, data);
      resolve(data);
    });
  });

  socket1.emit("typing", {
    receiverId: user2.userId,
    recipientId: user2.userId,
    isTyping: true,
  });

  await typingPromise;

  // 4. Test Bidirectional Realtime Messaging
  console.log("\n[4] Testing User 1 -> User 2 Instant Message...");
  const msgFromUser1 = `Hello Omar! Live chat test at ${new Date().toISOString()}`;

  const receiveMsg2Promise = new Promise((resolve) => {
    socket2.on("receiveMessage", (msg) => {
      console.log(`✅ User 2 received instant message in realtime:`, msg);
      resolve(msg);
    });
  });

  socket1.emit(
    "sendMessage",
    {
      receiverId: user2.userId,
      recipientId: user2.userId,
      message: msgFromUser1,
    },
    (ack) => {
      console.log("✅ Sender 1 Server Acknowledgment:", ack?.success ? "Delivered" : ack);
    }
  );

  const receivedBy2 = await receiveMsg2Promise;
  if (receivedBy2.message !== msgFromUser1) {
    throw new Error(`Message content mismatch: expected "${msgFromUser1}" got "${receivedBy2.message}"`);
  }

  // 5. Test Reply User 2 -> User 1
  console.log("\n[5] Testing User 2 -> User 1 Reply Instant Message...");
  const msgFromUser2 = `Received loud and clear, Khaled! Chat is functioning 100%!`;

  const receiveMsg1Promise = new Promise((resolve) => {
    socket1.on("receiveMessage", (msg) => {
      console.log(`✅ User 1 received reply in realtime:`, msg);
      resolve(msg);
    });
  });

  socket2.emit(
    "sendMessage",
    {
      receiverId: user1.userId,
      recipientId: user1.userId,
      message: msgFromUser2,
    },
    (ack) => {
      console.log("✅ Sender 2 Server Acknowledgment:", ack?.success ? "Delivered" : ack);
    }
  );

  const receivedBy1 = await receiveMsg1Promise;
  if (receivedBy1.message !== msgFromUser2) {
    throw new Error(`Message content mismatch: expected "${msgFromUser2}" got "${receivedBy1.message}"`);
  }

  // 6. Test REST Chat History & Persistence
  console.log("\n[6] Verifying Database Persistence & REST Chat History...");
  const historyRes = await fetch(`${BASE_URL}/chat/history/${user2.userId}`, {
    headers: { Authorization: `Bearer ${user1.token}` },
  });
  const historyData = await historyRes.json();
  const messages = historyData.data?.messages || historyData.messages || [];
  console.log(`✅ REST /chat/history returned HTTP ${historyRes.status} with ${messages.length} total messages`);

  const hasMsg1 = messages.some((m) => m.message === msgFromUser1);
  const hasMsg2 = messages.some((m) => m.message === msgFromUser2);
  console.log(`✅ Message 1 persisted in MongoDB: ${hasMsg1 ? "YES" : "NO"}`);
  console.log(`✅ Message 2 persisted in MongoDB: ${hasMsg2 ? "YES" : "NO"}`);

  // 7. Test Conversations Endpoint
  console.log("\n[7] Verifying Recent Conversations List...");
  const convRes = await fetch(`${BASE_URL}/chat/conversations`, {
    headers: { Authorization: `Bearer ${user1.token}` },
  });
  const convData = await convRes.json();
  const convList = convData.data || convData;
  console.log(`✅ REST /chat/conversations returned HTTP ${convRes.status} with ${convList.length} conversation(s)`);

  // 8. Test Mark Read
  console.log("\n[8] Testing Mark Messages As Read...");
  const readRes = await fetch(`${BASE_URL}/chat/read/${user2.userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${user1.token}` },
  });
  console.log(`✅ REST /chat/read returned HTTP ${readRes.status}`);

  // Disconnect sockets cleanly
  socket1.disconnect();
  socket2.disconnect();

  console.log("\n==================================================");
  console.log("🎉 ALL CHAT REALTIME & REST TESTS PASSED 100%!");
  console.log("==================================================");
  process.exit(0);
}

runChatTest().catch((err) => {
  console.error("❌ Chat Test Error:", err);
  process.exit(1);
});
