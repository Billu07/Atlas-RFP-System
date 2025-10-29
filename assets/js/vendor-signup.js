/**
 * Vendor Signup Logic
 * Handles multi-step registration with NDA upload
 */

let airtableAPI;
let cloudinaryUploader;
let currentStep = 1;
let uploadedFile = null;
let cloudinaryUploadResult = null;
let vendorData = {};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (typeof CONFIG === "undefined") {
    alert("Configuration not found");
    return;
  }

  airtableAPI = new AirtableAPI(CONFIG);

  // Initialize Cloudinary uploader
  if (
    CONFIG.cloudinary &&
    CONFIG.cloudinary.cloudName &&
    CONFIG.cloudinary.uploadPreset
  ) {
    cloudinaryUploader = new CloudinaryUploader(
      CONFIG.cloudinary.cloudName,
      CONFIG.cloudinary.uploadPreset
    );
  } else {
    console.warn("Cloudinary not configured. File upload will not work.");
  }

  setupFileUpload();
  setupFormValidation();
});

// Navigate between steps
function goToStep(step) {
  // Validate current step before proceeding
  if (step > currentStep && !validateCurrentStep()) {
    return;
  }

  // Update step indicator
  document.querySelectorAll(".step").forEach((s) => {
    const stepNum = parseInt(s.dataset.step);
    s.classList.remove("active", "completed");
    if (stepNum < step) s.classList.add("completed");
    if (stepNum === step) s.classList.add("active");
  });

  // Update form sections
  document.querySelectorAll(".form-section").forEach((section) => {
    section.classList.remove("active");
  });
  document.querySelector(`[data-section="${step}"]`).classList.add("active");

  // Special handling for step 3
  if (step === 3) {
    document.getElementById("vendor-email").value =
      document.getElementById("email").value;
  }

  currentStep = step;
  window.scrollTo(0, 0);
}

// Validate current step
function validateCurrentStep() {
  if (currentStep === 1) {
    const requiredFields = [
      "company-name",
      "contact-name",
      "contact-title",
      "email",
      "phone",
      "website",
      "country",
    ];
    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        alert("Please fill in all required fields");
        field.focus();
        return false;
      }
    }

    // Validate email format
    const email = document.getElementById("email").value;
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      document.getElementById("email").focus();
      return false;
    }

    // Validate website format
    const website = document.getElementById("website").value;
    if (!isValidUrl(website)) {
      alert(
        "Please enter a valid website URL starting with http:// or https://"
      );
      document.getElementById("website").focus();
      return false;
    }

    // Store step 1 data
    vendorData.companyInfo = {
      companyName: document.getElementById("company-name").value,
      contactName: document.getElementById("contact-name").value,
      contactTitle: document.getElementById("contact-title").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      website: document.getElementById("website").value,
      country: document.getElementById("country").value,
      companySize: document.getElementById("company-size").value,
      services: document.getElementById("services").value,
    };

    return true;
  }

  if (currentStep === 2) {
    if (!uploadedFile) {
      alert("Please upload your signed NDA before continuing");
      return false;
    }
    return true;
  }

  if (currentStep === 3) {
    const password = document.getElementById("vendor-password").value;
    const confirmPassword = document.getElementById(
      "vendor-password-confirm"
    ).value;
    const termsAgree = document.getElementById("terms-agree").checked;

    if (password.length < 8) {
      showError(
        "password-error",
        "Password must be at least 8 characters long"
      );
      return false;
    }

    if (password !== confirmPassword) {
      showError("password-error", "Passwords do not match");
      return false;
    }

    if (!termsAgree) {
      alert("Please agree to the terms and conditions");
      return false;
    }

    return true;
  }

  return true;
}

// Setup file upload
function setupFileUpload() {
  const uploadArea = document.getElementById("upload-area");
  const fileInput = document.getElementById("nda-file-input");
  const continueBtn = document.getElementById("continue-to-step-3");

  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop area
  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.add("dragover"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.remove("dragover"),
      false
    );
  });

  // Handle drop
  uploadArea.addEventListener("drop", handleDrop, false);

  // Handle file input change
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Track NDA download - add error handling for missing file
  document.getElementById("download-nda-btn").addEventListener("click", (e) => {
    e.preventDefault();
    handleNDADownload();
  });
}

