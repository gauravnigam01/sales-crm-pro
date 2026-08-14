import Event from "../models/Event.js";
import { getScopedUserIds, isUserInScope } from "../utils/teamScope.js";

// Callers see events assigned to or created by themselves; managers see
// events for anyone on their team (or themselves); admin sees everything.
const buildEventScopeFilter = async (user) => {
  if (user.role === "admin") return {};

  if (user.role === "caller") {
    return { $or: [{ assignedTo: user._id }, { createdBy: user._id }] };
  }

  const ids = await getScopedUserIds(user);

  return { $or: [{ assignedTo: { $in: ids } }, { createdBy: { $in: ids } }] };
};

const canAccessEvent = async (user, event) => {
  if (user.role === "admin") return true;

  const assignedToId = event.assignedTo?._id || event.assignedTo;
  const createdById = event.createdBy?._id || event.createdBy;

  if (user.role === "caller") {
    return (
      assignedToId?.toString() === user._id.toString() ||
      createdById?.toString() === user._id.toString()
    );
  }

  return (
    (await isUserInScope(user, assignedToId)) ||
    (await isUserInScope(user, createdById))
  );
};

// ======================================
// Create Event
// ======================================

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event Created Successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Events (optional ?month=&year= filter)
// ======================================

export const getAllEvents = async (req, res) => {
  try {
    const { month, year } = req.query;

    const filter = await buildEventScopeFilter(req.user);

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    const events = await Event.find(filter)
      .populate("relatedLead", "customerName")
      .populate("relatedCustomer", "customerName")
      .populate("relatedDeal", "title")
      .populate("assignedTo", "fullName")
      .populate("createdBy", "fullName")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Upcoming Events (next 5, from today)
// ======================================

export const getUpcomingEvents = async (req, res) => {
  try {
    const scopeFilter = await buildEventScopeFilter(req.user);

    const events = await Event.find({
      ...scopeFilter,
      date: { $gte: new Date() },
      status: "Scheduled",
    })
      .populate("relatedLead", "customerName")
      .populate("relatedCustomer", "customerName")
      .populate("assignedTo", "fullName")
      .sort({ date: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Event
// ======================================

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("relatedLead", "customerName")
      .populate("relatedCustomer", "customerName")
      .populate("relatedDeal", "title")
      .populate("assignedTo", "fullName")
      .populate("createdBy", "fullName");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event Not Found",
      });
    }

    if (!(await canAccessEvent(req.user, event))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Event
// ======================================

export const updateEvent = async (req, res) => {
  try {
    const existing = await Event.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Event Not Found",
      });
    }

    if (!(await canAccessEvent(req.user, existing))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Event Updated Successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Event
// ======================================

export const deleteEvent = async (req, res) => {
  try {
    const existing = await Event.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Event Not Found",
      });
    }

    if (!(await canAccessEvent(req.user, existing))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
