/**
 * Admin Dashboard JavaScript
 * Handles all admin functionality
 */

let airtableAPI;
let currentView = "dashboard";
let currentRFPEdit = null;

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  initializeAdmin();
});

// Check if user is authenticated
function checkAuth() {
  const isAuthenticated = sessionStorage.getItem("admin_authenticated");
  const loginTime = sessionStorage.getItem("admin_login_time");

  if (!isAuthenticated || !loginTime) {
    window.location.href = "/admin/login.html";
    return;
  }

  // Check if session is older than 8 hours
  const hoursSinceLogin = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
  if (hoursSinceLogin > 8) {
    logout();
  }
}

// Initialize admin panel
async function initializeAdmin() {
  try {
    if (typeof CONFIG === "undefined") {
      throw new Error("Configuration not found");
    }

    airtableAPI = new AirtableAPI(CONFIG);

    // Set up navigation
    document.querySelectorAll(".sidebar-nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const view = item.dataset.view;
        switchView(view);
      });
    });

    // Load dashboard by default
    await loadDashboard();

    // Load system info
    document.getElementById("info-base-id").textContent =
      CONFIG.airtable.baseId;
    document.getElementById("info-company").textContent =
      CONFIG.branding.companyName;
  } catch (error) {
    console.error("Initialization error:", error);
    alert("Error initializing admin panel: " + error.message);
  }
}

