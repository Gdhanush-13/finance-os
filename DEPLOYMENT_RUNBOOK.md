# Deployment Runbook & Production Checklist

## 1. Backend Deployment (e.g., Render, Railway, Heroku)

### Prerequisites
1. **MongoDB Atlas Account**: Set up a cluster, add a database user with least-privilege, and whitelist the server IPs (or allow access from anywhere `0.0.0.0/0` if platform IP is dynamic).
2. **Environment Secrets**: Do not commit secrets. Configure the following environment variables in your hosting provider:
   - `NODE_ENV`: `production`
   - `PORT`: (Provided by host or `5000`)
   - `MONGO_URI`: The MongoDB Atlas connection string. Example: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority`
   - `JWT_SECRET`: A securely generated random string (min 32 characters, preferably 64). You can generate one via `openssl rand -hex 32`.
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGINS`: The URL of your deployed frontend (e.g., `https://finance-os.vercel.app`).
   - `RATE_LIMIT_WINDOW_MS`: `900000` (15 mins)
   - `RATE_LIMIT_MAX`: `300` (Requests per IP)

### Deployment Steps
1. Connect your GitHub repository to your backend hosting platform.
2. Set the Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Ensure Health check endpoint (`GET /health`) is returning `status: "ok"`.

---

## 2. Frontend Deployment (Vercel)

### Prerequisites
1. **Vercel Account** linked to your GitHub.
2. **Environment Variable**: 
   - `VITE_API_BASE_URL`: The URL of your deployed backend API (e.g., `https://finance-os-api.onrender.com`). Do not append `/api` if your client app handles it, or do, depending on your `lib/api.js` setup.

### Deployment Steps
1. Import your GitHub repository to Vercel.
2. Edit Project Framework preset to `Vite`.
3. Set the Root Directory to `client/finance-ui`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Enter environment variables.
7. Click "Deploy". The `vercel.json` included in the directory will handle SPA rewrite behaviors automatically.

---

## 3. Post-Deployment Validation

- [ ] Create a new user account on the live site.
- [ ] Log in and verify that a JWT is received and stored.
- [ ] Create a new account and verify it persists.
- [ ] Add a transaction and check that the balance updates.
- [ ] Verify CORS is blocking requests from unauthorized origins (e.g., using Postman without origin headers).
- [ ] Check backend logs for any startup errors or unhandled rejections.

## Important Note on Secrets
- Never commit your `MONGO_URI` or `JWT_SECRET` to Git. 
- Share secrets only as local `.env` values with developers securely.
