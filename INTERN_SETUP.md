# 🚀 Green Silicon Valley - Intern Setup Guide

Welcome to Green Silicon Valley! This guide will help you get the project running locally on your machine. Follow these steps carefully and you'll be up and running in no time.

## 📋 Prerequisites

Before you start, make sure you have these installed:

### **Required Software**
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
  - Verify with: `node --version` (should show 18.x.x or higher)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
  - Verify with: `git --version`
- **GitHub Account** - Access to the Green Silicon Valley repository

### **Recommended**
- **Visual Studio Code** or your preferred code editor
- **Terminal/Command Prompt** (Git Bash on Windows, Terminal on Mac/Linux)

---

## 📥 Step 1: Clone the Repository

1. Open your terminal/command prompt
2. Navigate to where you want to store the project (e.g., your Documents folder)
3. Run this command:

```bash
git clone https://github.com/Ayush1298567/green-silicon-valley.git
cd green-silicon-valley
```

**Expected output:**
```
Cloning into 'green-silicon-valley'...
remote: Enumerating objects: XXXX, done.
remote: Counting objects: 100% (XXXX/XXXX), done.
...
```

---

## 📦 Step 2: Install Dependencies

1. Make sure you're in the project directory (`cd green-silicon-valley`)
2. Run the install command:

```bash
npm install
```

**This will take 2-5 minutes.** You'll see lots of progress messages.

**Expected output (at the end):**
```
added XXX packages from XXX contributors and audited XXX packages in X.Xs
```

**⚠️ If you get errors:**
- Make sure Node.js is version 18+
- Try `npm install --force` if it fails
- Check your internet connection

---

## 🔧 Step 3: Environment Setup

The app needs some configuration to connect to our database and services.

### **3.1 Copy Environment Template**

```bash
cp .env.local.example .env.local
```

### **3.2 Edit Environment Variables**

Open `.env.local` in your code editor and verify these settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rwcxtfwrkjmpltkwextr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=my-random-secret-key-change-this

# AI Configuration (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Automation
AUTOMATION_TIMES=03:30,20:00
CRON_SECRET=change-me-securely
```

**✅ What to check:**
- Supabase URL should be `https://rwcxtfwrkjmpltkwextr.supabase.co`
- Keys should match the ones in `.env.local.example`
- `NEXT_PUBLIC_BASE_URL` should be `http://localhost:3000`
- `NEXTAUTH_SECRET` should be changed to a random string (not the placeholder)

---

## 🗄️ Step 4: Database Setup

The app uses Supabase as its database. The database tables are already set up, but you need to run a small SQL script to create the users table.

### **4.1 Access Supabase SQL Editor**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Find the "Green Silicon Valley" project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### **4.2 Run This SQL Script**

Copy and paste this entire SQL script into the SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text,
  email text UNIQUE,
  role text CHECK (role IN ('founder','intern','volunteer','teacher','partner')) DEFAULT 'teacher',
  permissions jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow authenticated users to insert (for first login)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### **4.3 Click "Run"**

- Click the **"Run"** button (or press Ctrl+Enter)
- You should see: `Success. No rows returned.`

**⚠️ If you get errors:**
- Make sure you're in the correct Supabase project
- Check that the SQL is copied exactly as shown
- Try refreshing the page and running again

---

## 🚀 Step 5: Start Development Server

Now you're ready to start the application!

```bash
npm run dev
```

**Expected output:**
```
- ready - started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully in XXX ms
```

**🎉 Success!** Open your browser and go to: **http://localhost:3000**

---

## ✅ Step 6: Verify Everything Works

### **6.1 Check the Homepage**
- You should see the Green Silicon Valley homepage
- No console errors in browser developer tools (F12 → Console tab)

### **6.2 Test Login (Optional)**
- Click "Login" or "Sign In"
- Try signing in with Google (it should work if OAuth is configured)
- If you see founder features, the setup worked perfectly!

### **6.3 Check Console**
- Open browser developer tools (F12)
- Go to Console tab
- Should NOT see errors like:
  - `useEffect is not defined`
  - `localStorage is not defined`
  - `fake-supabase 404` errors

---

## 🔧 Troubleshooting

### **❌ "npm install" fails**
```
Error: ENOENT, stat 'C:\Users\...\node_modules'
```

**Solutions:**
- Delete `node_modules` folder: `rm -rf node_modules`
- Clear npm cache: `npm cache clean --force`
- Try again: `npm install`

### **❌ "useEffect is not defined" error**
- This was fixed in the codebase, but if you see it:
- Check `components/newsletter/NewsletterBar.tsx`
- Make sure line 2 imports both `useState` and `useEffect`

### **❌ "fake-supabase" 404 errors**
- Check your `.env.local` file
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is correct
- Make sure the Supabase keys are not placeholder values
- Restart the dev server: `Ctrl+C` then `npm run dev`

### **❌ Port 3000 already in use**
- Kill the process: `npx kill-port 3000`
- Or use a different port: `npm run dev -- -p 3001`

### **❌ Database connection errors**
- Make sure you ran the SQL script in Supabase SQL Editor
- Check that the users table was created successfully
- Verify your Supabase credentials are correct

---

## 📞 Getting Help

If you're stuck:

1. **Check this guide again** - you might have missed a step
2. **Check the main README.md** - has additional troubleshooting
3. **Ask a senior developer** - show them your exact error messages
4. **Check the terminal output** - copy-paste errors for help

### **Useful Commands**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check git version
git --version

# Clear all caches and restart
rm -rf node_modules .next
npm install
npm run dev

# Check if port 3000 is available
netstat -ano | findstr :3000
```

---

## 🎯 Next Steps

Once everything is working:

1. **Explore the codebase** - look at the `app/` directory structure
2. **Try different user roles** - founder, intern, volunteer dashboards
3. **Test features** - messaging, checklists, media upload
4. **Read the main README.md** - learn about advanced features
5. **Start contributing** - pick an issue from GitHub and work on it!

---

## 📚 Additional Resources

- **Main README.md** - Project overview and advanced features
- **COMPLETE_SETUP_GUIDE.md** - Detailed technical setup
- **QUICK_SETUP.md** - Alternative quick setup method
- **Project Structure** - Explore the `app/` and `components/` folders

**Happy coding! 🌱**
