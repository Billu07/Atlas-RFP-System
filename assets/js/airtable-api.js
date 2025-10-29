/**
 * Airtable API Helper - Vercel Serverless Version
 * Uses serverless functions to keep API keys secure
 */

class AirtableAPI {
  constructor(config) {
    this.config = config;
    this.apiBase = "/api"; // Vercel serverless functions path
  }

  /**
   * Generic request method to serverless functions
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBase}/${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  /**
   * Get all active RFPs
   */
  async getActiveRFPs() {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getActiveRFPs",
      }),
    });
    return data.records;
  }

  /**
   * Get a single RFP by ID
   */
  async getRFP(recordId) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getRFP",
        recordId: recordId,
      }),
    });
    return data.record;
  }

  /**
   * Get all RFPs (for admin)
   */
  async getAllRFPs() {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getAllRFPs",
      }),
    });
    return data.records;
  }

  /**
   * Create a new RFP
   */
  async createRFP(fields) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "createRFP",
        table: "rfps",
        data: fields,
      }),
    });
    return data.record;
  }

  /**
   * Update an RFP
   */
  async updateRFP(recordId, fields) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "updateRFP",
        recordId: recordId,
        data: fields,
      }),
    });
    return data.record;
  }

  /**
   * Submit a bid
   */
  async submitBid(fields) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "submitBid",
        table: "submissions",
        data: fields,
      }),
    });
    return data.record;
  }

  /**
   * Get all submissions for an RFP
   */
  async getSubmissionsByRFP(rfpRecordId) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getSubmissionsByRFP",
        rfpRecordId: rfpRecordId,
      }),
    });
    return data.records;
  }

  /**
   * Get all submissions (for admin)
   */
  async getAllSubmissions() {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getAllSubmissions",
      }),
    });
    return data.records;
  }

  /**
   * Update submission (for admin reviews)
   */
  async updateSubmission(recordId, fields) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "updateSubmission",
        recordId: recordId,
        data: fields,
      }),
    });
    return data.record;
  }

  /**
   * Get all vendors
   */
  async getVendors() {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getVendors",
      }),
    });
    return data.records;
  }

  /**
   * Create a vendor
   */
  async createVendor(fields) {
    console.log("Creating vendor via serverless function...", fields);

    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "createVendor",
        table: "vendors",
        data: fields,
      }),
    });

    console.log("Serverless createVendor response:", data);
    return data.record;
  }

  /**
   * Update a vendor
   */
  async updateVendor(recordId, fields) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "updateVendor",
        recordId: recordId,
        data: fields,
      }),
    });
    return data.record;
  }

  /**
   * Get vendor by email
   */
  async getVendorByEmail(email) {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getVendorByEmail",
        email: email,
      }),
    });
    return data.record;
  }

  /**
   * Upload file to Airtable (via Cloudinary)
   */
  async uploadAttachment(url, filename) {
    return [
      {
        url: url,
        filename: filename,
      },
    ];
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const data = await this.apiRequest("airtable", {
      method: "POST",
      body: JSON.stringify({
        action: "getDashboardStats",
      }),
    });
    return data.stats;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AirtableAPI;
}
