import Lead from "../models/Lead.js";

export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      message: "Lead Created Successfully",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};