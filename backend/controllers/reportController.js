import Lead from "../models/Lead.js";
import Deal from "../models/Deal.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import { buildScopeFilter, getScopedUserIds } from "../utils/teamScope.js";

// ======================================
// Sales Report
// ======================================

export const getSalesReport = async (req, res) => {
  try {
    const dealFilter = await buildScopeFilter(req.user, "assignedTo");
    const customerFilter = await buildScopeFilter(req.user, "assignedTo");

    const totalDeals = await Deal.countDocuments(dealFilter);

    const dealsWon = await Deal.countDocuments({ ...dealFilter, stage: "Won" });

    const dealsLost = await Deal.countDocuments({ ...dealFilter, stage: "Lost" });

    const openDeals = totalDeals - dealsWon - dealsLost;

    // Revenue is tracked on the Customer record (set when a customer is
    // converted/updated), not via the Deal pipeline's "Won" stage — that's
    // where the real numbers live, so that's the source of truth here.
    const revenueAgg = await Customer.aggregate([
      { $match: customerFilter },
      { $group: { _id: null, total: { $sum: "$revenue" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const monthlyRevenue = await Customer.aggregate([
      { $match: { ...customerFilter, revenue: { $gt: 0 } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const winRate =
      totalDeals > 0 ? ((dealsWon / totalDeals) * 100).toFixed(1) : 0;

    const dealsByStage = await Deal.aggregate([
      { $match: dealFilter },
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      report: {
        totalDeals,
        dealsWon,
        dealsLost,
        openDeals,
        totalRevenue,
        winRate: Number(winRate),
        monthlyRevenue,
        dealsByStage,
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
// Lead Report
// ======================================

export const getLeadReport = async (req, res) => {
  try {
    const leadFilter = await buildScopeFilter(req.user, "assignedTo");

    const totalLeads = await Lead.countDocuments(leadFilter);

    const closedWon = await Lead.countDocuments({
      ...leadFilter,
      status: "Closed Won",
    });

    const leadsBySource = await Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const leadsByStatus = await Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const conversionRate =
      totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      report: {
        totalLeads,
        closedWon,
        conversionRate: Number(conversionRate),
        leadsBySource,
        leadsByStatus,
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
// Agent Performance Report
// ======================================

export const getAgentReport = async (req, res) => {
  try {
    const callerFilter = { role: "caller" };

    if (req.user.role === "manager") {
      const scopedIds = await getScopedUserIds(req.user);
      callerFilter._id = { $in: scopedIds };
    }

    const callers = await User.find(callerFilter).select(
      "fullName assignedLeads totalCalls totalSales status"
    );

    const agents = await Promise.all(
      callers.map(async (caller) => {
        const closedWon = await Lead.countDocuments({
          assignedTo: caller._id,
          status: "Closed Won",
        });

        const revenueAgg = await Deal.aggregate([
          {
            $match: {
              assignedTo: caller._id,
              stage: "Won",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        return {
          _id: caller._id,
          fullName: caller.fullName,
          status: caller.status,
          assignedLeads: caller.assignedLeads,
          totalCalls: caller.totalCalls,
          closedWon,
          revenue: revenueAgg[0]?.total || 0,
        };
      })
    );

    agents.sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Task Report
// ======================================

export const getTaskReport = async (req, res) => {
  try {
    const taskFilter = await buildScopeFilter(req.user, "assignedTo");

    const totalTasks = await Task.countDocuments(taskFilter);

    const pending = await Task.countDocuments({ ...taskFilter, status: "Pending" });

    const inProgress = await Task.countDocuments({
      ...taskFilter,
      status: "In Progress",
    });

    const completed = await Task.countDocuments({
      ...taskFilter,
      status: "Completed",
    });

    const overdue = await Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: "Completed" },
    });

    res.status(200).json({
      success: true,
      report: {
        totalTasks,
        pending,
        inProgress,
        completed,
        overdue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
