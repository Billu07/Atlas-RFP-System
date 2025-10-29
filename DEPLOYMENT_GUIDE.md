# 🚀 Deployment Guide - Atlas RFP System

Complete step-by-step guide to deploy your RFP system to production.

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] Airtable account created
- [ ] Airtable base set up with correct schema
- [ ] Airtable API credentials (Base ID and Personal Access Token)
- [ ] Changed admin password from default
- [ ] Tested system locally
- [ ] Company logo ready (optional)

---

## Part 1: Airtable Setup (15 minutes)

### Step 1.1: Create Airtable Account

1. Go to https://airtable.com
2. Sign up for free account
3. Verify your email

### Step 1.2: Create Base

1. Click "Create a base" → "Start from scratch"
2. Name it: **Atlas RFP System**
3. You'll see one default table

### Step 1.3: Create Tables

Follow the schema in `AIRTABLE_SETUP.md`. Create 4 tables:

**Table 1: RFPs**

- Delete the default fields
- Add these fields (in this exact order):
  - `RFP ID` - Auto Number
  - `RFP Name` - Single line text
  - `Objective` - Long text
  - `Scope` - Long text
  - `Timeline` - Long text
  - `Budget Guidance` - Single line text
  - `Submission Deadline` - Date (format: MM/DD/YYYY)
  - `Status` - Single select (Options: Draft, Active, Closed, Archived)
  - `Owner` - Single line text
  - `Owner Email` - Email
  - `Created Date` - Created time
  - `Last Modified` - Last modified time

**Table 2: Vendors**

- Click the "+" next to your first table to add new table
- Name it "Vendors"
- Add these fields:
  - `Vendor ID` - Auto Number
  - `Vendor Name` - Single line text
  - `Contact Person` - Single line text
  - `Email` - Email
  - `Phone` - Phone number
  - `Website` - URL
  - `Country` - Single line text
  - `NDA on File` - Checkbox
  - `Status` - Single select (Options: Invited, Submitted, Shortlisted, Declined, Not Invited)
  - `Internal Notes` - Long text
  - `Date Added` - Created time

**Table 3: Submissions**

- Add third table named "Submissions"
- Add these fields:
  - `Submission ID` - Auto Number
  - `RFP` - Link to another record (Link to: RFPs table)
  - `Vendor` - Link to another record (Link to: Vendors table)
  - `Submitted Date` - Created time
  - `Vendor Name` - Single line text
  - `Contact Person` - Single line text
  - `Email` - Email
  - `Phone` - Phone number
  - `Website` - URL
  - `Country` - Single line text
  - `Base Price` - Currency (Format: USD, 2 decimals)
  - `Currency` - Single select (Options: USD, EUR, GBP, CAD)
  - `Timeline (Days)` - Number (Integer)
  - `Optional Add-ons` - Long text
  - `Assumptions` - Long text
  - `Exceptions` - Long text
  - `Proposal File` - Attachment
  - `Supporting Files` - Attachment
  - `Internal Rating` - Single select (Options: 1-Star, 2-Star, 3-Star, 4-Star, 5-Star)
  - `Internal Notes` - Long text
  - `Review Status` - Single select (Options: Pending, Under Review, Shortlisted, Rejected)
  - `NDA Confirmed` - Checkbox

**Table 4: Decisions** (Optional)

- Add fourth table named "Decisions"
- Add these fields:
  - `Decision ID` - Auto Number
  - `RFP` - Link to another record (Link to: RFPs table)
  - `Selected Vendor` - Link to another record (Link to: Vendors table)
  - `Selected Submission` - Link to another record (Link to: Submissions table)
  - `Contract Value` - Currency
  - `Decision Date` - Date
  - `Decision Notes` - Long text

### Step 1.4: Create Views

**In RFPs table:**

- Default view is "All RFPs" (Grid view) ✓
- Create view "Active RFPs": Click "Grid view" → Create → Grid view
  - Name it "Active RFPs"
  - Add filter: Status = Active
