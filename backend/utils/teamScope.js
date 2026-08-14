import User from "../models/User.js";
import Team from "../models/Team.js";

// ======================================
// Resolve a manager's team → array of member ObjectId strings
// (does NOT include the manager themselves)
// ======================================
// Two mechanisms exist in this codebase for grouping a caller under a
// manager: the direct `User.manager` pointer (set via Edit User) and the
// named `Team` groups (Team.manager + User.teamId). Both are honored so a
// manager's scope always reflects whichever one was actually used.

export const getTeamMemberIds = async (managerId) => {
  const teams = await Team.find({ manager: managerId }).select("_id");
  const teamIds = teams.map((t) => t._id);

  const members = await User.find({
    $or: [
      { manager: managerId },
      ...(teamIds.length ? [{ teamId: { $in: teamIds } }] : []),
    ],
  }).select("_id");

  return members.map((m) => m._id.toString());
};

// ======================================
// Scoped id list for a requesting user:
// - admin   -> null (no restriction — caller should skip filtering entirely)
// - manager -> [self, ...team member ids]
// - caller  -> [self]
// ======================================

export const getScopedUserIds = async (user) => {
  if (user.role === "admin") return null;

  if (user.role === "manager") {
    const teamIds = await getTeamMemberIds(user._id);
    return [user._id.toString(), ...teamIds];
  }

  return [user._id.toString()];
};

// ======================================
// Mongo filter fragment for a given "ownership" field
// (e.g. { assignedTo: { $in: [...] } }), empty object for admin
// ======================================

export const buildScopeFilter = async (user, field = "assignedTo") => {
  const ids = await getScopedUserIds(user);

  if (ids === null) return {};

  return { [field]: { $in: ids } };
};

// ======================================
// Whether `targetUserId` falls within the requesting user's scope
// (used to validate assignment/reassignment)
// ======================================

export const isUserInScope = async (user, targetUserId) => {
  if (!targetUserId) return true;

  if (user.role === "admin") return true;

  const ids = await getScopedUserIds(user);

  return ids.includes(targetUserId.toString());
};