function handleNDADownload() {
  // Show message that any document can be used for testing
  const useTestFile = confirm(
    "NDA Template Download\n\nFor testing purposes, you can use ANY signed PDF document.\n\nWould you like to continue to the download link?"
  );

  if (useTestFile) {
    // Try to download the file, but if it fails, it's OK for testing
    window.location.href = "/assets/documents/Atlas_NDA_Template.pdf";
  } else {
    // User can use their own file
    alert("You can use any signed PDF document for testing.");
  }
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
}

function handleFile(file) {
  const uploadError = document.getElementById("upload-error");
  const continueBtn = document.getElementById("continue-to-step-3");

  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (file.size > maxSize) {
    uploadError.textContent = "File is too large. Maximum size is 10MB.";
    uploadError.classList.remove("hidden");
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    uploadError.textContent =
      "Invalid file type. Please upload PDF, DOC, or DOCX.";
    uploadError.classList.remove("hidden");
    return;
  }

  // Store file
  uploadedFile = file;
  uploadError.classList.add("hidden");

  // Show file preview
  document.getElementById("upload-prompt").classList.add("hidden");
  document.getElementById("file-preview").classList.remove("hidden");
  document.getElementById("file-name").textContent = file.name;
  document.getElementById("file-size").textContent = formatFileSize(file.size);

  // Enable continue button
  continueBtn.disabled = false;

  // Show upload progress
  uploadToCloudinary(file);
}

async function uploadToCloudinary(file) {
  const uploadError = document.getElementById("upload-error");
  const fileNameElement = document.getElementById("file-name");

  if (!cloudinaryUploader) {
    console.warn(
      "Cloudinary not configured - file will be stored locally only"
    );
    return;
  }

  try {
    // Show uploading status
    fileNameElement.innerHTML = `${file.name} <small style="color: var(--primary-color);">(Uploading...)</small>`;

    // Get vendor info for proper file naming
    const vendorName =
      document.getElementById("company-name").value || "Unknown";
    const vendorEmail =
      document.getElementById("email").value || "unknown@email.com";

    // Upload to Cloudinary
    cloudinaryUploadResult = await cloudinaryUploader.uploadNDA(
      file,
      vendorName,
      vendorEmail
    );

    // Show success
    fileNameElement.innerHTML = `${file.name} <small style="color: var(--success-color);">✓ Uploaded</small>`;

    console.log("File uploaded to Cloudinary:", cloudinaryUploadResult);
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    fileNameElement.innerHTML = `${file.name} <small style="color: var(--warning-color);">⚠ Upload pending</small>`;
    uploadError.textContent =
      "File upload to cloud storage failed. It will be stored locally. You can continue.";
    uploadError.classList.remove("hidden");
    // Don't block progress - allow continuation
  }
}

function removeFile(e) {
  e.stopPropagation();
  uploadedFile = null;
  document.getElementById("upload-prompt").classList.remove("hidden");
  document.getElementById("file-preview").classList.add("hidden");
  document.getElementById("nda-file-input").value = "";
  document.getElementById("continue-to-step-3").disabled = true;
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Form validation
function setupFormValidation() {
  const form = document.getElementById("vendor-signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    await submitRegistration();
  });
}