// Switch between views
function switchView(view) {
  // Update navigation
  document.querySelectorAll(".sidebar-nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelector(`[data-view="${view}"]`).classList.add("active");

  // Hide all views
  document.querySelectorAll(".view-content").forEach((content) => {
    content.classList.add("hidden");
  });

  // Show selected view
  document.getElementById(`view-${view}`).classList.remove("hidden");
  currentView = view;

  // Load data for the view
  switch (view) {
    case "dashboard":
      loadDashboard();
      break;
    case "rfps":
      loadRFPs();
      break;
    case "submissions":
      loadSubmissions();
      break;
    case "vendors":
      loadVendors();
      break;
    case "pending-vendors":
      loadPendingVendors();
      break;
  }
}

// Load dashboard data
async function loadDashboard() {
  try {
    const stats = await airtableAPI.getDashboardStats();

    document.getElementById("stat-active-rfps").textContent = stats.activeRFPs;
    document.getElementById("stat-submissions").textContent =
      stats.totalSubmissions;
    document.getElementById("stat-pending").textContent = stats.pendingReviews;
    document.getElementById("stat-vendors").textContent = stats.totalVendors;

    // Load recent submissions
    const submissions = await airtableAPI.getAllSubmissions();
    const recentSubmissions = submissions.slice(0, 5);

    renderRecentSubmissions(recentSubmissions);
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

function renderRecentSubmissions(submissions) {
  const container = document.getElementById("recent-submissions");

  if (submissions.length === 0) {
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No submissions yet</p>';
    return;
  }

  const table = `
    <table style="width: 100%;">
      <thead>
        <tr>
          <th>Vendor</th>
          <th>RFP</th>
          <th>Price</th>
          <th>Status</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        ${submissions
          .map((s) => {
            const fields = s.fields;
            return `
            <tr>
              <td><strong>${escapeHtml(
                fields["Vendor Name"] || "N/A"
              )}</strong></td>
              <td>${escapeHtml(fields["RFP"] ? fields["RFP"][0] : "N/A")}</td>
              <td>$${(fields["Base Price"] || 0).toLocaleString()}</td>
              <td><span class="badge badge-${getStatusBadgeClass(
                fields["Review Status"]
              )}">${fields["Review Status"] || "Pending"}</span></td>
              <td>${formatDate(new Date(fields["Submitted Date"]))}</td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  container.innerHTML = table;
}

// Load all RFPs
async function loadRFPs() {
  const container = document.getElementById("rfps-table");
  container.innerHTML =
    '<p class="text-center" style="padding: 2rem;">Loading...</p>';

  try {
    const rfps = await airtableAPI.getAllRFPs();

    if (rfps.length === 0) {
      container.innerHTML =
        '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No RFPs created yet</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>RFP Name</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rfps
            .map((rfp) => {
              const fields = rfp.fields;
              return `
              <tr>
                <td>${fields["RFP ID"]}</td>
                <td><strong>${escapeHtml(fields["RFP Name"])}</strong></td>
                <td><span class="badge badge-${getStatusBadgeClass(
                  fields["Status"]
                )}">${fields["Status"]}</span></td>
                <td>${formatDate(new Date(fields["Submission Deadline"]))}</td>
                <td>${escapeHtml(fields["Owner"] || "N/A")}</td>
                <td>
                  <button class="btn btn-sm btn-ghost" onclick="editRFP('${
                    rfp.id
                  }')">Edit</button>
                  <button class="btn btn-sm btn-ghost" onclick="viewRFPSubmissions('${
                    rfp.id
                  }')">View Submissions</button>
                  <button class="btn btn-sm btn-ghost" onclick="copyRFPLink('${
                    rfp.id
                  }')">Copy Link</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  } catch (error) {
    console.error("Error loading RFPs:", error);
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--error-color);">Error loading RFPs</p>';
  }
}

// Load all submissions
async function loadSubmissions() {
  const container = document.getElementById("submissions-table");
  const filterStatus = document.getElementById("filter-status").value;

  container.innerHTML =
    '<p class="text-center" style="padding: 2rem;">Loading...</p>';

  try {
    let submissions = await airtableAPI.getAllSubmissions();

    // Filter by status if selected
    if (filterStatus) {
      submissions = submissions.filter(
        (s) => s.fields["Review Status"] === filterStatus
      );
    }

    if (submissions.length === 0) {
      container.innerHTML =
        '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No submissions found</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Email</th>
            <th>RFP</th>
            <th>Price</th>
            <th>Timeline</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${submissions
            .map((submission) => {
              const fields = submission.fields;
              return `
              <tr>
                <td><strong>${escapeHtml(
                  fields["Vendor Name"] || "N/A"
                )}</strong></td>
                <td>${escapeHtml(fields["Email"] || "N/A")}</td>
                <td>${escapeHtml(
                  fields["RFP"] ? "RFP #" + fields["RFP"][0] : "N/A"
                )}</td>
                <td><strong>$${(
                  fields["Base Price"] || 0
                ).toLocaleString()}</strong></td>
                <td>${fields["Timeline (Days)"]} days</td>
                <td><span class="badge badge-${getStatusBadgeClass(
                  fields["Review Status"]
                )}">${fields["Review Status"] || "Pending"}</span></td>
                <td>${fields["Internal Rating"] || "Not Rated"}</td>
                <td>${formatDate(new Date(fields["Submitted Date"]))}</td>
                <td>
                  <button class="btn btn-sm btn-ghost" onclick="viewSubmission('${
                    submission.id
                  }')">View</button>
                  <button class="btn btn-sm btn-ghost" onclick="rateSubmission('${
                    submission.id
                  }')">Rate</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  } catch (error) {
    console.error("Error loading submissions:", error);
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--error-color);">Error loading submissions</p>';
  }
}

