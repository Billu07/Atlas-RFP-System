// Configuration file for RFP System
// Copy this to config.js and add your actual credentials

const CONFIG = {
  // Airtable Configuration
  airtable: {
    baseId: "", // Get from Airtable
    apiKey: "", // Get from Airtable developer settings
    tables: {
      rfps: "RFPs",
      vendors: "Vendors",
      submissions: "Submissions",
      decisions: "Decisions",
    },
  },

  // Cloudinary Configuration (for NDA file uploads)
  cloudinary: {
    cloudName: "", // Get from Cloudinary dashboard
    uploadPreset: "", // Create unsigned upload preset in Cloudinary
    // Optional: API key and secret (not needed for unsigned uploads)
  },

  // Admin Authentication (Change these!)
  admin: {
    username: "",
    password: "", // CHANGE THIS!
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
