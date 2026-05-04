# 🗳️ West Bengal Election Results 2026 — Live Dashboard

A real-time election results dashboard that scrapes data from the Election Commission of India website and displays it in a beautiful dark-themed UI.

## Features
- ⚡ Real-time data from ECI (results.eci.gov.in)
- 🔄 Auto-refreshes every 60 seconds
- 📊 Donut chart, bar charts, majority meter
- 🎨 Dark theme with party-color coded visuals
- 📱 Mobile responsive
- 🚀 One-click deploy to Vercel

---

## 🚀 Deploy to Vercel (Free — Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "WB Election Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wb-election.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **Deploy** — that's it!

Your site will be live at: `https://wb-election-YOUR_NAME.vercel.app`

---

## 🛠️ Run Locally

```bash
npm install
npm start
# Open http://localhost:3000
```

---

## 📡 How It Works

1. `/api/results` — Node.js serverless function that:
   - Fetches HTML from `results.eci.gov.in`
   - Parses the results table with `node-html-parser`
   - Returns JSON with party-wise seats data
   - Has a fallback to last known data if ECI is unreachable

2. `public/index.html` — Frontend that:
   - Calls `/api/results` on load
   - Auto-refreshes every 60 seconds
   - Renders charts, cards, table, meter

---

## 🌐 Alternative Free Deployment Platforms

### Railway.app
```bash
npm install -g railway
railway login
railway init
railway up
```

### Render.com
1. Create account at render.com
2. New Web Service → Connect GitHub
3. Build: `npm install`, Start: `npm start`

### Glitch.com
1. Go to glitch.com → New Project → Import from GitHub

---

## ⚠️ Disclaimer
This project is for **educational purposes only**. Data is sourced from the official Election Commission of India website (results.eci.gov.in). No data is stored or modified.
