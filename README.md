# Atlas RFP System

A professional RFP (Request for Proposal) bid collection and management system built with HTML, CSS, JavaScript, and Airtable as the backend.

## 🎯 Features

### Public Portal

- **Landing Page**: Lists all active RFPs with deadline countdown
- **RFP Detail Pages**: Complete RFP information with submission form
- **Vendor Submission**: Comprehensive bid submission with file uploads
- **Professional Design**: Clean, corporate design with responsive layout

### Admin Dashboard

- **Dashboard Overview**: Real-time statistics and recent activity
- **RFP Management**: Create, edit, and manage RFPs
- **Submission Review**: View and rate vendor submissions
- **Vendor Directory**: Manage vendor information
- **Secure Login**: Password-protected admin access

## 🚀 Quick Start

### Prerequisites

- Airtable account (free tier works)
- Vercel account (for hosting)
- Text editor or VS Code

### Step 1: Set Up Airtable

1. Go to [Airtable.com](https://airtable.com) and sign in
2. Create a new base called "Atlas RFP System"
3. Follow the schema in `AIRTABLE_SETUP.md` to create:

   - RFPs table
   - Vendors table
   - Submissions table
   - Decisions table (optional)

4. Get your credentials:
   - Go to Account → Developer Hub → Personal Access Tokens
   - Create a token with scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
   - Copy your Base ID (from API docs or URL)

### Step 2: Configure the System

1. Copy `config.example.js` to `config.js`:

   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your credentials:

   ```javascript
   airtable: {
     baseId: 'appXXXXXXXXXXXXXX',  // Your Airtable Base ID
     apiKey: 'patXXXXXXXXXXXXXX',  // Your Personal Access Token
     // ... rest stays the same
   },

   admin: {
     username: 'admin',
     password: 'YOUR_SECURE_PASSWORD'  // Change this!
   }
   ```

3. (Optional) Add your company logo to `/assets/images/logo.png`

### Step 3: Test Locally

1. Install a local server (if you don't have one):

   ```bash
   npm install -g http-server
   ```

2. Start the server:

   ```bash
   http-server . -p 8080
   ```

3. Open browser to `http://localhost:8080`

4. Test the admin dashboard at `http://localhost:8080/admin/login.html`

### Step 4: Deploy to Vercel

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Follow the prompts to deploy your site

4. **IMPORTANT**: Add `config.js` to `.vercelignore` (it's already there) to keep credentials secure

## 📁 Project Structure

```
rfp-system/
├── index.html                 # Public landing page
├── public/
│   └── rfp-detail.html       # RFP detail & submission form
├── admin/
│   ├── login.html            # Admin login
│   └── dashboard.html        # Admin dashboard
├── assets/
│   ├── css/
│   │   └── main.css          # Main stylesheet
│   ├── js/
│   │   ├── airtable-api.js   # Airtable API wrapper
│   │   └── admin.js          # Admin functionality
│   └── images/
│       └── logo.png          # Company logo
├── config.example.js         # Configuration template
├── config.js                 # Your actual config (not in git)
├── AIRTABLE_SETUP.md         # Airtable schema guide
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

## 🔧 Configuration Options

### Branding

Edit `config.js` to customize:

- Company name
- Logo URL
- Brand colors (primary, secondary, accent)

### Admin Credentials

**CRITICAL**: Change the default admin password in `config.js`:

```javascript
admin: {
  username: 'admin',
  password: 'YOUR_SECURE_PASSWORD'  // Change this!
}
```

### Email Notifications (Optional)

The system structure supports email notifications. To implement:

1. Add email service (SendGrid, Mailgun, etc.)
2. Extend Airtable automations to trigger emails
3. Or use Vercel serverless functions for custom logic

## 📋 Usage Guide

### For Administrators

#### Creating a New RFP

1. Log in to admin dashboard
2. Go to "RFPs" section
3. Click "Create New RFP"
4. Fill in all details:
   - RFP Name
   - Objective and Scope
   - Budget Guidance
   - Submission Deadline
   - Owner information
5. Set Status to "Active" to publish
6. Copy the public link to share with vendors

#### Reviewing Submissions

1. Go to "Submissions" section
2. View all submissions or filter by status
3. Click "View" to see full submission details
4. Click "Rate" to add:
   - Star rating (1-5)
   - Review status
   - Internal notes
5. Use filters to create shortlist

#### Managing Vendors

1. Go to "Vendors" section
2. View all registered vendors
3. Add notes and track NDA status
4. Update vendor status as needed

### For Vendors

#### Submitting a Proposal

1. Visit the RFP portal (public link)
2. Browse active RFPs
3. Click "View Details & Submit" on desired RFP
4. Read the full RFP details
5. Fill in the submission form:
   - Company information
   - Pricing and timeline
   - Upload proposal documents
   - Confirm NDA
6. Submit proposal
7. Receive confirmation

## 🔐 Security Notes

1. **Config File**: Never commit `config.js` to version control
2. **Admin Password**: Change default password immediately
3. **Airtable API Key**: Keep your Personal Access Token secret
4. **HTTPS**: Always use HTTPS in production (Vercel provides this)
5. **Session Timeout**: Admin sessions expire after 8 hours

## 🎨 Customization

### Changing Colors

Edit `config.js`:

```javascript
branding: {
  primaryColor: '#2563eb',    // Main brand color
  secondaryColor: '#1e40af',  // Darker shade
  accentColor: '#3b82f6'      // Lighter accent
}
```

### Adding Custom Fields

1. Add fields to Airtable tables
2. Update form in `rfp-detail.html`
3. Update data mapping in submission handler
4. Update admin views to display new fields

### Custom Styling

Edit `/assets/css/main.css` to customize:

- Typography
- Spacing
- Components
- Responsive breakpoints

## 🐛 Troubleshooting

### "Configuration not found" Error

- Make sure you created `config.js` from `config.example.js`
- Check that the file is in the project root

### "Airtable API error"

- Verify your Base ID is correct
- Check that your Personal Access Token has the right scopes
- Ensure your Airtable base matches the schema

### Admin Login Not Working

- Check that you changed the password in `config.js`
- Clear browser cache and try again
- Check browser console for JavaScript errors

### Submissions Not Showing

- Verify Airtable connection is working
- Check that RFP Status is "Active"
- Look at browser console for API errors

## 📝 File Upload Note

**IMPORTANT**: The current version accepts file upload fields but doesn't store files in Airtable directly. For production use, you should:

1. Set up cloud storage (AWS S3, Cloudinary, etc.)
2. Upload files to cloud storage first
3. Store the URLs in Airtable
4. Or use Airtable's attachment field with public URLs

See `assets/js/airtable-api.js` for the `uploadAttachment` method stub.

## 🔄 Future Enhancements

Potential features to add:

- [ ] Email notifications for new submissions
- [ ] Vendor portal (login for vendors to track their submissions)
- [ ] Advanced filtering and sorting
- [ ] Export submissions to Excel/PDF
- [ ] Scoring matrix for automated evaluation
- [ ] Multi-user admin with roles
- [ ] Audit log
- [ ] File upload to cloud storage

## 📄 License

This project is provided as-is for Atlas Consulting. Modify as needed.

## 🆘 Support

For issues or questions:

1. Check this README
2. Review `AIRTABLE_SETUP.md`
3. Check browser console for errors
4. Verify Airtable configuration

## 🎉 Deployment Checklist

Before going live:

- [ ] Airtable base created and configured
- [ ] `config.js` created with real credentials
- [ ] Admin password changed from default
- [ ] Company logo added
- [ ] Test all functionality locally
- [ ] Deploy to Vercel
- [ ] Test deployed version
- [ ] Share RFP links with vendors
- [ ] Monitor submissions in admin dashboard

---

Built with ❤️ for Atlas Consulting