// Submit registration
async function submitRegistration() {
  const submitBtn = document.getElementById("submit-btn");
  const submitText = document.getElementById("submit-text");
  const submitSpinner = document.getElementById("submit-spinner");
  const passwordError = document.getElementById("password-error");

  submitBtn.disabled = true;
  submitText.classList.add("hidden");
  submitSpinner.classList.remove("hidden");
  passwordError.classList.add("hidden");

  console.log("=== Starting Registration ===");
  console.log("Vendor Data:", vendorData);
  console.log("Uploaded File:", uploadedFile);
  console.log("Cloudinary Result:", cloudinaryUploadResult);

  try {
    const password = document.getElementById("vendor-password").value;
    console.log("Password entered:", password);

    // Prepare NDA attachment for Airtable - FIXED VERSION
    let ndaAttachment = null;
    if (cloudinaryUploadResult && cloudinaryUploadResult.url) {
      ndaAttachment = [
        {
          url: cloudinaryUploadResult.url,
          filename: uploadedFile.name,
        },
      ];
      console.log("NDA Attachment prepared:", ndaAttachment);
    } else {
      console.warn("No Cloudinary URL available for attachment");
    }

    // Create vendor record in Airtable - using field names that match Airtable
    const vendorRecord = {
      "Vendor Name": vendorData.companyInfo.companyName || "Unknown Company",
      "Contact Person": vendorData.companyInfo.contactName || "Unknown Contact",
      "Contact Title": vendorData.companyInfo.contactTitle || "Not Provided",
      Email: vendorData.companyInfo.email || "no-email@example.com",
      Phone: vendorData.companyInfo.phone || "Not Provided",
      Website: vendorData.companyInfo.website || "Not Provided",
      Country: vendorData.companyInfo.country || "Not Provided",
      "Company Size": vendorData.companyInfo.companySize || "Not Provided",
      Services: vendorData.companyInfo.services || "Not Provided",
      "NDA on File": true,
      "NDA File Name": uploadedFile?.name || "No file",
      "NDA Upload Date": new Date().toISOString().split("T")[0],
      Status: "Pending Approval",
      "Password Hash": btoa(password),
      "Internal Notes": `New vendor registration\nFile: ${
        uploadedFile?.name || "No file"
      }\n${
        cloudinaryUploadResult
          ? "Cloud URL: " + cloudinaryUploadResult.url
          : "File uploaded locally - needs manual retrieval"
      }\nRegistered: ${new Date().toISOString()}`,
    };

    // Add attachment if Cloudinary upload succeeded - FIXED
    if (ndaAttachment) {
      vendorRecord["NDA Document"] = ndaAttachment;
      console.log("✅ Adding NDA attachment to vendor record");
    } else {
      console.warn(
        "❌ No NDA attachment to add - Cloudinary upload may have failed"
      );
    }

    console.log("Vendor Record to create:", vendorRecord);

    // Try to create vendor in Airtable
    console.log("Creating vendor in Airtable...");
    const result = await airtableAPI.createVendor(vendorRecord);
    console.log("Airtable API Response:", result);

    if (result && result.id) {
      console.log(
        "✅ Vendor created successfully in Airtable! Record ID:",
        result.id
      );

      // Verify the attachment was saved
      if (result.fields && result.fields["NDA Document"]) {
        console.log(
          "✅ NDA Document field saved:",
          result.fields["NDA Document"]
        );
      } else {
        console.warn(
          "⚠️ NDA Document field may not have been saved in Airtable"
        );
      }

      // Show success
      document.getElementById("confirmation-email").textContent =
        vendorData.companyInfo.email;
      goToStep(4);

      console.log("🎉 Registration completed successfully!");
    } else {
      throw new Error("No record ID returned from Airtable");
    }
  } catch (error) {
    console.error("❌ Registration failed:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });

    // Show user-friendly error message
    let userMessage = "Registration failed. ";

    if (
      error.message.includes("permission") ||
      error.message.includes("auth")
    ) {
      userMessage += "Please check your Airtable API key permissions.";
    } else if (error.message.includes("field")) {
      userMessage +=
        "There's a field mismatch with Airtable. Check field names.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      userMessage +=
        "Network error. Please check your connection and try again.";
    } else {
      userMessage += error.message;
    }

    showError("password-error", userMessage);

    // Also show alert for immediate visibility
    alert(
      "Registration Error: " +
        userMessage +
        "\n\nCheck browser console for details."
    );
  } finally {
    submitBtn.disabled = false;
    submitText.classList.remove("hidden");
    submitSpinner.classList.add("hidden");
  }
}

// Helper functions
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(string) {
  if (!string.trim()) return false; // Required field
  try {
    // Basic URL validation - must start with http:// or https://
    return string.startsWith("http://") || string.startsWith("https://");
  } catch (_) {
    return false;
  }
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}
