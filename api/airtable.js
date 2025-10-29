// api/airtable.js - Vercel Serverless Function
const Airtable = require("airtable");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { action, table, data, recordId, email, rfpRecordId } = req.body;

    // Initialize Airtable with environment variables
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID);

    // Define table mappings
    const tables = {
      rfps: "RFPs",
      vendors: "Vendors",
      submissions: "Submissions",
      decisions: "Decisions",
    };

    const tableName = tables[table] || table;

    switch (action) {
      case "getActiveRFPs":
        const activeRFPs = await base("RFPs")
          .select({
            filterByFormula:
              "AND({Status} = 'Active', IS_AFTER({Submission Deadline}, NOW()))",
            sort: [{ field: "Submission Deadline", direction: "asc" }],
          })
          .firstPage();
        return res.json({ success: true, records: activeRFPs });

      case "getRFP":
        const rfp = await base("RFPs").find(recordId);
        return res.json({ success: true, record: rfp });

      case "getAllRFPs":
        const allRFPs = await base("RFPs")
          .select({
            sort: [{ field: "Created Date", direction: "desc" }],
          })
          .firstPage();
        return res.json({ success: true, records: allRFPs });

      case "createRFP":
        const newRFP = await base("RFPs").create([{ fields: data }]);
        return res.json({ success: true, record: newRFP[0] });

      case "updateRFP":
        const updatedRFP = await base("RFPs").update([
          { id: recordId, fields: data },
        ]);
        return res.json({ success: true, record: updatedRFP[0] });

      case "submitBid":
        const newSubmission = await base("Submissions").create([
          { fields: data },
        ]);
        return res.json({ success: true, record: newSubmission[0] });

      case "getSubmissionsByRFP":
        const submissions = await base("Submissions")
          .select({
            filterByFormula: `{RFP} = '${rfpRecordId}'`,
            sort: [{ field: "Submitted Date", direction: "desc" }],
          })
          .firstPage();
        return res.json({ success: true, records: submissions });

      case "getAllSubmissions":
        const allSubmissions = await base("Submissions")
          .select({
            sort: [{ field: "Submitted Date", direction: "desc" }],
          })
          .firstPage();
        return res.json({ success: true, records: allSubmissions });

      case "updateSubmission":
        const updatedSubmission = await base("Submissions").update([
          { id: recordId, fields: data },
        ]);
        return res.json({ success: true, record: updatedSubmission[0] });

      case "getVendors":
        const vendors = await base("Vendors")
          .select({
            sort: [{ field: "Vendor Name", direction: "asc" }],
          })
          .firstPage();
        return res.json({ success: true, records: vendors });

      case "createVendor":
        console.log("Creating vendor with data:", data);
        const newVendor = await base("Vendors").create([{ fields: data }]);
        console.log("Vendor created:", newVendor[0]);
        return res.json({ success: true, record: newVendor[0] });

      case "updateVendor":
        const updatedVendor = await base("Vendors").update([
          { id: recordId, fields: data },
        ]);
        return res.json({ success: true, record: updatedVendor[0] });

      case "getVendorByEmail":
        const vendorRecords = await base("Vendors")
          .select({
            filterByFormula: `{Email} = '${email}'`,
          })
          .firstPage();
        return res.json({
          success: true,
          record: vendorRecords.length > 0 ? vendorRecords[0] : null,
        });

      case "getDashboardStats":
        const [rfps, submissions, vendorsList] = await Promise.all([
          base("RFPs").select().firstPage(),
          base("Submissions").select().firstPage(),
          base("Vendors").select().firstPage(),
        ]);

        const activeRFPsCount = rfps.filter(
          (r) => r.fields.Status === "Active"
        ).length;
        const totalSubmissions = submissions.length;
        const pendingReviews = submissions.filter(
          (s) => s.fields["Review Status"] === "Pending"
        ).length;
        const totalVendors = vendorsList.length;

        return res.json({
          success: true,
          stats: {
            activeRFPs: activeRFPsCount,
            totalSubmissions: totalSubmissions,
            pendingReviews: pendingReviews,
            totalVendors: totalVendors,
          },
        });

      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid action" });
    }
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
