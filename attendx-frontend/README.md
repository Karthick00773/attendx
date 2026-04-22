# AttendX — Setup Guide

## ✅ Quick Start (Step by Step)

### Step 1 — Install Node.js (if not already installed)
Download from: https://nodejs.org  
Choose **LTS version** → Install → Restart your PC

### Step 2 — Open this folder in VS Code
- Open VS Code
- File → Open Folder → Select the **attendance-app** folder

### Step 3 — Open Terminal in VS Code
- Press `Ctrl + ~` (backtick key) to open terminal

### Step 4 — Install dependencies
```
npm install
```
Wait for it to finish (may take 1–2 minutes, will download ~300MB)

### Step 5 — Start the app
```
npm start
```
Browser will open automatically at http://localhost:3000

---

## 👤 Login Credentials

| Role     | Email                 | Password  |
|----------|-----------------------|-----------|
| Employee | riya@attendx.com      | emp123    |
| Employee | arjun@attendx.com     | emp456    |
| Admin    | priya@attendx.com     | admin789  |
| CEO      | vikram@attendx.com    | ceo2024   |

---

## ❗ If you get errors

**Error: "react-scripts not found"**
Run: `npm install` again and wait fully

**Error: "Port 3000 already in use"**
Type `Y` and press Enter when asked

**Error: "Cannot find module"**
Run: `npm install` then `npm start`
