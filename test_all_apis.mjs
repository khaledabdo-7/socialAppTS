// Comprehensive API Test Suite for Sphere (SocialAppTS) Backend
const BASE_URL = "http://localhost:3007";

const results = [];

function logResult(name, method, endpoint, status, pass, details = "") {
  results.push({ name, method, endpoint, status, pass, details });
  const icon = pass ? "✅ PASS" : "❌ FAIL";
  console.log(`${icon} [${method}] ${endpoint} (HTTP ${status}) - ${name} ${details ? `| ${details}` : ""}`);
}

async function run() {
  console.log("==================================================");
  console.log("🚀 STARTING COMPREHENSIVE API TEST ON " + BASE_URL);
  console.log("==================================================");

  let token1 = "";
  let token2 = "";
  let refreshToken1 = "";
  let user1Id = "";
  let user2Id = "";
  let createdPostId = "";
  let createdCommentId = "";
  let notificationId = "";

  // -------------------------------------------------------------------
  // 1. AUTH MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [1] AUTHENTICATION APIS ---");

  // 1.1 Login User 1 (Khaled)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "khaled@sphere.io", password: "Password123!" }),
    });
    const data = await res.json();
    const pass = res.status === 200 && (data.accessToken || data.token || data.data?.accessToken);
    token1 = data.accessToken || data.token || data.data?.accessToken;
    refreshToken1 = data.refreshToken || data.data?.refreshToken;
    user1Id = data.user?._id || data.user?.id || data.data?.user?._id;
    logResult("Login Primary User", "POST", "/auth/login", res.status, pass, `User: ${user1Id}`);
  } catch (err) {
    logResult("Login Primary User", "POST", "/auth/login", 0, false, err.message);
  }

  // 1.2 Login User 2 (Omar)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "omar@sphere.io", password: "Password123!" }),
    });
    const data = await res.json();
    const pass = res.status === 200 && (data.accessToken || data.token || data.data?.accessToken);
    token2 = data.accessToken || data.token || data.data?.accessToken;
    user2Id = data.user?._id || data.user?.id || data.data?.user?._id;
    logResult("Login Secondary User", "POST", "/auth/login", res.status, pass, `User: ${user2Id}`);
  } catch (err) {
    logResult("Login Secondary User", "POST", "/auth/login", 0, false, err.message);
  }

  // 1.3 Register a New User
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testEmail = `testuser_${randomSuffix}@sphere.io`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Runner User",
        email: testEmail,
        password: "Password123!",
        confirmPassword: "Password123!",
        gender: "male",
      }),
    });
    const data = await res.json();
    const pass = res.status === 200 || res.status === 201;
    logResult("Register New User", "POST", "/auth/register", res.status, pass, `Created: ${testEmail}`);
  } catch (err) {
    logResult("Register New User", "POST", "/auth/register", 0, false, err.message);
  }

  // 1.4 Resend OTP
  try {
    const res = await fetch(`${BASE_URL}/auth/resendOtp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const pass = res.status === 200;
    logResult("Resend OTP", "POST", "/auth/resendOtp", res.status, pass);
  } catch (err) {
    logResult("Resend OTP", "POST", "/auth/resendOtp", 0, false, err.message);
  }

  // 1.5 Refresh Token
  if (refreshToken1) {
    try {
      const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshToken1 }),
      });
      const data = await res.json();
      const pass = res.status === 200 && (data.accessToken || data.data?.accessToken);
      logResult("Refresh Access Token", "POST", "/auth/refreshToken", res.status, pass);
    } catch (err) {
      logResult("Refresh Access Token", "POST", "/auth/refreshToken", 0, false, err.message);
    }
  }

  // 1.6 Forget Password
  try {
    const res = await fetch(`${BASE_URL}/auth/forgetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const pass = res.status === 200;
    logResult("Forget Password", "POST", "/auth/forgetPassword", res.status, pass);
  } catch (err) {
    logResult("Forget Password", "POST", "/auth/forgetPassword", 0, false, err.message);
  }

  const authHeaders1 = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token1}`,
  };

  const authHeaders2 = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token2}`,
  };

  // -------------------------------------------------------------------
  // 2. USER / PROFILE MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [2] USER & PROFILE APIS ---");

  // 2.1 Get Current User (Me)
  try {
    const res = await fetch(`${BASE_URL}/user/me`, { headers: authHeaders1 });
    const data = await res.json();
    const pass = res.status === 200 && (data.data?.email === "khaled@sphere.io" || data.email === "khaled@sphere.io");
    logResult("Get Current User Profile", "GET", "/user/me", res.status, pass);
  } catch (err) {
    logResult("Get Current User Profile", "GET", "/user/me", 0, false, err.message);
  }

  // 2.2 Get User by ID
  try {
    const res = await fetch(`${BASE_URL}/user/${user2Id}`, { headers: authHeaders1 });
    const data = await res.json();
    const pass = res.status === 200 && (data.data?.name || data.name);
    logResult("Get User By ID", "GET", `/user/${user2Id}`, res.status, pass);
  } catch (err) {
    logResult("Get User By ID", "GET", `/user/${user2Id}`, 0, false, err.message);
  }

  // 2.3 Search Users
  try {
    const res = await fetch(`${BASE_URL}/user/search?q=Omar`, { headers: authHeaders1 });
    const data = await res.json();
    const resultsArr = data.data || data;
    const pass = res.status === 200 && Array.isArray(resultsArr);
    logResult("Search Users", "GET", "/user/search?q=Omar", res.status, pass, `Found: ${resultsArr.length}`);
  } catch (err) {
    logResult("Search Users", "GET", "/user/search?q=Omar", 0, false, err.message);
  }

  // 2.4 User Suggestions
  try {
    const res = await fetch(`${BASE_URL}/user/suggestions`, { headers: authHeaders1 });
    const data = await res.json();
    const list = data.data || data;
    const pass = res.status === 200 && Array.isArray(list);
    logResult("Get Suggestions", "GET", "/user/suggestions", res.status, pass, `Count: ${list.length}`);
  } catch (err) {
    logResult("Get Suggestions", "GET", "/user/suggestions", 0, false, err.message);
  }

  // 2.5 Update Profile
  try {
    const res = await fetch(`${BASE_URL}/user/update-profile`, {
      method: "PATCH",
      headers: authHeaders1,
      body: JSON.stringify({
        name: "Khaled Abdo (Sphere Admin)",
        bio: "Senior Full-Stack Engineer | Architecting Sphere Social Platform",
      }),
    });
    const pass = res.status === 200;
    logResult("Update Profile", "PATCH", "/user/update-profile", res.status, pass);
  } catch (err) {
    logResult("Update Profile", "PATCH", "/user/update-profile", 0, false, err.message);
  }

  // -------------------------------------------------------------------
  // 3. POST MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [3] POST APIS ---");

  // 3.1 Create Post
  try {
    const res = await fetch(`${BASE_URL}/post/create-post`, {
      method: "POST",
      headers: authHeaders1,
      body: JSON.stringify({
        title: "Automated API Test Post",
        content: "Verifying end-to-end reliability of all Sphere endpoints across database, caching, and real-time sockets.",
        tags: ["engineering", "testing", "fullstack"],
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        allowComments: true,
      }),
    });
    const data = await res.json();
    const post = data.data || data;
    createdPostId = post._id || post.id;
    const pass = (res.status === 200 || res.status === 201) && Boolean(createdPostId);
    logResult("Create Post", "POST", "/post/create-post", res.status, pass, `PostId: ${createdPostId}`);
  } catch (err) {
    logResult("Create Post", "POST", "/post/create-post", 0, false, err.message);
  }

  // 3.2 Get Feed
  try {
    const res = await fetch(`${BASE_URL}/post/feed`, { headers: authHeaders1 });
    const data = await res.json();
    const feed = data.data || data;
    const pass = res.status === 200 && Array.isArray(feed.posts || feed);
    logResult("Get Smart Feed", "GET", "/post/feed", res.status, pass, `Posts: ${(feed.posts || feed).length}`);
  } catch (err) {
    logResult("Get Smart Feed", "GET", "/post/feed", 0, false, err.message);
  }

  // 3.3 Get Posts (Legacy / User Feed)
  try {
    const res = await fetch(`${BASE_URL}/post/get-posts`, { headers: authHeaders1 });
    const data = await res.json();
    const posts = data.data || data;
    const pass = res.status === 200 && Array.isArray(posts);
    logResult("Get Posts", "GET", "/post/get-posts", res.status, pass, `Count: ${posts.length}`);
  } catch (err) {
    logResult("Get Posts", "GET", "/post/get-posts", 0, false, err.message);
  }

  // 3.4 Get User Posts
  try {
    const res = await fetch(`${BASE_URL}/post/user/${user1Id}`, { headers: authHeaders1 });
    const data = await res.json();
    const posts = data.data || data;
    const pass = res.status === 200 && Array.isArray(posts);
    logResult("Get User Posts", "GET", `/post/user/${user1Id}`, res.status, pass, `Count: ${posts.length}`);
  } catch (err) {
    logResult("Get User Posts", "GET", `/post/user/${user1Id}`, 0, false, err.message);
  }

  // 3.5 Get Post By ID
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/post/${createdPostId}`, { headers: authHeaders1 });
      const data = await res.json();
      const pass = res.status === 200 && (data.data?._id === createdPostId || data._id === createdPostId);
      logResult("Get Post By ID", "GET", `/post/${createdPostId}`, res.status, pass);
    } catch (err) {
      logResult("Get Post By ID", "GET", `/post/${createdPostId}`, 0, false, err.message);
    }
  }

  // 3.6 Toggle Post Reaction (User 2 reacts to User 1's post)
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/post/${createdPostId}/react`, {
        method: "POST",
        headers: authHeaders2,
        body: JSON.stringify({ type: "Love" }),
      });
      const data = await res.json();
      const pass = res.status === 200;
      logResult("React to Post (/post/:id/react)", "POST", `/post/${createdPostId}/react`, res.status, pass, data.message);
    } catch (err) {
      logResult("React to Post (/post/:id/react)", "POST", `/post/${createdPostId}/react`, 0, false, err.message);
    }

    // 3.7 Alternate reaction endpoint (/post/react/:id)
    try {
      const res = await fetch(`${BASE_URL}/post/react/${createdPostId}`, {
        method: "POST",
        headers: authHeaders2,
        body: JSON.stringify({ type: "Haha" }),
      });
      const data = await res.json();
      const pass = res.status === 200;
      logResult("React to Post (/post/react/:id)", "POST", `/post/react/${createdPostId}`, res.status, pass, data.message);
    } catch (err) {
      logResult("React to Post (/post/react/:id)", "POST", `/post/react/${createdPostId}`, 0, false, err.message);
    }
  }

  // 3.8 Update Post (PATCH)
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/post/${createdPostId}`, {
        method: "PATCH",
        headers: authHeaders1,
        body: JSON.stringify({ title: "Automated API Test Post (Updated Headline)" }),
      });
      const pass = res.status === 200;
      logResult("Update Post", "PATCH", `/post/${createdPostId}`, res.status, pass);
    } catch (err) {
      logResult("Update Post", "PATCH", `/post/${createdPostId}`, 0, false, err.message);
    }
  }

  // -------------------------------------------------------------------
  // 4. COMMENT MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [4] COMMENT APIS ---");

  // 4.1 Create Comment (User 2 comments on User 1's post)
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/comment/create-comment`, {
        method: "POST",
        headers: authHeaders2,
        body: JSON.stringify({
          postId: createdPostId,
          content: "Great milestone! All services running cleanly.",
        }),
      });
      const data = await res.json();
      const comment = data.data || data;
      createdCommentId = comment._id || comment.id;
      const pass = (res.status === 200 || res.status === 201) && Boolean(createdCommentId);
      logResult("Create Comment", "POST", "/comment/create-comment", res.status, pass, `CommentId: ${createdCommentId}`);
    } catch (err) {
      logResult("Create Comment", "POST", "/comment/create-comment", 0, false, err.message);
    }

    // 4.2 Get Comments by Post ID (RESTful)
    try {
      const res = await fetch(`${BASE_URL}/comment/post/${createdPostId}`, { headers: authHeaders1 });
      const data = await res.json();
      const comments = data.data || data;
      const pass = res.status === 200 && Array.isArray(comments);
      logResult("Get Comments by Post ID", "GET", `/comment/post/${createdPostId}`, res.status, pass, `Count: ${comments.length}`);
    } catch (err) {
      logResult("Get Comments by Post ID", "GET", `/comment/post/${createdPostId}`, 0, false, err.message);
    }

    // 4.3 Get Comments by Post ID (Legacy route)
    try {
      const res = await fetch(`${BASE_URL}/comment/get-comments-by-post-id/${createdPostId}`, { headers: authHeaders1 });
      const data = await res.json();
      const comments = data.data || data;
      const pass = res.status === 200 && Array.isArray(comments);
      logResult("Get Comments (Legacy Path)", "GET", `/comment/get-comments-by-post-id/${createdPostId}`, res.status, pass);
    } catch (err) {
      logResult("Get Comments (Legacy Path)", "GET", `/comment/get-comments-by-post-id/${createdPostId}`, 0, false, err.message);
    }
  }

  // 4.4 Get Single Comment By ID
  if (createdCommentId) {
    try {
      const res = await fetch(`${BASE_URL}/comment/${createdCommentId}`, { headers: authHeaders1 });
      const pass = res.status === 200;
      logResult("Get Comment By ID", "GET", `/comment/${createdCommentId}`, res.status, pass);
    } catch (err) {
      logResult("Get Comment By ID", "GET", `/comment/${createdCommentId}`, 0, false, err.message);
    }
  }

  // -------------------------------------------------------------------
  // 5. FRIEND / CONNECTION MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [5] FRIENDSHIP & CONNECTIONS APIS ---");

  // 5.1 Get Friends List (User 1)
  try {
    const res = await fetch(`${BASE_URL}/friend/list`, { headers: authHeaders1 });
    const data = await res.json();
    const result = data.data || data;
    const pass = res.status === 200 && Array.isArray(result.friends);
    logResult("Get Friends List", "GET", "/friend/list", res.status, pass, `Friends: ${result.friends?.length}, Pending: ${result.pendingRequests?.length}`);
  } catch (err) {
    logResult("Get Friends List", "GET", "/friend/list", 0, false, err.message);
  }

  // 5.2 Send Friend Request (User 2 to User 1)
  try {
    const res = await fetch(`${BASE_URL}/friend/send`, {
      method: "POST",
      headers: authHeaders2,
      body: JSON.stringify({ recipientId: user1Id }),
    });
    // Can be 200/201 or 400 if already exists/friends
    const pass = res.status === 200 || res.status === 201 || res.status === 400;
    logResult("Send Friend Request", "POST", "/friend/send", res.status, pass, `User 2 -> User 1`);
  } catch (err) {
    logResult("Send Friend Request", "POST", "/friend/send", 0, false, err.message);
  }

  // -------------------------------------------------------------------
  // 6. CHAT MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [6] CHAT & MESSAGING APIS ---");

  // 6.1 Get Recent Conversations
  try {
    const res = await fetch(`${BASE_URL}/chat/conversations`, { headers: authHeaders1 });
    const data = await res.json();
    const convs = data.data || data;
    const pass = res.status === 200 && Array.isArray(convs);
    logResult("Get Conversations", "GET", "/chat/conversations", res.status, pass, `Count: ${convs.length}`);
  } catch (err) {
    logResult("Get Conversations", "GET", "/chat/conversations", 0, false, err.message);
  }

  // 6.2 Get Chat History
  try {
    const res = await fetch(`${BASE_URL}/chat/history/${user2Id}`, { headers: authHeaders1 });
    const data = await res.json();
    const payload = data.data || data;
    const historyList = payload.messages || (Array.isArray(payload) ? payload : null);
    const pass = res.status === 200 && Array.isArray(historyList);
    logResult("Get Chat History", "GET", `/chat/history/${user2Id}`, res.status, pass, `Messages: ${historyList?.length}`);
  } catch (err) {
    logResult("Get Chat History", "GET", `/chat/history/${user2Id}`, 0, false, err.message);
  }

  // 6.3 Mark Chat Messages As Read
  try {
    const res = await fetch(`${BASE_URL}/chat/read/${user2Id}`, {
      method: "PATCH",
      headers: authHeaders1,
    });
    const pass = res.status === 200;
    logResult("Mark Chat As Read", "PATCH", `/chat/read/${user2Id}`, res.status, pass);
  } catch (err) {
    logResult("Mark Chat As Read", "PATCH", `/chat/read/${user2Id}`, 0, false, err.message);
  }

  // -------------------------------------------------------------------
  // 7. NOTIFICATION MODULE
  // -------------------------------------------------------------------
  console.log("\n--- [7] NOTIFICATION APIS ---");

  // 7.1 Get Notifications
  try {
    const res = await fetch(`${BASE_URL}/notification`, { headers: authHeaders1 });
    const data = await res.json();
    const payload = data.data || data;
    const list = payload.notifications || payload;
    if (list.length > 0) {
      notificationId = list[0]._id;
    }
    const pass = res.status === 200 && Array.isArray(list);
    logResult("Get Notifications", "GET", "/notification", res.status, pass, `Count: ${list.length}`);
  } catch (err) {
    logResult("Get Notifications", "GET", "/notification", 0, false, err.message);
  }

  // 7.2 Get Unread Notification Count
  try {
    const res = await fetch(`${BASE_URL}/notification/unread-count`, { headers: authHeaders1 });
    const data = await res.json();
    const count = data.data?.unreadCount ?? data.unreadCount;
    const pass = res.status === 200 && typeof count === "number";
    logResult("Get Unread Count", "GET", "/notification/unread-count", res.status, pass, `Unread: ${count}`);
  } catch (err) {
    logResult("Get Unread Count", "GET", "/notification/unread-count", 0, false, err.message);
  }

  // 7.3 Mark Single Notification As Read
  if (notificationId) {
    try {
      const res = await fetch(`${BASE_URL}/notification/${notificationId}/read`, {
        method: "PATCH",
        headers: authHeaders1,
      });
      const pass = res.status === 200;
      logResult("Mark Single Notification Read", "PATCH", `/notification/${notificationId}/read`, res.status, pass);
    } catch (err) {
      logResult("Mark Single Notification Read", "PATCH", `/notification/${notificationId}/read`, 0, false, err.message);
    }
  }

  // 7.4 Mark All Notifications As Read
  try {
    const res = await fetch(`${BASE_URL}/notification/read-all`, {
      method: "PATCH",
      headers: authHeaders1,
    });
    const pass = res.status === 200;
    logResult("Mark All Notifications Read", "PATCH", "/notification/read-all", res.status, pass);
  } catch (err) {
    logResult("Mark All Notifications Read", "PATCH", "/notification/read-all", 0, false, err.message);
  }

  // -------------------------------------------------------------------
  // 8. UPLOAD MODULE (Split Profile & Post Endpoints with Server-Side Linking)
  // -------------------------------------------------------------------
  console.log("\n--- [8] UPLOAD APIS (SPLIT PROFILE & POST LOGIC) ---");

  // 1x1 transparent png pixel buffer helper
  const pixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const buffer = Buffer.from(pixelBase64, "base64");

  // 8.1 Profile Picture Upload & Server-Side Linking in 1 Call
  try {
    const profileForm = new FormData();
    const avatarBlob = new Blob([buffer], { type: "image/png" });
    profileForm.append("image", avatarBlob, "profile_avatar.png");
    profileForm.append("type", "avatar");

    const res = await fetch(`${BASE_URL}/upload/profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: profileForm,
    });
    const data = await res.json();
    const pass = res.status === 200 && data.data?.user?.avatar && data.data?.url;
    logResult(
      "Upload Profile Picture (Server-Side Link)",
      "POST",
      "/upload/profile-picture",
      res.status,
      pass,
      `Linked Avatar: ${data.data?.url || data.data?.user?.avatar}`,
    );
  } catch (err) {
    logResult("Upload Profile Picture (Server-Side Link)", "POST", "/upload/profile-picture", 0, false, err.message);
  }

  // 8.2 Post Picture Upload & Server-Side Linking to Existing Post in 1 Call
  if (createdPostId) {
    try {
      const postForm = new FormData();
      const postBlob = new Blob([buffer], { type: "image/png" });
      postForm.append("image", postBlob, "post_attachment.png");
      postForm.append("postId", createdPostId);

      const res = await fetch(`${BASE_URL}/upload/post-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token1}`,
        },
        body: postForm,
      });
      const data = await res.json();
      const pass = res.status === 200 && data.data?.post?.imageUrl;
      logResult(
        "Upload Post Picture (Server-Side Link to Post)",
        "POST",
        "/upload/post-picture",
        res.status,
        pass,
        `Linked Post Image: ${data.data?.post?.imageUrl}`,
      );
    } catch (err) {
      logResult("Upload Post Picture (Server-Side Link to Post)", "POST", "/upload/post-picture", 0, false, err.message);
    }
  }

  // 8.3 Create Post with Attached Picture in 1 Single Server-Sided Call
  try {
    const createPostForm = new FormData();
    const newPostBlob = new Blob([buffer], { type: "image/png" });
    createPostForm.append("title", "Post created with single multipart call");
    createPostForm.append("content", "Server uploaded image and linked it to post seamlessly!");
    createPostForm.append("image", newPostBlob, "direct_post_img.png");

    const res = await fetch(`${BASE_URL}/post/create-post`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: createPostForm,
    });
    const data = await res.json();
    const pass = res.status === 201 && (data.data?.imageUrl || data.imageUrl);
    logResult(
      "Create Post with Image (Single Call Link)",
      "POST",
      "/post/create-post",
      res.status,
      pass,
      `Post ID: ${data.data?._id || data.data?.id}, Image: ${data.data?.imageUrl}`,
    );
  } catch (err) {
    logResult("Create Post with Image (Single Call Link)", "POST", "/post/create-post", 0, false, err.message);
  }

  // 8.4 Legacy Image Upload (Backward Compatibility)
  try {
    const form = new FormData();
    const blob = new Blob([buffer], { type: "image/png" });
    form.append("image", blob, "test_pixel.png");

    const res = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: form,
    });
    const data = await res.json();
    const pass = res.status === 200 && (data.data?.url || data.url);
    const url = data.data?.url || data.url;
    logResult("Legacy Upload Image (Multipart)", "POST", "/upload/image", res.status, pass, `Returned URL: ${url}`);
  } catch (err) {
    logResult("Legacy Upload Image (Multipart)", "POST", "/upload/image", 0, false, err.message);
  }

  // -------------------------------------------------------------------
  // 9. CLEANUP / DELETE APIS
  // -------------------------------------------------------------------
  console.log("\n--- [9] CLEANUP & DELETION APIS ---");

  // 9.1 Delete Comment
  if (createdCommentId) {
    try {
      const res = await fetch(`${BASE_URL}/comment/${createdCommentId}`, {
        method: "DELETE",
        headers: authHeaders2,
      });
      const pass = res.status === 200;
      logResult("Delete Comment", "DELETE", `/comment/${createdCommentId}`, res.status, pass);
    } catch (err) {
      logResult("Delete Comment", "DELETE", `/comment/${createdCommentId}`, 0, false, err.message);
    }
  }

  // 9.2 Delete Post
  if (createdPostId) {
    try {
      const res = await fetch(`${BASE_URL}/post/${createdPostId}`, {
        method: "DELETE",
        headers: authHeaders1,
      });
      const pass = res.status === 200;
      logResult("Delete Post", "DELETE", `/post/${createdPostId}`, res.status, pass);
    } catch (err) {
      logResult("Delete Post", "DELETE", `/post/${createdPostId}`, 0, false, err.message);
    }
  }

  // 9.3 Logout
  if (token1 && refreshToken1) {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token1, refreshToken: refreshToken1 }),
      });
      const pass = res.status === 200;
      logResult("Logout User", "POST", "/auth/logout", res.status, pass);
    } catch (err) {
      logResult("Logout User", "POST", "/auth/logout", 0, false, err.message);
    }
  }

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = total - passed;
  console.log(`📊 TOTAL ENDPOINTS TESTED: ${total}`);
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    console.log("\n⚠️ FAILED ENDPOINTS DETAIL:");
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  - [${r.method}] ${r.endpoint}: HTTP ${r.status} (${r.name}) ${r.details}`);
    });
  }
}

run();
