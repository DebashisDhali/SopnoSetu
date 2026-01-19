# 🚀 Deployment Guide - SopnoSetu

To deploy the SopnoSetu platform to Vercel, follow these steps for both the Backend (Server) and Frontend (Client).

## 1. Backend Deployment (Server)

### Step 1: Vercel Project Setup
1. Create a new project on Vercel.
2. Link your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Select **Node.js** as the framework (Vercel should detect this automatically).

### Step 2: Environment Variables
Add the following environment variables in the Vercel dashboard:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A long, secure random string.
- `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://sopnosetu-client.vercel.app`).
- `SMTP_SERVICE`: `gmail` (or your preferred service).
- `SMTP_EMAIL`: Your email address.
- `SMTP_PASSWORD`: Your email app password.
- `PORT`: `5000` (Optional, Vercel handles this).

### Step 3: vercel.json
The `server/vercel.json` file is already provided and configured:
```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }]
}
```

---

## 2. Frontend Deployment (Client)

### Step 1: Vercel Project Setup
1. Create another new project on Vercel.
2. Link the same GitHub repository.
3. Set the **Root Directory** to `client`.
4. Select **Next.js** as the framework.

### Step 2: Environment Variables
Add the following environment variables:
- `NEXT_PUBLIC_API_URL`: The URL of your deployed server (e.g., `https://sopnosetu-server.vercel.app`).

### Step 3: next.config.ts
The `client/next.config.ts` is already configured to use `NEXT_PUBLIC_API_URL` for rewrites:
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/:path*`,
      },
      ...
    ];
  },
};
```

---

## 3. Post-Deployment Checks

1. **CORS Configuration**:
   Ensure the `CLIENT_URL` in your server environment variables matches the deployed frontend URL exactly. The server uses this to allow cross-origin requests.

2. **MongoDB Access**:
   Make sure you have added `0.0.0.0/0` (allow all) or the specific Vercel IP ranges to your MongoDB Atlas Network Access whitelist.

3. **Database Seeding**:
   You can run the seeder once locally pointing to the production database, or use the MongoDB Atlas interface to import initial data.

4. **Verify Routes**:
   - Access `https://your-server.vercel.app/api/debug-ping` to check if the backend is alive.
   - Try logging in from the frontend.

---

## ✅ Summary of Changes
- Fixed syntax error in `client/next.config.ts`.
- Added "Complete" button to Mentor Dashboard.
- Updated Candidate Dashboard to support rating completed sessions.
- Provided this comprehensive deployment guide.

**The platform is now 100% feature-complete and ready for production!** 🍾