// Load all vendors
async function loadVendors() {
  const container = document.getElementById("vendors-table");
  container.innerHTML =
    '<p class="text-center" style="padding: 2rem;">Loading...</p>';

  try {
    const vendors = await airtableAPI.getVendors();

    // Filter out pending vendors (they're in another view)
    const approvedVendors = vendors.filter(
      (v) => v.fields["Status"] !== "Pending Approval"
    );

    if (approvedVendors.length === 0) {
      container.innerHTML =
        '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No approved vendors yet</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Country</th>
            <th>Status</th>
            <th>NDA</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${approvedVendors
            .map((vendor) => {
              const fields = vendor.fields;
              return `
              <tr>
                <td><strong>${escapeHtml(fields["Vendor Name"])}</strong></td>
                <td>${escapeHtml(fields["Contact Person"] || "N/A")}</td>
                <td>${escapeHtml(fields["Email"])}</td>
                <td>${escapeHtml(fields["Country"] || "N/A")}</td>
                <td><span class="badge badge-${getStatusBadgeClass(
                  fields["Status"]
                )}">${fields["Status"] || "Not Invited"}</span></td>
                <td>${fields["NDA on File"] ? "✓" : "✗"}</td>
                <td>${formatDate(new Date(fields["Date Added"]))}</td>
                <td>
                  <button class="btn btn-sm btn-ghost" onclick="viewVendorDetails('${
                    vendor.id
                  }')">View</button>
                  <button class="btn btn-sm btn-ghost" onclick="editVendor('${
                    vendor.id
                  }')">Edit</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  } catch (error) {
    console.error("Error loading vendors:", error);
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--error-color);">Error loading vendors</p>';
  }
}

// Load pending vendor approvals
async function loadPendingVendors() {
  const container = document.getElementById("pending-vendors-table");
  const pendingAlert = document.getElementById("pending-alert");
  const pendingCount = document.getElementById("pending-count");

  container.innerHTML =
    '<p class="text-center" style="padding: 2rem;">Loading...</p>';

  try {
    const vendors = await airtableAPI.getVendors();
    const pendingVendors = vendors.filter(
      (v) => v.fields["Status"] === "Pending Approval"
    );

    pendingCount.textContent = pendingVendors.length;

    if (pendingVendors.length > 0) {
      pendingAlert.classList.remove("hidden");
    } else {
      pendingAlert.classList.add("hidden");
    }

    if (pendingVendors.length === 0) {
      container.innerHTML =
        '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No pending vendor approvals</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Country</th>
            <th>NDA File</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pendingVendors
            .map((vendor) => {
              const fields = vendor.fields;
              return `
              <tr>
                <td><strong>${escapeHtml(fields["Vendor Name"])}</strong></td>
                <td>
                  ${escapeHtml(fields["Contact Person"])}
                  ${
                    fields["Contact Title"]
                      ? `<br><small style="color: var(--text-light);">${escapeHtml(
                          fields["Contact Title"]
                        )}</small>`
                      : ""
                  }
                </td>
                <td>${escapeHtml(
                  fields["Email"]
                )}<br><small style="color: var(--text-light);">${escapeHtml(
                fields["Phone"] || "No phone"
              )}</small></td>
                <td>${escapeHtml(
                  fields["Country"] || "N/A"
                )}<br><small style="color: var(--text-light);">${escapeHtml(
                fields["Company Size"] || ""
              )}</small></td>
                <td>
                  ${
                    fields["NDA File Name"]
                      ? `<div style="color: var(--success-color);">✓ ${escapeHtml(
                          fields["NDA File Name"]
                        )}</div>`
                      : '<div style="color: var(--error-color);">✗ No file</div>'
                  }
                </td>
                <td>${formatDate(new Date(fields["Date Added"]))}</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick="approveVendor('${
                    vendor.id
                  }')">Approve</button>
                  <button class="btn btn-sm btn-ghost" onclick="viewVendorDetails('${
                    vendor.id
                  }')">View</button>
                  <button class="btn btn-sm" style="background: var(--error-color); color: white;" onclick="declineVendor('${
                    vendor.id
                  }')">Decline</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  } catch (error) {
    console.error("Error loading pending vendors:", error);
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--error-color);">Error loading pending vendors</p>';
  }
}

// Approve vendor
async function approveVendor(vendorId) {
  if (
    !confirm("Approve this vendor? They will gain access to all active RFPs.")
  ) {
    return;
  }

  try {
    await airtableAPI.updateVendor(vendorId, {
      Status: "Approved",
      "Approval Date": new Date().toISOString().split("T")[0],
    });

    alert("Vendor approved successfully! They can now log in and access RFPs.");
    loadPendingVendors();

    // TODO: Send approval email to vendor
  } catch (error) {
    console.error("Error approving vendor:", error);
    alert("Error approving vendor: " + error.message);
  }
}

