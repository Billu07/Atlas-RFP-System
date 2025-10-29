# ☁️ Cloudinary Setup Guide - NDA File Upload

Complete guide to set up Cloudinary for automatic NDA file uploads to Airtable.

---

## 🎯 What This Does

When vendors upload their signed NDA:

1. ✅ File uploads to Cloudinary (cloud storage)
2. ✅ Cloudinary returns a secure URL
3. ✅ URL automatically stores in Airtable **Attachment field**
4. ✅ Admins can view/download NDA directly from Airtable
5. ✅ No manual file handling needed!

---

## 📋 Prerequisites

- Cloudinary account (free tier is perfect)
- Airtable base already set up
- Your RFP system files

**Time Required:** 15 minutes

---

## Part 1: Create Cloudinary Account (5 minutes)

### Step 1.1: Sign Up

1. Go to: https://cloudinary.com/users/register_free
2. Click **"Sign up for free"**
3. Fill in:
   - Email
   - Password
   - Company name (optional)
4. Verify your email

### Step 1.2: Get Your Credentials

1. Log in to Cloudinary dashboard
2. You'll see your **Dashboard** with:
   ```
   Cloud Name: dxxxxxxxxxxxxx
   API Key: 123456789012345
   API Secret: xxxxxxxxxxxxxxxxxxx
   ```
3. **Copy the Cloud Name** - you'll need this!

---

## Part 2: Create Upload Preset (5 minutes)

Upload presets allow **unsigned uploads** (no API secret needed in frontend).

### Step 2.1: Access Settings

1. Click **Settings** (gear icon) in bottom left
2. Click **Upload** tab
3. Scroll to **Upload presets** section
4. Click **Add upload preset**

### Step 2.2: Configure Preset

**Upload preset name:** `atlas_rfp_nda`

**Settings to configure:**

```
Signing Mode: Unsigned ✓ (IMPORTANT!)
Folder: atlas-rfp/ndas
Access mode: Public
Allowed formats: pdf, doc, docx
Max file size: 10 MB
```

**Other settings (keep default):**

- Use filename: No
- Unique filename: Yes
- Overwrite: No
- Resource type: Auto
- Delivery type: Upload

### Step 2.3: Save

1. Click **Save** at bottom
2. You'll see your preset name: `atlas_rfp_nda`
3. Copy this preset name!

---

## Part 3: Update Airtable Schema (3 minutes)

### Step 3.1: Add Attachment Field

1. Go to your **Vendors** table in Airtable
2. Click **+** to add a new field
3. Select **Attachment**
4. Name it: `NDA Document`
5. Click **Create field**

**That's it!** Airtable attachments work with URLs automatically.

---

## Part 4: Configure Your System (2 minutes)

### Step 4.1: Update config.js

1. Open your `config.js` file
2. Find the `cloudinary` section:

```javascript
cloudinary: {
  cloudName: 'YOUR_CLOUD_NAME',        // From Step 1.2
  uploadPreset: 'YOUR_UPLOAD_PRESET',   // From Step 2.3
},
```

3. Replace with your actual values:

```javascript
cloudinary: {
  cloudName: 'dxxxxxxxxxxxxx',          // Your actual cloud name
  uploadPreset: 'atlas_rfp_nda',        // Your preset name
},
```

4. **Save the file**

### Step 4.2: Test Configuration

```bash
# Start local server
npm start

# Go to signup page
http://localhost:8080/vendor/signup.html
```

---

## Part 5: Test the Upload (5 minutes)

### Step 5.1: Complete Registration

1. Fill out **Step 1** (company info)
2. Go to **Step 2** (NDA)
3. Click **Download NDA Template** (optional)
4. **Upload any PDF file** (for testing)

### Step 5.2: Watch the Upload

You should see:

```
filename.pdf (Uploading...)
↓
filename.pdf ✓ Uploaded
```

### Step 5.3: Check Cloudinary

1. Go to Cloudinary dashboard
2. Click **Media Library**
3. Click **atlas-rfp** folder → **ndas** folder
4. You should see your uploaded file!

### Step 5.4: Check Airtable

1. Complete the registration (Steps 3-4)
2. Go to Airtable → **Vendors** table
3. Find your new vendor record
4. Look at **NDA Document** field
5. **You should see the file!** 📎
6. Click to view/download

---

## ✅ Verification Checklist

**Before deploying to production:**

- [ ] Cloudinary account created
- [ ] Cloud name copied
- [ ] Upload preset created (`atlas_rfp_nda`)
- [ ] Upload preset is **Unsigned**
- [ ] Preset allows PDF/DOC/DOCX
- [ ] Airtable has **NDA Document** attachment field
- [ ] config.js updated with Cloud name and preset
- [ ] Tested locally - file uploads successfully
- [ ] File appears in Cloudinary dashboard
- [ ] File appears in Airtable attachment field
- [ ] Can download file from Airtable

---

## 🎨 Cloudinary Dashboard Features

### View Uploaded Files

**Path:** Media Library → atlas-rfp → ndas

You'll see all uploaded NDAs with:

- Filename
- Upload date
- File size
- Vendor metadata (in context)

### Download Files

Click any file → **Download** button

### Organize Files

Files are auto-organized in folders:

```
atlas-rfp/
└── ndas/
    ├── NDA_CompanyA_1234567890.pdf
    ├── NDA_CompanyB_1234567891.pdf
    └── NDA_CompanyC_1234567892.pdf
```

