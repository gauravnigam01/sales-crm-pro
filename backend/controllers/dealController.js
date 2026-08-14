import Deal from "../models/Deal.js";
import createNotification from "../utils/createNotification.js";
import { buildScopeFilter, isUserInScope } from "../utils/teamScope.js";

// admin: always. manager: only deals within their team (or themselves).
// (Callers never reach these controllers — Deals/Pipeline is
// manager+admin only, enforced at the route level.)
const canAccessDeal = async (user, deal) => {
  if (user.role === "admin") return true;

  const assignedToId = deal.assignedTo?._id || deal.assignedTo;

  return isUserInScope(user, assignedToId);
};

// ==========================
// Create Deal
// ==========================

export const createDeal = async (req, res) => {

  try {

    if (req.user.role === "manager" && req.body.assignedTo) {
      const allowed = await isUserInScope(req.user, req.body.assignedTo);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You can only assign deals to members of your team",
        });
      }
    }

    const deal = await Deal.create({

      ...req.body,

      createdBy: req.user._id,

      assignedTo:
        req.body.assignedTo ||

        req.user._id,

      timeline: [

        {

          action:

            "Deal Created",

          performedBy:

            req.user._id,

        },

      ],

    });

    await createNotification(

      "New Deal Created",

      `${deal.title} has been created.`,

      "deal"

    );

    res.status(201).json({

      success: true,

      message:

        "Deal Created Successfully",

      deal,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Get All Deals
// ==========================

export const getAllDeals = async (

  req,

  res

) => {

  try {

    const filter = await buildScopeFilter(req.user, "assignedTo");

    const deals = await Deal.find(filter)

      .populate(

        "customer",

        "customerName"

      )

      .populate(

        "lead",

        "customerName"

      )

      .populate(

        "assignedTo",

        "fullName"

      )

      .sort({

        createdAt: -1,

      });

    res.status(200).json({

      success: true,

      count: deals.length,

      deals,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Get Single Deal
// ==========================

export const getDealById = async (

  req,

  res

) => {

  try {

    const deal = await Deal.findById(

      req.params.id

    )

      .populate(

        "customer"

      )

      .populate(

        "lead"

      )

      .populate(

        "assignedTo",

        "fullName"

      );

    if (!deal) {

      return res.status(404).json({

        success: false,

        message:

          "Deal not found",

      });

    }

    if (!(await canAccessDeal(req.user, deal))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    res.status(200).json({

      success: true,

      deal,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
// ==========================
// Update Deal
// ==========================

export const updateDeal = async (req, res) => {

  try {

    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {

      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });

    }

    if (!(await canAccessDeal(req.user, deal))) {

      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });

    }

    if (req.body.assignedTo && req.user.role === "manager") {
      const allowed = await isUserInScope(req.user, req.body.assignedTo);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You can only assign deals to members of your team",
        });
      }
    }

    const oldStage = deal.stage;

    deal.title =
      req.body.title || deal.title;

    deal.amount =
      req.body.amount || deal.amount;

    deal.stage =
      req.body.stage || deal.stage;

    deal.probability =
      req.body.probability || deal.probability;

    deal.expectedClosingDate =
      req.body.expectedClosingDate ||
      deal.expectedClosingDate;

    if (req.body.customer) {

      deal.customer = req.body.customer;

    }

    if (req.body.lead) {

      deal.lead = req.body.lead;

    }

    if (req.body.assignedTo) {

      deal.assignedTo = req.body.assignedTo;

    }

    deal.timeline.push({

      action: "Deal Updated",

      performedBy: req.user._id,

    });

    if (oldStage !== deal.stage) {

      deal.timeline.push({

        action: `Stage Changed from ${oldStage} to ${deal.stage}`,

        performedBy: req.user._id,

      });

    }

    await deal.save();

    await createNotification(

      "Deal Updated",

      `${deal.title} has been updated.`,

      "deal"

    );

    res.status(200).json({

      success: true,

      message: "Deal Updated Successfully",

      deal,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Delete Deal
// ==========================

export const deleteDeal = async (req, res) => {

  try {

    const { id } = req.params;

    const deal = await Deal.findById(id);

    if (!deal) {

      return res.status(404).json({

        success: false,

        message: "Deal not found",

      });

    }

    if (!(await canAccessDeal(req.user, deal))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    await Deal.findByIdAndDelete(id);

    await createNotification(

      "Deal Deleted",

      `${deal.title} has been deleted.`,

      "deal"

    );

    res.status(200).json({

      success: true,

      message: "Deal Deleted Successfully",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Add Deal Note
// ==========================

export const addDealNote = async (req, res) => {

  try {

    const { id } = req.params;

    const { text } = req.body;

    const deal = await Deal.findById(id);

    if (!deal) {

      return res.status(404).json({

        success: false,

        message: "Deal not found",

      });

    }

    if (!(await canAccessDeal(req.user, deal))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    deal.notes.push({

      text,

      addedBy: req.user._id,

    });

    deal.timeline.push({

      action: `Note Added : ${text}`,

      performedBy: req.user._id,

    });

    await deal.save();

    res.status(200).json({

      success: true,

      message: "Note Added Successfully",

      deal,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==========================
// Change Deal Stage
// ==========================

export const changeDealStage = async (req, res) => {

  try {

    const { id } = req.params;

    const { stage } = req.body;

    const deal = await Deal.findById(id);

    if (!deal) {

      return res.status(404).json({

        success: false,

        message: "Deal not found",

      });

    }

    if (!(await canAccessDeal(req.user, deal))) {

      return res.status(403).json({

        success: false,

        message: "Access Denied",

      });

    }

    const oldStage = deal.stage;

    deal.stage = stage;

    deal.timeline.push({

      action: `Stage Changed from ${oldStage} to ${stage}`,

      performedBy: req.user._id,

    });

    await deal.save();

    await createNotification(

      "Deal Stage Updated",

      `${deal.title} moved to ${stage}`,

      "deal"

    );

    res.status(200).json({

      success: true,

      message: "Stage Updated Successfully",

      deal,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};