- Create view "Closed RFPs":
  - Filter: Status = Closed

**In Submissions table:**

- Create view "By RFP":
  - Change view type to "Group"
  - Group by: RFP field
- Create view "Shortlist":
  - Filter: Review Status = Shortlisted
- Create view "Pending Review":
  - Filter: Review Status = Pending

**In Vendors table:**

- Create view "Active Bidders":
  - Filter: Status is Submitted OR Shortlisted

### Step 1.5: Get API Credentials

1. Click your profile icon (top right)
2. Go to "Developer hub"
3. Click "Personal access tokens"
4. Click "Create new token"
5. Name it: "RFP System"
6. Add these scopes:
   - ✓ data.records:read
   - ✓ data.records:write
   - ✓ schema.bases:read
7. Add access to your "Atlas RFP System" base
8. Click "Create token"
9. **COPY THE TOKEN** - You won't see it again!

### Step 1.6: Get Base ID

1. Go to https://airtable.com/api
2. Click on your "Atlas RFP System" base
3. Look at the URL - it will be like: `https://airtable.com/appXXXXXXXXXXXXXX/api/docs`
4. The `appXXXXXXXXXXXXXX` part is your Base ID
5. Copy it!

### Step 1.7: Add Test Data

Add one test RFP to verify everything works:

- RFP Name: "Test Project"
- Objective: "Testing the system"
- Status: Active
- Submission Deadline: 7 days from today
- Owner: Your name
- Owner Email: Your email

---

## Part 2: Local Configuration (5 minutes)

### Step 2.1: Create Config File

1. In your project folder, copy the example config:

   ```bash
   cp config.example.js config.js
   ```

2. Open `config.js` in your text editor

3. Replace these values:

   ```javascript
   airtable: {
     baseId: 'appXXXXXXXXXXXXXX',  // Paste your Base ID here
     apiKey: 'patXXXXXXXXXXXXXX',  // Paste your Personal Access Token here
     // ... keep the rest
   }
   ```

4. **CHANGE THE ADMIN PASSWORD**:

   ```javascript
   admin: {
     username: 'admin',
     password: 'MySecurePassword123!'  // Change this!
   }
   ```

5. (Optional) Update branding:

   ```javascript
   branding: {
     companyName: 'Atlas Consulting',
     primaryColor: '#2563eb',  // Your brand color
     // ...
   }
   ```

6. Save the file

### Step 2.2: Add Logo (Optional)

1. Place your company logo at: `/assets/images/logo.png`
2. Recommended size: 200x200px (transparent background)
3. Format: PNG

---

## Part 3: Local Testing (10 minutes)

### Step 3.1: Start Local Server

**Option A: Using Python**

```bash
python -m http.server 8080
```

**Option B: Using Node.js**

```bash
npx http-server . -p 8080
```

**Option C: Using VS Code**

- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Step 3.2: Test Public Portal

