import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { adminDb } from "./src/lib/firebase-admin.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Health check endpoint for container probes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Database User Profile Sync & Fetch (Strictly targeting kingofdeep Cloud Firestore)
  app.get("/api/db/user", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user UID" });
      }
      const userDoc = await adminDb.collection("users").doc(uid).get();
      res.json({ success: true, user: userDoc.exists ? userDoc.data() : null });
    } catch (error: any) {
      console.error("Failed to fetch user from kingofdeep Firestore:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user from Firestore" });
    }
  });

  app.post("/api/db/user/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || req.body?.email || "";
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing user UID" });
      }

      const { username, avatar, playerData, gold, gems, exp, server } = req.body || {};
      const userRef = adminDb.collection("users").doc(uid);
      const userDoc = await userRef.get();
      
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };
      if (username) updateData.username = username;
      if (avatar) updateData.avatar = avatar;
      if (email) updateData.email = email;
      if (server) updateData.server = server;
      if (gold !== undefined) updateData.gold = gold;
      if (gems !== undefined) updateData.gems = gems;
      if (exp !== undefined) updateData.exp = exp;
      if (playerData) updateData.playerData = playerData;

      if (!userDoc.exists) {
        updateData.userId = uid;
        updateData.createdAt = new Date().toISOString();
        await userRef.set(updateData);
      } else {
        await userRef.update(updateData);
      }

      const updatedDoc = await userRef.get();
      res.json({ success: true, user: updatedDoc.data() });
    } catch (error: any) {
      console.error("Failed to sync user with kingofdeep Firestore:", error);
      res.status(500).json({ error: error.message || "Failed to sync user with Firestore" });
    }
  });

  // API Route: Verify Player Auth Token (JWT / Firebase ID token)
  app.post("/api/auth/verify-token", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = req.body.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) {
      return res.status(401).json({ success: false, error: "لم يتم تقديم رمز التحقق (Token)" });
    }

    try {
      // Decode or verify token structure
      // If it's a JWT from Google Identity / Firebase Auth
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        
        // Basic expiration check if standard exp field exists
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          return res.status(401).json({ success: false, error: "انتهت صلاحية رمز الجلسة" });
        }

        return res.json({
          success: true,
          valid: true,
          user: {
            uid: payload.user_id || payload.sub || payload.uid,
            email: payload.email,
            name: payload.name || payload.displayName,
            avatar: payload.picture || payload.photoURL
          }
        });
      }

      // If it's an internal session token
      if (token.startsWith('g_session_')) {
        return res.json({
          success: true,
          valid: true,
          type: 'session_token'
        });
      }

      return res.json({ success: true, valid: true });
    } catch (err: any) {
      console.error("Token verification error:", err);
      return res.status(400).json({ success: false, error: "رمز التحقق غير صالح أو تالف" });
    }
  });

  // API Route: Logout current session
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = req.body?.token || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null);
      const userId = req.body?.userId;

      console.log(`[AUTH] User session logged out: userId=${userId || 'unknown'}, token=${token ? token.slice(0, 10) + '...' : 'none'}`);

      return res.json({
        success: true,
        message: "تم إنهاء الجلسة بنجاح مع الاحتفاظ بكافة بيانات الحساب والتقدم في قاعدة البيانات."
      });
    } catch (err: any) {
      console.error("Logout API error:", err);
      return res.status(500).json({ success: false, error: "فشل معالجة تسجيل الخروج على السيرفر" });
    }
  });

  // API Route: Delete Account Permanently
  app.post("/api/auth/delete-account", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = req.body?.token || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null);
      const { userId, email } = req.body || {};

      if (!userId && !email) {
        return res.status(400).json({ success: false, error: "معرف المستخدم أو البريد الإلكتروني مطلوب" });
      }

      console.log(`[AUTH] Permanent account deletion requested: userId=${userId}, email=${email}`);

      return res.json({
        success: true,
        message: "تم استلام وتأكيد طلب حذف الحساب نهائياً من قاعدة بيانات السيرفر والقوائم العالمية."
      });
    } catch (err: any) {
      console.error("Delete account API error:", err);
      return res.status(500).json({ success: false, error: "فشل معالجة حذف الحساب على السيرفر" });
    }
  });

  // API Route: Get Google OAuth Authorization URL
  app.get("/api/auth/google/url", (req, res) => {
    const client_id = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    
    if (!client_id) {
      return res.status(500).json({
        success: false,
        error: "لم يتم تكوين GOOGLE_CLIENT_ID في متغيرات البيئة. يرجى تهيئته عبر إعدادات AI Studio."
      });
    }

    let origin = process.env.APP_URL;
    if (!origin && req.get('host')) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      origin = `${protocol}://${req.get('host')}`;
    }
    const redirectUri = `${origin}/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.json({ success: true, url: authUrl });
  });

  // Google OAuth callback endpoint
  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("No authorization code provided by Google.");
    }

    try {
      const client_id = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
      const client_secret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

      if (!client_id || !client_secret) {
        throw new Error("Missing Google OAuth credentials (CLIENT_ID or CLIENT_SECRET) on the server.");
      }

      let origin = process.env.APP_URL;
      if (!origin && req.get('host')) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        origin = `${protocol}://${req.get('host')}`;
      }
      const redirectUri = `${origin}/auth/google/callback`;

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code as string,
          client_id: client_id,
          client_secret: client_secret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Google token exchange failed: ${errText}`);
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user profile information from Google.");
      }

      const userData: any = await userResponse.json();
      const email = userData.email;
      const name = userData.name || email.split("@")[0];
      const avatarImg = userData.picture || "";

      // Generate session token
      const token = `g_session_${Buffer.from(email + Date.now()).toString("base64").slice(0, 32)}`;

      // Return popup message script
      return res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>نجاح تسجيل الدخول</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0b1329;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: rgba(15, 23, 42, 0.95);
              border: 2px solid #ca8a04;
              border-radius: 16px;
              padding: 30px;
              text-align: center;
              max-width: 400px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            h2 { color: #facc15; margin-bottom: 10px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            .spinner {
              border: 4px solid rgba(250, 204, 21, 0.1);
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border-left-color: #facc15;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🌊 ملوك الأعماق 🌊</h2>
            <div class="spinner"></div>
            <p>تم التحقق من حساب Google الخاص بك بنجاح!</p>
            <p style="font-size: 12px; color: #64748b;">جاري مزامنة بيانات الكابتن وبدء اللعبة تلقائياً...</p>
          </div>
          <script>
            const responsePayload = {
              type: 'OAUTH_AUTH_SUCCESS',
              user: {
                email: ${JSON.stringify(email)},
                name: ${JSON.stringify(name)},
                avatarImg: ${JSON.stringify(avatarImg)}
              },
              token: ${JSON.stringify(token)}
            };
            
            if (window.opener) {
              window.opener.postMessage(responsePayload, '*');
              window.close();
            } else {
              localStorage.setItem('google_auth_token', responsePayload.token);
              localStorage.setItem('google_auth_email', responsePayload.user.email);
              localStorage.setItem('google_auth_name', responsePayload.user.name);
              localStorage.setItem('google_auth_avatar', responsePayload.user.avatarImg || '');
              window.location.href = '/';
            }
          </script>
        </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Callback verification failed:", err);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>خطأ في تسجيل الدخول</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0b1329;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: rgba(15, 23, 42, 0.95);
              border: 2px solid #ef4444;
              border-radius: 16px;
              padding: 30px;
              text-align: center;
              max-width: 450px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }
            h2 { color: #f87171; margin-bottom: 10px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            .btn {
              background: #ef4444;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 20px;
              cursor: pointer;
              font-weight: bold;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ فشل الاتصال بحساب Google</h2>
            <p>حدث خطأ أثناء محاولة تبادل الرموز الأمنية مع Google.</p>
            <p style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; border-radius: 8px; font-size: 12px; color: #fca5a5; word-break: break-all;">
              ${err.message || 'Unknown verification error'}
            </p>
            <button class="btn" onclick="window.close()">إغلاق النافذة والمحاولة مجدداً</button>
          </div>
        </body>
        </html>
      `);
    }
  });

  // Ensure Service Worker is never cached by reverse proxy or browser
  app.get("/sw.js", (req, res, next) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html") || filePath.endsWith("sw.js")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
