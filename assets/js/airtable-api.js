/**
 * Airtable API Helper
 * Handles all Airtable operations for the RFP system
 */

class AirtableAPI {
  constructor(config) {
    this.baseId = config.airtable.baseId;
    this.apiKey = config.airtable.apiKey;
    this.tables = config.airtable.tables;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Airtable API error");
      }

      return await response.json();
    } catch (error) {
      console.error("Airtable API Error:", error);
      throw error;
    }
  }

  /**
   * Get all active RFPs
   */
  async getActiveRFPs() {
    const formula = encodeURIComponent(
      "AND({Status} = 'Active', IS_AFTER({Submission Deadline}, NOW()))"
    );
    const data = await this.request(
      `${this.tables.rfps}?filterByFormula=${formula}&sort[0][field]=Submission Deadline&sort[0][direction]=asc`
    );
    return data.records;
  }

  /**
   * Get a single RFP by ID
   */
  async getRFP(recordId) {
    const data = await this.request(`${this.tables.rfps}/${recordId}`);
    return data;
  }

  /**
   * Get all RFPs (for admin)
   */
  async getAllRFPs() {
    const data = await this.request(
      `${this.tables.rfps}?sort[0][field]=Created Date&sort[0][direction]=desc`
    );
    return data.records;
  }

  /**
   * Create a new RFP
   */
  async createRFP(fields) {
    const data = await this.request(this.tables.rfps, {
      method: "POST",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Update an RFP
   */
  async updateRFP(recordId, fields) {
    const data = await this.request(`${this.tables.rfps}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Delete an RFP
   */
  async deleteRFP(recordId) {
    const data = await this.request(`${this.tables.rfps}/${recordId}`, {
      method: "DELETE",
    });
    return data;
  }

  /**
   * Submit a bid
   */
  async submitBid(fields) {
    const data = await this.request(this.tables.submissions, {
      method: "POST",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Get all submissions for an RFP
   */
  async getSubmissionsByRFP(rfpRecordId) {
    const formula = encodeURIComponent(`{RFP} = '${rfpRecordId}'`);
    const data = await this.request(
      `${this.tables.submissions}?filterByFormula=${formula}&sort[0][field]=Submitted Date&sort[0][direction]=desc`
    );
    return data.records;
  }

  /**
   * Get all submissions (for admin)
   */
  async getAllSubmissions() {
    const data = await this.request(
      `${this.tables.submissions}?sort[0][field]=Submitted Date&sort[0][direction]=desc`
    );
    return data.records;
  }

  /**
   * Update submission (for admin reviews)
   */
  async updateSubmission(recordId, fields) {
    const data = await this.request(`${this.tables.submissions}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Get all vendors
   */
  async getVendors() {
    const data = await this.request(
      `${this.tables.vendors}?sort[0][field]=Vendor Name&sort[0][direction]=asc`
    );
    return data.records;
  }

  /**
   * Create a vendor
   */
  async createVendor(fields) {
    const data = await this.request(this.tables.vendors, {
      method: "POST",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Update a vendor
   */
  async updateVendor(recordId, fields) {
    const data = await this.request(`${this.tables.vendors}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: fields,
      }),
    });
    return data;
  }

  /**
   * Get vendor by email
   */
  async getVendorByEmail(email) {
    const formula = encodeURIComponent(`{Email} = '${email}'`);
    const data = await this.request(
      `${this.tables.vendors}?filterByFormula=${formula}`
    );
    return data.records.length > 0 ? data.records[0] : null;
  }

  /**
   * Upload file to Airtable (requires attachment field)
   * Note: Files must be uploaded to a temporary URL first, then passed to Airtable
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
    const [rfps, submissions, vendors] = await Promise.all([
      this.getAllRFPs(),
      this.getAllSubmissions(),
      this.getVendors(),
    ]);

    const activeRFPs = rfps.filter((r) => r.fields.Status === "Active").length;
    const totalSubmissions = submissions.length;
    const pendingReviews = submissions.filter(
      (s) => s.fields["Review Status"] === "Pending"
    ).length;
    const shortlisted = submissions.filter(
      (s) => s.fields["Review Status"] === "Shortlisted"
    ).length;

    return {
      activeRFPs,
      totalSubmissions,
      pendingReviews,
      shortlisted,
      totalVendors: vendors.length,
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AirtableAPI;
}
