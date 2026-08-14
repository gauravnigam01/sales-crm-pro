import Lead from "../models/Lead.js";
import Deal from "../models/Deal.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import { getOnlineUserIds } from "../socket/socket.js";
import { getScopedUserIds } from "../utils/teamScope.js";

export const getTeamPerformance = async (req, res) => {
  try {
    const onlineUserIds = getOnlineUserIds();

    // A manager should never see confidential company-wide figures or
    // other managers'/teams' leaderboard rows — only their own team.
    const scopedIds = await getScopedUserIds(req.user);
    const leadScopeFilter = scopedIds ? { assignedTo: { $in: scopedIds } } : {};

    // ======================================
    // Overview
    // ======================================

    const totalLeads = await Lead.countDocuments(leadScopeFilter);

    const hotLeads = await Lead.countDocuments({
      ...leadScopeFilter,
      temperature: "Hot",
    });

    const closed = await Lead.countDocuments({
      ...leadScopeFilter,
      status: { $in: ["Closed Won", "Closed Lost"] },
    });

    const activityCounts = await Lead.aggregate([
      { $match: leadScopeFilter },
      { $unwind: "$timeline" },
      {
        $match: {
          "timeline.action": { $in: ["Call Done", "Meeting Done"] },
        },
      },
      {
        $group: {
          _id: {
            user: "$timeline.performedBy",
            action: "$timeline.action",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const activityMap = {};

    activityCounts.forEach((row) => {
      const userId = row._id.user?.toString();

      if (!userId) return;

      if (!activityMap[userId]) {
        activityMap[userId] = { calls: 0, visits: 0 };
      }

      if (row._id.action === "Call Done") {
        activityMap[userId].calls = row.count;
      }

      if (row._id.action === "Meeting Done") {
        activityMap[userId].visits = row.count;
      }
    });

    const totalCallsDone = Object.values(activityMap).reduce(
      (sum, a) => sum + a.calls,
      0
    );

    const totalMeetingsDone = Object.values(activityMap).reduce(
      (sum, a) => sum + a.visits,
      0
    );

    // ======================================
    // Leaderboard
    // ======================================

    const memberFilter = scopedIds
      ? { role: { $in: ["manager", "caller"] }, _id: { $in: scopedIds } }
      : { role: { $in: ["manager", "caller"] } };

    const teamMembers = await User.find(memberFilter).select(
      "fullName role status monthlyTarget"
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leaderboard = await Promise.all(
      teamMembers.map(async (member) => {
        const leads = await Lead.countDocuments({
          assignedTo: member._id,
        });

        const hot = await Lead.countDocuments({
          assignedTo: member._id,
          temperature: "Hot",
        });

        const memberClosed = await Lead.countDocuments({
          assignedTo: member._id,
          status: { $in: ["Closed Won", "Closed Lost"] },
        });

        const achieved = await Lead.countDocuments({
          assignedTo: member._id,
          status: "Closed Won",
          updatedAt: { $gte: startOfMonth },
        });

        const revenueAgg = await Deal.aggregate([
          {
            $match: {
              assignedTo: member._id,
              stage: "Won",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const activity = activityMap[member._id.toString()] || {
          calls: 0,
          visits: 0,
        };

        return {
          _id: member._id,
          fullName: member.fullName,
          role: member.role,
          status: member.status,
          isOnline: onlineUserIds.includes(member._id.toString()),
          leads,
          hot,
          calls: activity.calls,
          visits: activity.visits,
          closed: memberClosed,
          revenue: revenueAgg[0]?.total || 0,
          monthlyTarget: member.monthlyTarget || 10,
          achieved,
        };
      })
    );

    leaderboard.sort((a, b) => b.revenue - a.revenue || b.closed - a.closed);

    res.status(200).json({
      success: true,
      overview: {
        totalLeads,
        callsDone: totalCallsDone,
        meetingsDone: totalMeetingsDone,
        hotLeads,
        closed,
        onlineNow: scopedIds
          ? onlineUserIds.filter((id) => scopedIds.includes(id)).length
          : onlineUserIds.length,
      },
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Team
// ======================================

export const createTeam = async (req, res) => {
  try {
    const { name, manager } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team Name is Required",
      });
    }

    const team = await Team.create({
      name,
      manager: manager || null,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: "Team Created Successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Teams (with member count + revenue summary)
// ======================================

export const getAllTeams = async (req, res) => {
  try {
    // A manager may only ever see their own team's group(s), never other
    // managers'/teams' groups.
    const filter = req.user.role === "manager" ? { manager: req.user._id } : {};

    const teams = await Team.find(filter)
      .populate("manager", "fullName")
      .sort({ createdAt: -1 });

    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const memberIds = await User.find({ teamId: team._id }).distinct(
          "_id"
        );

        const memberCount = memberIds.length;

        const leadCount = await Lead.countDocuments({
          assignedTo: { $in: memberIds },
        });

        const revenueAgg = await Deal.aggregate([
          {
            $match: {
              assignedTo: { $in: memberIds },
              stage: "Won",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        return {
          _id: team._id,
          name: team.name,
          manager: team.manager,
          memberCount,
          leadCount,
          revenue: revenueAgg[0]?.total || 0,
          createdAt: team.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: teamsWithStats.length,
      teams: teamsWithStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Team (members, leads, performance)
// ======================================

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id).populate("manager", "fullName email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team Not Found",
      });
    }

    if (
      req.user.role === "manager" &&
      team.manager?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const members = await User.find({ teamId: id }).select(
      "fullName email role status monthlyTarget"
    );

    const memberIds = members.map((m) => m._id);

    const leads = await Lead.find({ assignedTo: { $in: memberIds } })
      .populate("assignedTo", "fullName")
      .sort({ createdAt: -1 });

    const revenueAgg = await Deal.aggregate([
      {
        $match: {
          assignedTo: { $in: memberIds },
          stage: "Won",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const closedWon = await Lead.countDocuments({
      assignedTo: { $in: memberIds },
      status: "Closed Won",
    });

    res.status(200).json({
      success: true,
      team,
      members,
      leads,
      stats: {
        memberCount: members.length,
        leadCount: leads.length,
        closedWon,
        revenue: revenueAgg[0]?.total || 0,
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
// Update Team
// ======================================

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, manager } = req.body;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team Not Found",
      });
    }

    if (name) team.name = name;
    if (manager !== undefined) team.manager = manager || null;

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team Updated Successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Team
// ======================================

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team Not Found",
      });
    }

    await User.updateMany({ teamId: id }, { teamId: null });

    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Team Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
