import * as reportModel from "../models/reportModel.js";
import { isValidEmail } from "../utils/emailValidator.js";

export const createReport = async (req, res) => {
  const { detail, userEmail, roomId, buildingId, problemStartAt, problemEndAt } = req.body;

  // check all field
  if (!detail || !userEmail || !roomId || !buildingId || !problemStartAt || !problemEndAt) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

    if (!isValidEmail(userEmail)) {
      return res.status(400).json({ success: false, error: "Only student and teacher emails are allowed." });
    }

  try {
    const result = await reportModel.createReport(detail, userEmail, roomId, buildingId, problemStartAt, problemEndAt);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to create report." });
    }

    res.json({ success: true, message: "Report submitted successfully!" });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllReports = async (req, res) => {
    try {
      const reports = await reportModel.getAllReports();
      res.json({ success: true, data: reports });
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
