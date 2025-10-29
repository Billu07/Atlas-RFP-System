# 🆕 Feature Update: Vendor Registration & NDA Workflow

## What's New

Your RFP system now includes a **complete vendor registration and approval workflow**! Vendors must sign up, upload a signed NDA, and be approved by admins before accessing RFPs.

---

## 🎯 New Features Added

### 1. **Vendor Registration System**

- Multi-step registration wizard (4 steps)
- Company information collection
- NDA download and upload
- Account creation with password
- Email confirmation

### 2. **NDA Management**

- Download NDA template
- Upload signed NDA (PDF, DOC, DOCX)
- Track NDA status in Airtable
- File name storage for reference

### 3. **Vendor Portal**

- Separate vendor login
- Protected vendor dashboard
- Personal RFP access
- Submission tracking
- Session-based authentication

### 4. **Admin Approval Workflow**

- Pending approvals dashboard
- Approve/Decline vendors
- View vendor details
- Track approval dates
- Internal notes system

### 5. **Status-Based Access Control**

- Pending vendors: No RFP access
- Approved vendors: Full RFP access
- Declined vendors: No access
- Suspended vendors: Access revoked

---

## 📁 New Files Created

```
vendor/
├── signup.html           - 4-step registration wizard
├── login.html            - Vendor authentication
├── dashboard.html        - Personal vendor portal
└── rfp-detail.html       - Protected RFP viewing & submission

assets/
├── js/
│   └── vendor-signup.js  - Registration logic with file upload
└── documents/
    └── Atlas_NDA_Template.txt  - NDA template for vendors
```

**Total New Files:** 5  
**Updated Files:** 5 (index.html, admin/dashboard.html, admin.js, AIRTABLE_SETUP.md)

---

## 🔄 Updated Airtable Schema

### Vendors Table - NEW FIELDS

Add these fields to your existing **Vendors** table in Airtable:

| Field Name      | Field Type       | Options                            |
| --------------- | ---------------- | ---------------------------------- |
| Contact Title   | Single line text | Job title                          |
| Company Size    | Single select    | 1-10, 11-50, 51-200, 201-500, 500+ |
| Services        | Long text        | Services description               |
| NDA File Name   | Single line text | Uploaded file name                 |
| NDA Upload Date | Date             | When NDA was uploaded              |
| Password Hash   | Single line text | Encrypted password                 |
| Approval Date   | Date             | When approved                      |
| Last Login      | Date             | Track login activity               |

**Updated Status Options:**

- Pending Approval (NEW)
- Approved (NEW)
- Invited
- Submitted
- Shortlisted
- Declined
- Suspended (NEW)

---

## 🚀 Implementation Steps

### Step 1: Update Airtable (15 minutes)

1. **Go to your Vendors table in Airtable**

2. **Add new fields:**

   ```
   Click "+" to add field:
   - Contact Title → Single line text
   - Company Size → Single select (add options above)
   - Services → Long text
   - NDA File Name → Single line text
   - NDA Upload Date → Date
   - Password Hash → Single line text
   - Approval Date → Date
   - Last Login → Date
   ```

3. **Update Status field:**

   - Click on "Status" field → Edit field
   - Add new options: "Pending Approval", "Approved", "Suspended"
   - Keep existing options

4. **Create new view "Pending Approvals":**
   - Click "Grid view" dropdown → Create → Grid view
   - Name: "Pending Approvals"
   - Filter: Status = "Pending Approval"

### Step 2: Update Your Files (5 minutes)

The updated files are already in your rfp-system folder:

1. **Replace these files** with the new versions:

   - index.html (updated navigation)
   - admin/dashboard.html (added Pending Approvals view)
   - assets/js/admin.js (added approval functions)
   - AIRTABLE_SETUP.md (updated schema)

2. **Copy new files** to your project:
   - vendor/ folder (all 4 files)
   - assets/js/vendor-signup.js
   - assets/documents/Atlas_NDA_Template.txt

### Step 3: Customize NDA Template (10 minutes)

