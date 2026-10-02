# Expense Tracker — Deploy Guide (Roman Hindi)

## App ko apne computer pe test karna (optional)
```
npm install
npm run dev
```

## Website LIVE karna — Step by Step

### Step 1: GitHub account banao
- github.com pe jaake free account banao (agar nahi hai)

### Step 2: Yeh folder GitHub pe upload karo
- github.com pe "New repository" banao (naam: expense-tracker)
- Is poore folder ko upload kar do (GitHub website pe "uploading an existing file" option se, ya `git` command se)

### Step 3: Vercel pe account banao
- vercel.com pe jaake "Sign up" karo — GitHub account se login karo (1 click)

### Step 4: Project import karo
- Vercel dashboard mein "Add New Project" pe click karo
- Apni GitHub repository (expense-tracker) select karo
- "Deploy" button dabao — bas!

### Step 5: Tumhara app LIVE hai
- 1-2 minute mein Vercel tumhe ek link dega jaise: `expense-tracker-yourname.vercel.app`
- Yeh link kisi ke saath bhi share kar sakte ho — woh browser mein khol ke use kar sakta hai

## Important note
Abhi data phone/browser ke andar hi save hota hai (localStorage) — matlab har user ka apna alag data hoga uske device pe, but agar woh apna browser data clear karega to expenses delete ho jayenge. Real multi-device app (jahan login karke kahin se bhi apna data dekh sako) ke liye baad mein database (Firebase/Supabase) add karna padega — jab zarurat ho tab bata dena, woh bhi bana dunga.
