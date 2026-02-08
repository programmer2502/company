# Vercel Configuration Guide

The 404 error you are seeing is because Vercel is likely trying to serve the project from the wrong folder. Since your frontend code is inside the `client` folder, you need to tell Vercel to look there.

Please go to your **Vercel Project Dashboard** -> **Settings** -> **General** -> **Build & Development Settings** and configure it EXACTLY as follows:

## Option 1: Root Directory (RECOMMENDED)

1. **Framework Preset**: Vite
2. **Root Directory**: `client` (You must click "Edit" and clearer the field if it is `.` or just type `client`)
3. **Build Command**: `vite build` (or leave default if Framework Preset is Vite)
4. **Output Directory**: `dist` (or leave default if Framework Preset is Vite)
5. **Install Command**: `npm install` (or leave default)

## Option 2: If you cannot change Root Directory

If you keep Root Directory as `.`:

1. **Build Command**: `cd client && npm install && npm run build`
2. **Output Directory**: `client/dist`

---

**After changing these settings, you MUST go to the "Deployments" tab and Redeploy the latest commit for changes to take effect.**