// Decline vendor
async function declineVendor(vendorId) {
  const reason = prompt(
    "Reason for declining (will be stored in internal notes):"
  );
  if (!reason) return;

  try {
    const vendor = await airtableAPI.request(
      `${airtableAPI.tables.vendors}/${vendorId}`
    );
    const existingNotes = vendor.fields["Internal Notes"] || "";

    await airtableAPI.updateVendor(vendorId, {
      Status: "Declined",
      "Internal Notes": existingNotes + "\n\nDECLINED: " + reason,
    });

    alert("Vendor declined.");
    loadPendingVendors();
  } catch (error) {
    console.error("Error declining vendor:", error);
    alert("Error declining vendor: " + error.message);
  }
}

// View vendor details
async function viewVendorDetails(vendorId) {
  try {
    const vendor = await airtableAPI.request(
      `${airtableAPI.tables.vendors}/${vendorId}`
    );
    const fields = vendor.fields;

    const details = `
VENDOR INFORMATION
──────────────────────────────────────────
Company: ${fields["Vendor Name"]}
Contact: ${fields["Contact Person"]} ${
      fields["Contact Title"] ? "(" + fields["Contact Title"] + ")" : ""
    }
Email: ${fields["Email"]}
Phone: ${fields["Phone"] || "N/A"}
Website: ${fields["Website"] || "N/A"}
Country: ${fields["Country"] || "N/A"}
Company Size: ${fields["Company Size"] || "N/A"}

Services/Expertise:
${fields["Services"] || "Not provided"}

NDA STATUS
──────────────────────────────────────────
NDA on File: ${fields["NDA on File"] ? "Yes" : "No"}
File Name: ${fields["NDA File Name"] || "N/A"}
Upload Date: ${fields["NDA Upload Date"] || "N/A"}

ACCOUNT STATUS
──────────────────────────────────────────
Status: ${fields["Status"]}
Registered: ${formatDate(new Date(fields["Date Added"]))}
Approved: ${fields["Approval Date"] || "Not approved"}
Last Login: ${fields["Last Login"] || "Never"}

INTERNAL NOTES
──────────────────────────────────────────
${fields["Internal Notes"] || "No notes"}
    `;

    alert(details);
  } catch (error) {
    console.error("Error viewing vendor:", error);
    alert("Error loading vendor details");
  }
}

// Load all vendors (original function)
async function loadVendors() {
  const container = document.getElementById("vendors-table");
  container.innerHTML =
    '<p class="text-center" style="padding: 2rem;">Loading...</p>';

  try {
    const vendors = await airtableAPI.getVendors();

    if (vendors.length === 0) {
      container.innerHTML =
        '<p class="text-center" style="padding: 2rem; color: var(--text-light);">No vendors registered yet</p>';
      return;
    }

    const table = `
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Country</th>
            <th>Status</th>
            <th>NDA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${vendors
            .map((vendor) => {
              const fields = vendor.fields;
              return `
              <tr>
                <td><strong>${escapeHtml(fields["Vendor Name"])}</strong></td>
                <td>${escapeHtml(fields["Contact Person"] || "N/A")}</td>
                <td>${escapeHtml(fields["Email"])}</td>
                <td>${escapeHtml(fields["Country"] || "N/A")}</td>
                <td><span class="badge badge-${getStatusBadgeClass(
                  fields["Status"]
                )}">${fields["Status"] || "Not Invited"}</span></td>
                <td>${fields["NDA on File"] ? "✓" : "✗"}</td>
                <td>
                  <button class="btn btn-sm btn-ghost" onclick="editVendor('${
                    vendor.id
                  }')">Edit</button>
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  } catch (error) {
    console.error("Error loading vendors:", error);
    container.innerHTML =
      '<p class="text-center" style="padding: 2rem; color: var(--error-color);">Error loading vendors</p>';
  }
}

// Show create RFP modal
function showCreateRFPModal() {
  currentRFPEdit = null;
  document.getElementById("rfp-modal-title").textContent = "Create New RFP";
  document.getElementById("rfp-form").reset();
  document.getElementById("rfp-id").value = "";
  document.getElementById("rfp-modal").classList.add("active");
}