1. **Open** `assets/documents/Atlas_NDA_Template.txt`

2. **Update these sections:**

   - Company address
   - Governing law/jurisdiction
   - Contact email
   - Any specific legal requirements

3. **Optional:** Convert to PDF using:

   - Microsoft Word
   - Google Docs
   - Online converter (txt → pdf)
   - Save as: `Atlas_NDA_Template.pdf`

4. **Update link in signup.html** if you rename the file:
   ```html
   Line 178: href="/assets/documents/Atlas_NDA_Template.pdf"
   ```

### Step 4: Test Locally (15 minutes)

1. **Start local server:**

   ```bash
   npm start
   # or
   python -m http.server 8080
   ```

2. **Test vendor registration:**

   - Go to: http://localhost:8080/vendor/signup.html
   - Fill out registration form (all 4 steps)
   - Download NDA
   - Upload a test file
   - Complete registration

3. **Check Airtable:**

   - Verify new vendor record created
   - Status should be "Pending Approval"
   - NDA file name stored

4. **Test admin approval:**

   - Log in to admin dashboard
   - Click "Pending Approvals"
   - Should see test vendor
   - Click "Approve"
   - Vendor status changes to "Approved"

5. **Test vendor login:**
   - Go to: http://localhost:8080/vendor/login.html
   - Log in with test vendor credentials
   - Should see dashboard with RFPs

### Step 5: Deploy to Vercel (5 minutes)

```bash
vercel --prod
```

Wait for deployment, then test on live site.

---

## 🔒 Security Notes

### Password Storage

**IMPORTANT:** The current implementation uses Base64 encoding for passwords, which is NOT secure for production.

**For Production, you MUST:**

1. Use proper password hashing (bcrypt, argon2)
2. Implement server-side authentication
3. Use secure session tokens
4. Add HTTPS enforcement

**Current Implementation (Development Only):**

- Passwords encoded with Base64
- Client-side validation only
- Session storage in browser
- **NOT production-ready!**

### Recommended Production Setup:

- Add Vercel serverless functions for authentication
- Use NextAuth.js or similar
- Implement proper password hashing
- Add email verification
- Use HTTP-only cookies

---

## 📝 File Upload Considerations

### Current Implementation:

- File name is stored in Airtable
- Actual file is NOT uploaded (needs implementation)
- Admin must manually collect signed NDAs

### Production Implementation Options:

**Option 1: Cloud Storage (Recommended)**

1. Set up AWS S3, Cloudinary, or Uploadcare
2. Upload files from vendor-signup.js
3. Store file URL in Airtable
4. Admin can download from Airtable

**Option 2: Airtable Attachments**

1. Upload to temporary storage first
2. Get public URL
3. Store in Airtable attachment field
4. Airtable stores the file

**Option 3: Email-Based**

1. Email signed NDA to admin
2. Admin manually uploads to Airtable
3. Update NDA status

---

## 🎨 Customization Guide

### Branding

**Update company name:**

```javascript
// config.js
branding: {
  companyName: "Your Company Name";
}
```

**Update logos:**

- Replace `/assets/images/logo.png`
- Update all references in HTML files

### Email Notifications

**Add email on registration:**

```javascript
// vendor-signup.js, line 180
// After successful registration:
await sendEmail({
  to: vendorData.companyInfo.email,
  subject: "Registration Received",
  body: "Thank you for registering...",
});
```

**Add email on approval:**

```javascript
// admin.js, line ~320
// After approving vendor:
await sendEmail({
  to: vendor.fields["Email"],
  subject: "Vendor Approved",
  body: "You have been approved...",
});
```

Use: SendGrid, Mailgun, or Vercel Email Integration

### NDA Workflow

**Alternative: Skip NDA Upload**

- Remove step 2 from signup.html
- Remove NDA upload logic
- Just require checkbox agreement
- Admin manually handles NDAs

**Alternative: Use DocuSign**

- Integrate DocuSign API
- Send NDA for e-signature
- Automatically update status
- Store in Airtable

---

