/**
 * Cloudinary Upload Helper
 * Handles file uploads to Cloudinary for NDA documents
 */

class CloudinaryUploader {
  constructor(cloudName, uploadPreset) {
    this.cloudName = "djwuqsy1o";
    this.uploadPreset = "atlas_rfp_nda";
    this.apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  }

  /**
   * Upload file to Cloudinary
   * @param {File} file - The file to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload response with secure_url
   */
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.uploadPreset);

    // Add folder organization
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    // Add custom filename
    if (options.publicId) {
      formData.append("public_id", options.publicId);
    }

    // Add tags for organization
    if (options.tags) {
      formData.append("tags", options.tags.join(","));
    }

    // Add context (metadata)
    if (options.context) {
      const contextStr = Object.entries(options.context)
        .map(([key, value]) => `${key}=${value}`)
        .join("|");
      formData.append("context", contextStr);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        resourceType: data.resource_type,
        bytes: data.bytes,
        createdAt: data.created_at,
        originalFilename: file.name,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  /**
   * Upload NDA with specific naming and organization
   * @param {File} file - NDA file to upload
   * @param {string} vendorName - Vendor company name
   * @param {string} vendorEmail - Vendor email
   * @returns {Promise<Object>} Upload response
   */
  async uploadNDA(file, vendorName, vendorEmail) {
    // Create clean filename
    const timestamp = new Date().getTime();
    const cleanVendorName = vendorName.replace(/[^a-zA-Z0-9]/g, "_");
    const publicId = `NDA_${cleanVendorName}_${timestamp}`;

    return await this.uploadFile(file, {
      folder: "atlas-rfp/ndas",
      publicId: publicId,
      tags: ["nda", "vendor-registration"],
      context: {
        vendor: vendorName,
        email: vendorEmail,
        upload_date: new Date().toISOString(),
      },
    });
  }

  /**
   * Generate thumbnail URL for documents
   * @param {string} publicId - Cloudinary public ID
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(publicId) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,h_200,w_150/${publicId}.jpg`;
  }

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteFile(publicId) {
    // Note: Deletion requires authentication signature
    // This should be done server-side for security
    console.warn("File deletion should be handled server-side");
    throw new Error("File deletion requires server-side implementation");
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = CloudinaryUploader;
}
