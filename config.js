// Configuration file for RFP System
// Uses environment variables only - no hardcoded secrets

const CONFIG = {
  // Airtable Configuration
  airtable: {
    baseId: process.env.AIRTABLE_BASE_ID,
    apiKey: process.env.AIRTABLE_API_KEY,
    tables: {
      rfps: "RFPs",
      vendors: "Vendors",
      submissions: "Submissions",
      decisions: "Decisions",
    },
  },

  // Cloudinary Configuration (for NDA file uploads)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  },

  // Admin Authentication
  admin: {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },

  // Company Branding
  branding: {
    companyName: process.env.COMPANY_NAME || "Atlas Consulting",
    logoUrl: "/assets/images/logo.png",
    primaryColor: process.env.PRIMARY_COLOR || "#2563eb",
    secondaryColor: process.env.SECONDARY_COLOR || "#1e40af",
    accentColor: process.env.ACCENT_COLOR || "#3b82f6",
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
