// Configuration file for RFP System
// Copy this to config.js and add your actual credentials

const CONFIG = {
  // Airtable Configuration
  airtable: {
    baseId: "appIHQ8c0j2Y7decy", // Get from Airtable
    apiKey:
      "patiwPNTJ6yPlYHpz.b9998e5ce75b88d23a972bb0418d9d8d29e1d12d19c428e31a9f2b9f19882f7d", // Get from Airtable developer settings
    tables: {
      rfps: "RFPs",
      vendors: "Vendors",
      submissions: "Submissions",
      decisions: "Decisions",
    },
  },

  // Cloudinary Configuration (for NDA file uploads)
  cloudinary: {
    cloudName: "djwuqsy1o", // Get from Cloudinary dashboard
    uploadPreset: "atlas_rfp_nda", // Create unsigned upload preset in Cloudinary
    // Optional: API key and secret (not needed for unsigned uploads)
  },

  // Admin Authentication (Change these!)
  admin: {
    username: "admin",
    password: "Dan@atlas55", // CHANGE THIS!
  },

  // Company Branding
  branding: {
    companyName: "Atlas Consulting",
    logoUrl: "/assets/images/logo.png", // Add your logo
    primaryColor: "#2563eb", // Blue
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
  },

  // Email Configuration (Optional - for notifications)
  email: {
    fromEmail: "rfp@atlasconsulting.com",
    fromName: "Atlas RFP System",
  },

  // File Upload Settings
  upload: {
    maxFileSize: 10, // MB
    allowedTypes: ["pdf", "zip", "doc", "docx", "xls", "xlsx"],
  },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