1. Open browser: `http://localhost:8080`
2. You should see the landing page
3. Your test RFP should appear
4. Click "View Details & Submit"
5. Try filling out the form (don't submit yet)

### Step 3.3: Test Admin Dashboard

1. Go to: `http://localhost:8080/admin/login.html`
2. Login with:
   - Username: `admin`
   - Password: (the one you set in config.js)
3. You should see the dashboard
4. Check that stats are showing
5. Go to "RFPs" section - your test RFP should appear
6. Try creating a new RFP (you can delete it later)

### Step 3.4: Test Submission

1. Go back to public portal
2. Submit a test bid for your test RFP
3. Use fake data (you'll delete this later)
4. Submit the form
5. Go to admin dashboard → Submissions
6. Your test submission should appear

**If everything works, you're ready to deploy!**

---

## Part 4: Deploy to Vercel (10 minutes)

### Step 4.1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 4.2: Deploy

1. Open terminal in your project folder

2. Run:

   ```bash
   vercel
   ```

3. Follow the prompts:

   - "Set up and deploy...?" → **Yes**
   - "Which scope?" → Choose your account
   - "Link to existing project?" → **No**
   - "What's your project's name?" → **atlas-rfp-system** (or your choice)
   - "In which directory is your code located?" → **./** (press Enter)
   - "Want to modify these settings?" → **No**

4. Wait for deployment (usually 30-60 seconds)

5. You'll get a URL like: `https://atlas-rfp-system-xxx.vercel.app`

### Step 4.3: Set Up Environment Variables (Important!)

Your config.js won't be deployed (it's in .vercelignore for security). You need to use environment variables:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:

   ```
   AIRTABLE_BASE_ID = appXXXXXXXXXXXXXX
   AIRTABLE_API_KEY = patXXXXXXXXXXXXXX
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = YourSecurePassword123!
   ```

5. Click "Save"

### Step 4.4: Update Config for Production

Create a file `/assets/js/config-loader.js`:

```javascript
// Load config from environment variables in production
const CONFIG = {
  airtable: {
    baseId: process.env.AIRTABLE_BASE_ID || "YOUR_BASE_ID",
    apiKey: process.env.AIRTABLE_API_KEY || "YOUR_API_KEY",
    tables: {
      rfps: "RFPs",
      vendors: "Vendors",
      submissions: "Submissions",
      decisions: "Decisions",
    },
  },
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "change-this",
  },
  branding: {
    companyName: "Atlas Consulting",
    logoUrl: "/assets/images/logo.png",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
  },
};
```

### Step 4.5: Redeploy

```bash
vercel --prod
```

### Step 4.6: Test Production Site

1. Go to your Vercel URL
2. Test the public portal
3. Test admin login
4. Create a new RFP
5. Test submission

---

## Part 5: Go Live (5 minutes)

### Step 5.1: Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., rfp.atlasconsulting.com)
3. Follow DNS configuration instructions
4. Wait for DNS to propagate (5-30 minutes)

### Step 5.2: Clean Up Test Data

1. Delete test RFP from Airtable
2. Delete test submission
3. Keep test vendor if you want

### Step 5.3: Create First Real RFP

1. Log in to admin dashboard
2. Go to RFPs section
3. Click "Create New RFP"
4. Fill in real details
5. Set status to "Active"
6. Copy the public link

### Step 5.4: Share with Vendors

**Option 1: Email invitation**

```
Subject: Invitation to Submit Proposal - [RFP Name]

Dear [Vendor Name],

You are invited to submit a proposal for [RFP Name].

Please visit our RFP portal to view details and submit your bid:
[Your Vercel URL]/public/rfp-detail.html?id=[RFP Record ID]

Submission Deadline: [Date]

If you have any questions, please contact us at rfp@atlasconsulting.com

Best regards,
Atlas Consulting Team
```

**Option 2: Use "Copy Link" button in admin**

- Go to RFPs section
- Click "Copy Link" on the RFP
- Paste in email to vendors

---

## 🎉 You're Live!

Your RFP system is now live and ready to accept submissions!

## 📊 Next Steps

1. Monitor the admin dashboard daily
2. Review submissions as they come in
3. Rate and shortlist vendors
4. Use internal notes for team collaboration

## 🔒 Security Reminders

- ✅ Never share your Airtable API key
- ✅ Never commit config.js to git
- ✅ Change admin password periodically
- ✅ Use HTTPS only (Vercel provides this)
- ✅ Log out of admin when not in use

## 🆘 Troubleshooting

### "Configuration not found" on deployed site

- Make sure environment variables are set in Vercel
- Redeploy after adding variables

### Admin login not working

- Check environment variables in Vercel
- Clear browser cache
- Try incognito mode

### RFPs not loading

- Verify Airtable credentials in environment variables
- Check Airtable API status
- Look at browser console for errors

---

## 📞 Support Checklist

If something goes wrong:

1. ✅ Check browser console (F12)
2. ✅ Verify Airtable credentials
3. ✅ Check Vercel deployment logs
4. ✅ Test in incognito mode
5. ✅ Compare with local working version

---

**Congratulations! Your RFP system is live! 🚀**