// Edit RFP
async function editRFP(recordId) {
  try {
    const rfp = await airtableAPI.getRFP(recordId);
    currentRFPEdit = rfp;

    document.getElementById("rfp-modal-title").textContent = "Edit RFP";
    document.getElementById("rfp-id").value = rfp.id;
    document.getElementById("rfp-name").value = rfp.fields["RFP Name"] || "";
    document.getElementById("rfp-objective").value =
      rfp.fields["Objective"] || "";
    document.getElementById("rfp-scope").value = rfp.fields["Scope"] || "";
    document.getElementById("rfp-timeline").value =
      rfp.fields["Timeline"] || "";
    document.getElementById("rfp-budget").value =
      rfp.fields["Budget Guidance"] || "";
    document.getElementById("rfp-deadline").value =
      rfp.fields["Submission Deadline"] || "";
    document.getElementById("rfp-owner").value = rfp.fields["Owner"] || "";
    document.getElementById("rfp-owner-email").value =
      rfp.fields["Owner Email"] || "";
    document.getElementById("rfp-status").value =
      rfp.fields["Status"] || "Draft";

    document.getElementById("rfp-modal").classList.add("active");
  } catch (error) {
    console.error("Error loading RFP:", error);
    alert("Error loading RFP details");
  }
}

// Save RFP
async function saveRFP() {
  const rfpId = document.getElementById("rfp-id").value;

  const data = {
    "RFP Name": document.getElementById("rfp-name").value,
    Objective: document.getElementById("rfp-objective").value,
    Scope: document.getElementById("rfp-scope").value,
    Timeline: document.getElementById("rfp-timeline").value,
    "Budget Guidance": document.getElementById("rfp-budget").value,
    "Submission Deadline": document.getElementById("rfp-deadline").value,
    Owner: document.getElementById("rfp-owner").value,
    "Owner Email": document.getElementById("rfp-owner-email").value,
    Status: document.getElementById("rfp-status").value,
  };

  try {
    if (rfpId) {
      await airtableAPI.updateRFP(rfpId, data);
      alert("RFP updated successfully!");
    } else {
      await airtableAPI.createRFP(data);
      alert("RFP created successfully!");
    }

    closeRFPModal();
    loadRFPs();
  } catch (error) {
    console.error("Error saving RFP:", error);
    alert("Error saving RFP: " + error.message);
  }
}

// Close RFP modal
function closeRFPModal() {
  document.getElementById("rfp-modal").classList.remove("active");
  currentRFPEdit = null;
}