### Search Files

Use search box to find by:

- Vendor name
- Date
- Filename
- Tags (`nda`, `vendor-registration`)

---

## 🔒 Security & Privacy

### What's Secure

✅ **Unsigned uploads** use preset (not API secret)  
✅ Files stored in **your** Cloudinary account  
✅ URLs are **unique** and hard to guess  
✅ Folder structure keeps files organized  
✅ Access logs available in Cloudinary

### Access Control

**Current Setup:**

- Public URLs (anyone with link can view)
- Suitable for NDAs (need to be shared with legal)

**For Higher Security (Optional):**

1. Change preset to "Signed" mode
2. Use authenticated URLs
3. Set expiration times
4. Requires server-side implementation

---

## 💰 Cloudinary Free Tier

**Included in Free Account:**

- 25 GB storage
- 25 GB bandwidth/month
- Unlimited transformations
- 500 API requests/hour

**Perfect for:**

- Up to ~2,500 NDAs (at 10MB each)
- Small to medium RFP volume

**If You Need More:**

- Upgrade to paid plan ($99/month for 100GB)
- Or use multiple accounts
- Or clean up old files periodically

---

## 🐛 Troubleshooting

### Error: "Upload preset not found"

**Problem:** Preset name doesn't match or doesn't exist  
**Solution:**

1. Check preset name in Cloudinary (Settings → Upload)
2. Verify it's spelled exactly right in config.js
3. Check it's set to "Unsigned"

### Error: "Upload failed - Invalid signature"

**Problem:** Trying to use signed upload without signature  
**Solution:**

1. Make sure preset is set to **Unsigned**
2. Save preset after changing
3. Clear browser cache

### File uploads but doesn't appear in Airtable

**Problem:** Airtable attachment field not set up correctly  
**Solution:**

1. Verify field is type **Attachment** (not URL or text)
2. Field must be named exactly: `NDA Document`
3. Or update code to match your field name

### "Cloudinary not configured" warning

**Problem:** config.js missing Cloudinary settings  
**Solution:**

1. Check `config.js` has cloudinary section
2. Verify cloudName and uploadPreset are filled in
3. Restart local server after changing config

### Files upload but wrong folder

**Problem:** Folder setting in preset  
**Solution:**

1. Go to preset settings
2. Change Folder to: `atlas-rfp/ndas`
3. Save preset
4. New uploads will use correct folder

---

## 📊 Monitoring Uploads

### Cloudinary Dashboard

**View Upload Activity:**

1. Dashboard → **Reports** tab
2. See upload statistics
3. Monitor bandwidth usage
4. Check storage usage

**Set Up Alerts:**

1. Settings → Notifications
2. Enable email alerts for:
   - Bandwidth threshold (80%)
   - Storage threshold (80%)
   - Upload errors

### Airtable View

**Create "NDAs Uploaded" View:**

1. In Vendors table → Create view
2. Filter: `NDA Document` is not empty
3. Sort by: `NDA Upload Date` (newest first)
4. Shows all vendors with uploaded NDAs

---

## 🔄 Advanced Options

### Custom File Naming

Edit `cloudinary-upload.js` line 68:

```javascript
const publicId = `NDA_${cleanVendorName}_${timestamp}`;
```

Change to:

```javascript
const publicId = `${vendorEmail.split("@")[0]}_NDA_${timestamp}`;
```

### Add Watermark (Optional)

In Cloudinary preset settings:

1. Add transformation
2. Select "Overlay"
3. Upload watermark image
4. Set opacity/position

### Automatic File Expiration

In preset settings:

1. Enable "Auto-delete"
2. Set retention period (e.g., 2 years)
3. Old NDAs automatically deleted

---

## 📝 For Production Deployment

### Vercel Environment Variables

Add to Vercel dashboard:

```
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxxx
CLOUDINARY_UPLOAD_PRESET=atlas_rfp_nda
```

Then update config loading in production to use env vars.

### Alternative: Hardcode in Deployed Config

The current setup works as-is since:

- Upload preset is unsigned (safe to expose)
- Cloud name is public anyway
- No API secrets in frontend

---

## 🎯 Summary

**What You Set Up:**

1. ✅ Cloudinary account (free)
2. ✅ Upload preset (unsigned, secure)
3. ✅ Airtable attachment field
4. ✅ Config.js with credentials
5. ✅ Automatic file upload workflow

**What Happens Now:**

```
Vendor uploads NDA
    ↓
Cloudinary receives file
    ↓
Returns secure URL
    ↓
URL saved to Airtable attachment
    ↓
Admin can view/download from Airtable
```

**No Manual Work Needed!** 🎉

---

## 📞 Support Resources

**Cloudinary Docs:** https://cloudinary.com/documentation  
**Upload Presets:** https://cloudinary.com/documentation/upload_presets  
**Unsigned Uploads:** https://cloudinary.com/documentation/upload_images#unsigned_upload  
**Airtable Attachments:** https://support.airtable.com/docs/attachment-field

---

**Setup Complete! Test it now:**

```bash
npm start
# Visit: http://localhost:8080/vendor/signup.html
```

Upload a test PDF and watch it appear in both Cloudinary and Airtable! 🚀

---

_Last Updated: October 29, 2025_  
_Version: 2.1 with Cloudinary Integration_