## 📊 User Flows

### Vendor Flow

```
1. Visit landing page
2. Click "Register as Vendor"
3. Fill company info (Step 1)
4. Download NDA template (Step 2)
5. Sign NDA offline
6. Upload signed NDA
7. Create account credentials (Step 3)
8. See confirmation (Step 4)
9. Wait for admin approval
10. Receive approval email
11. Log in to vendor portal
12. Browse and submit to RFPs
```

### Admin Flow

```
1. Log in to admin dashboard
2. See notification: "X pending approvals"
3. Click "Pending Approvals"
4. Review vendor details
5. Check NDA file uploaded
6. Click "Approve" or "Decline"
7. Vendor gets access immediately
8. (Optional) Send approval email
```

---

## 🐛 Troubleshooting

### Issue: Vendor can't see RFPs after approval

**Solution:**

- Check vendor Status = "Approved" in Airtable
- Verify RFP Status = "Active"
- Clear browser cache
- Log out and log in again

### Issue: File upload doesn't work

**Solution:**

- Check file size (max 10MB)
- Check file type (PDF, DOC, DOCX only)
- Check browser console for errors
- Note: Actual file upload needs cloud storage implementation

### Issue: Admin dashboard doesn't show pending vendors

**Solution:**

- Verify new fields added to Airtable
- Check Status field has "Pending Approval" option
- Refresh dashboard
- Check browser console for API errors

### Issue: Password doesn't work

**Solution:**

- Check caps lock
- Verify password was saved during registration
- Check Airtable for "Password Hash" field
- Remember: Base64 is case-sensitive

---

## 📋 Testing Checklist

Before going live:

**Vendor Registration:**

- [ ] Can access signup page
- [ ] All 4 steps work
- [ ] Can download NDA
- [ ] Can upload file (shows preview)
- [ ] Form validation works
- [ ] Creates record in Airtable
- [ ] Shows success message

**Vendor Login:**

- [ ] Can't login before approval
- [ ] Shows "pending approval" message
- [ ] Can login after approval
- [ ] Dashboard loads correctly
- [ ] Can see active RFPs
- [ ] Can't see already-submitted RFPs

**Admin Approval:**

- [ ] Pending vendors appear in list
- [ ] Can view vendor details
- [ ] Approve button works
- [ ] Decline button works
- [ ] Status updates in Airtable
- [ ] Count updates

**Security:**

- [ ] Can't access vendor dashboard without login
- [ ] Can't access RFPs without approval
- [ ] Session expires after 8 hours
- [ ] Logout works properly

---

## 🎯 Next Steps

### Immediate:

1. Update Airtable with new fields
2. Test locally
3. Deploy to Vercel
4. Test on live site
5. Register test vendor
6. Test approval workflow

### Short-term (This Week):

1. Customize NDA template
2. Update branding/colors
3. Set up email notifications
4. Test with real vendors

### Long-term (Future):

1. Implement file upload to cloud storage
2. Add proper password hashing
3. Add email verification
4. Add "forgot password" feature
5. Add vendor profile editing
6. Add submission status tracking

---

## 📞 Support

**Questions about:**

- Setup: Check DEPLOYMENT_GUIDE.md
- Airtable: Check AIRTABLE_SETUP.md
- Features: Check this document
- Bugs: Check browser console (F12)

**Common Commands:**

```bash
# Test locally
npm start

# Deploy
vercel --prod

# Check logs
vercel logs
```

---

## ✅ Summary

**What Changed:**

- Added 5 new pages for vendor workflow
- Updated admin dashboard with approvals
- Added 8 new fields to Vendors table
- Created NDA template
- Updated landing page navigation

**What You Need to Do:**

1. Update Airtable (15 min)
2. Test locally (15 min)
3. Deploy to production (5 min)
4. Customize NDA template (10 min)

**Total Time:** ~45 minutes

**Result:** Complete vendor registration and approval workflow with NDA management! 🎉

---

_Last Updated: October 29, 2025_  
_Version: 2.0 with Vendor Portal_