// Copy RFP link
function copyRFPLink(recordId) {
  const url = `${window.location.origin}/public/rfp-detail.html?id=${recordId}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      alert("RFP link copied to clipboard!");
    })
    .catch((err) => {
      console.error("Error copying link:", err);
      prompt("Copy this link:", url);
    });
}

// View submission details
async function viewSubmission(recordId) {
  try {
    const submission = await airtableAPI.request(
      `${airtableAPI.tables.submissions}/${recordId}`
    );
    const fields = submission.fields;

    const details = `
Vendor: ${fields["Vendor Name"]}
Email: ${fields["Email"]}
Phone: ${fields["Phone"] || "N/A"}
Website: ${fields["Website"] || "N/A"}
Country: ${fields["Country"] || "N/A"}

Base Price: $${(fields["Base Price"] || 0).toLocaleString()} ${
      fields["Currency"] || "USD"
    }
Timeline: ${fields["Timeline (Days)"]} days

Assumptions:
${fields["Assumptions"]}

Exceptions:
${fields["Exceptions"] || "None"}

Optional Add-ons:
${fields["Optional Add-ons"] || "None"}

Review Status: ${fields["Review Status"] || "Pending"}
Internal Rating: ${fields["Internal Rating"] || "Not Rated"}
Internal Notes: ${fields["Internal Notes"] || "None"}
    `;

    alert(details);
  } catch (error) {
    console.error("Error viewing submission:", error);
    alert("Error loading submission details");
  }
}

// Rate submission
async function rateSubmission(recordId) {
  const rating = prompt("Enter rating (1-5 stars):", "");
  const status = prompt(
    "Review status (Pending/Under Review/Shortlisted/Rejected):",
    "Under Review"
  );
  const notes = prompt("Internal notes (optional):", "");

  if (!rating) return;

  try {
    await airtableAPI.updateSubmission(recordId, {
      "Internal Rating": `${rating}-Star`,
      "Review Status": status || "Under Review",
      "Internal Notes": notes || "",
    });

    alert("Submission updated!");
    loadSubmissions();
  } catch (error) {
    console.error("Error updating submission:", error);
    alert("Error updating submission");
  }
}

// Refresh dashboard
async function refreshDashboard() {
  await loadDashboard();
  alert("Dashboard refreshed!");
}

// Logout
function logout() {
  sessionStorage.removeItem("admin_authenticated");
  sessionStorage.removeItem("admin_login_time");
  window.location.href = "/admin/login.html";
}

// Utility functions
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeClass(status) {
  const statusMap = {
    Active: "success",
    Pending: "warning",
    "Under Review": "info",
    Shortlisted: "success",
    Rejected: "error",
    Closed: "neutral",
    Draft: "neutral",
    Submitted: "info",
    Invited: "info",
  };

  return statusMap[status] || "neutral";
}

// Stub functions for features
function showAddVendorModal() {
  alert(
    "Add Vendor feature: Create a modal similar to RFP modal for adding vendors manually"
  );
}

function editVendor(recordId) {
  alert("Edit Vendor feature: Load vendor details and allow editing");
}

function viewRFPSubmissions(recordId) {
  alert("View RFP Submissions: Filter submissions table by this RFP");
  // You can implement this by switching to submissions view with a filter
}

// Vendor approval functions
async function approveVendor(vendorId) {
  if (
    !confirm(
      "Approve this vendor? They will be able to access RFPs and submit proposals."
    )
  ) {
    return;
  }

  try {
    await airtableAPI.updateVendor(vendorId, {
      Status: "Approved",
      "Approval Date": new Date().toISOString().split("T")[0],
    });

    alert(
      "Vendor approved! They will receive an email notification (if configured)."
    );
    loadVendors();
  } catch (error) {
    console.error("Error approving vendor:", error);
    alert("Error approving vendor");
  }
}

async function declineVendor(vendorId) {
  const reason = prompt("Reason for declining (optional):");

  if (!confirm("Decline this vendor application?")) {
    return;
  }

  try {
    const updateData = {
      Status: "Declined",
    };

    if (reason) {
      updateData["Internal Notes"] = "Declined: " + reason;
    }

    await airtableAPI.updateVendor(vendorId, updateData);

    alert("Vendor declined.");
    loadVendors();
  } catch (error) {
    console.error("Error declining vendor:", error);
    alert("Error declining vendor");
  }
}

async function viewVendor(vendorId) {
  try {
    const response = await airtableAPI.request(
      `${airtableAPI.tables.vendors}/${vendorId}`
    );
    const fields = response.fields;

    const details = `
Company: ${fields["Vendor Name"]}
Contact: ${fields["Contact Person"]} (${fields["Contact Title"] || "N/A"})
Email: ${fields["Email"]}
Phone: ${fields["Phone"] || "N/A"}
Website: ${fields["Website"] || "N/A"}
Country: ${fields["Country"] || "N/A"}
Company Size: ${fields["Company Size"] || "N/A"}

Services/Expertise:
${fields["Services"] || "N/A"}

Registration Date: ${
      fields["Date Added"] ? formatDate(new Date(fields["Date Added"])) : "N/A"
    }
NDA on File: ${fields["NDA on File"] ? "Yes" : "No"}
NDA Upload Date: ${fields["NDA Upload Date"] || "N/A"}
Status: ${fields["Status"] || "N/A"}
Approval Date: ${fields["Approval Date"] || "N/A"}
Last Login: ${fields["Last Login"] || "Never"}

Internal Notes:
${fields["Internal Notes"] || "None"}
    `;

    alert(details);
  } catch (error) {
    console.error("Error viewing vendor:", error);
    alert("Error loading vendor details");
  }
}
