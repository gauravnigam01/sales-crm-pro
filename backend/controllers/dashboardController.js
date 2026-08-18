import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Event from "../models/Event.js";
import Document from "../models/Document.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import { getScopedUserIds } from "../utils/teamScope.js";

// ======================================
// Resolve the "ownership" id list a request should be scoped to:
// - admin            -> null (unfiltered, company-wide)
// - caller            -> [self]
// - manager, scope=mine -> [self] ("My Data" toggle)
// - manager, default  -> [self, ...team]           ("My Team" toggle)
// ======================================

const resolveScopeIds = async (req) => {
  if (req.user.role === "admin") return null;

  if (req.user.role === "caller") return [req.user._id.toString()];

  // manager
  if (req.query.scope === "mine") return [req.user._id.toString()];

  return getScopedUserIds(req.user);
};

// ======================================
// Growth Helper
// ======================================

const growthPercent = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

// ======================================
// Dashboard Statistics
// ======================================

export const getDashboardStats = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const prevCutoff = new Date();
    prevCutoff.setDate(prevCutoff.getDate() - days * 2);

    // Callers see only their own data; managers see their team's data (or
    // just their own, when the "My Data" toggle is active via ?scope=mine);
    // admin sees the company-wide picture.
    const isCaller = req.user.role === "caller";
    const scopeIds = await resolveScopeIds(req);
    const ownerFilter = scopeIds ? { assignedTo: { $in: scopeIds } } : {};

    const currentPeriod = { ...ownerFilter, createdAt: { $gte: cutoff } };

    const previousPeriod = {
      ...ownerFilter,
      createdAt: { $gte: prevCutoff, $lt: cutoff },
    };

    // Team headcount — not relevant to an individual caller's own view;
    // for a manager this counts only their own team's callers.
    const callerHeadcountFilter = { role: "caller" };

    if (req.user.role === "manager" && scopeIds) {
      callerHeadcountFilter._id = { $in: scopeIds };
    }

    // All of these are independent reads — running them in parallel instead
    // of one-by-one turns ~17 sequential round-trips to Atlas into one,
    // which is most of what made the dashboard feel slow to load.
    const [
      totalLeads,
      periodLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      closedWon,
      closedLost,
      qualifiedLeads,
      followUpLeads,
      prevTotalLeads,
      prevClosedWon,
      totalCallers,
      activeCallers,
      inactiveCallers,
      pendingTasks,
      upcomingMeetings,
      totalDocuments,
      totalCustomers,
      revenueAgg,
    ] = await Promise.all([
      // The grand total — matches the count shown on the Leads page (no
      // date restriction). The period-scoped count below exists only to
      // drive the growth-percentage badge, not the displayed value.
      Lead.countDocuments(ownerFilter),
      Lead.countDocuments(currentPeriod),
      Lead.countDocuments({ ...currentPeriod, status: "New" }),
      Lead.countDocuments({ ...currentPeriod, status: "Contacted" }),
      Lead.countDocuments({ ...currentPeriod, status: "Interested" }),
      Lead.countDocuments({ ...currentPeriod, status: "Closed Won" }),
      Lead.countDocuments({ ...currentPeriod, status: "Closed Lost" }),
      Lead.countDocuments({ ...currentPeriod, status: "Qualified" }),
      Lead.countDocuments({ ...currentPeriod, status: "Follow Up" }),
      Lead.countDocuments(previousPeriod),
      Lead.countDocuments({ ...previousPeriod, status: "Closed Won" }),
      isCaller ? 0 : User.countDocuments(callerHeadcountFilter),
      isCaller
        ? 0
        : User.countDocuments({ ...callerHeadcountFilter, status: "active" }),
      isCaller
        ? 0
        : User.countDocuments({ ...callerHeadcountFilter, status: "inactive" }),
      Task.countDocuments({ ...ownerFilter, status: "Pending" }),
      Event.countDocuments({
        ...(scopeIds
          ? {
              $or: [
                { assignedTo: { $in: scopeIds } },
                { createdBy: { $in: scopeIds } },
              ],
            }
          : {}),
        status: "Scheduled",
        date: { $gte: new Date() },
      }),
      Document.countDocuments(scopeIds ? { uploadedBy: { $in: scopeIds } } : {}),
      Customer.countDocuments(ownerFilter),
      // Revenue is tracked on the Customer record (set when a customer is
      // converted/updated), not via the Deal pipeline's "Won" stage — that's
      // where the real numbers live, so that's the source of truth here.
      Customer.aggregate([
        { $match: ownerFilter },
        { $group: { _id: null, total: { $sum: "$revenue" } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalLeads,
        newLeads,
        contactedLeads,
        interestedLeads,
        closedWon,
        closedLost,
        qualifiedLeads,
        followUpLeads,
        totalCallers,
        activeCallers,
        inactiveCallers,
        pendingTasks,
        upcomingMeetings,
        totalDocuments,
        totalCustomers,
        totalRevenue,
        growth: {
          totalLeads: growthPercent(periodLeads, prevTotalLeads),
          closedWon: growthPercent(closedWon, prevClosedWon),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Recent Activity (across Leads, Customers, Deals)
// ======================================

export const getRecentActivity = async (req, res) => {
  try {
    const scopeIds = await resolveScopeIds(req);
    const ownerMatch = scopeIds ? { assignedTo: { $in: scopeIds } } : {};

    const activities = await Lead.aggregate([
      { $match: ownerMatch },
      { $unwind: "$timeline" },
      {
        $project: {
          _id: "$timeline._id",
          action: "$timeline.action",
          performedBy: "$timeline.performedBy",
          createdAt: "$timeline.createdAt",
          entityType: { $literal: "Lead" },
          entityName: "$customerName",
        },
      },
      {
        $unionWith: {
          coll: "customers",
          pipeline: [
            { $match: ownerMatch },
            { $unwind: "$timeline" },
            {
              $project: {
                _id: "$timeline._id",
                action: "$timeline.action",
                performedBy: "$timeline.performedBy",
                createdAt: "$timeline.createdAt",
                entityType: { $literal: "Customer" },
                entityName: "$customerName",
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: "deals",
          pipeline: [
            { $match: ownerMatch },
            { $unwind: "$timeline" },
            {
              $project: {
                _id: "$timeline._id",
                action: "$timeline.action",
                performedBy: "$timeline.performedBy",
                createdAt: "$timeline.createdAt",
                entityType: { $literal: "Deal" },
                entityName: "$title",
              },
            },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "users",
          localField: "performedBy",
          foreignField: "_id",
          as: "performedByUser",
        },
      },
      {
        $addFields: {
          performedByName: {
            $arrayElemAt: ["$performedByUser.fullName", 0],
          },
        },
      },
      {
        $project: {
          action: 1,
          entityType: 1,
          entityName: 1,
          createdAt: 1,
          performedByName: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Recent Leads
// ======================================

export const getRecentLeads = async (req, res) => {
  try {
    const scopeIds = await resolveScopeIds(req);
    const filter = scopeIds ? { assignedTo: { $in: scopeIds } } : {};

    const leads = await Lead.find(filter)
      .populate("assignedTo", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
