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
