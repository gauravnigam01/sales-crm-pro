import createNotification from "../utils/createNotification.js";
import Customer from "../models/Customer.js";
import { buildScopeFilter, isUserInScope } from "../utils/teamScope.js";

// admin: always. caller: only their own assigned customers.
// manager: only customers assigned within their team (or themselves).
const canAccessCustomer = async (user, customer) => {
  if (user.role === "admin") return true;

  const assignedToId = customer.assignedTo?._id || customer.assignedTo;

  if (user.role === "caller") {
    return assignedToId?.toString() === user._id.toString();
  }

  return isUserInScope(user, assignedToId);
};

// ======================================
// Create Customer
// ======================================
// ======================================
// Create Customer
// ======================================

export const createCustomer = async (req, res) => {
  try {

    let assignedTo = req.body.assignedTo || req.user?._id || null;

    if (req.user?.role === "caller") {
      assignedTo = req.user._id;
    } else if (req.user?.role === "manager" && req.body.assignedTo) {
      const allowed = await isUserInScope(req.user, req.body.assignedTo);

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "You can only assign customers to members of your team",
        });
      }
    }

    const customer = await Customer.create({

      ...req.body,

      assignedTo,

      createdBy: req.user?._id || null,

      assignedBy: req.user?._id || null,

      timeline: [
        {
          action: "Customer Created",
          performedBy: req.user?._id || null,
        },
      ],

    });

    // ==============================
    // Create Notification
    // ==============================

    await createNotification(
      "New Customer Added",
      `${customer.customerName} has been added successfully.`,
      "customer"
    );

    res.status(201).json({
      success: true,
      message: "Customer Created Successfully",
      customer,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// ======================================
// Get All Customers
// ======================================

export const getAllCustomers = async (req, res) => {

  try {

    const filter = await buildScopeFilter(req.user, "assignedTo");

    const customers = await Customer.find(filter)

      .populate("assignedTo", "fullName")

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ======================================
// Get Single Customer
// ======================================

export const getCustomerById = async (req, res) => {

  try {

    const { id } = req.params;

    const customer = await Customer.findById(id)
      .populate("assignedTo", "fullName email")
      .populate("timeline.performedBy", "fullName")
      .populate("notes.addedBy", "fullName");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!(await canAccessCustomer(req.user, customer))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Update Customer
// ======================================
// ======================================
// Update Customer
// ======================================

export const updateCustomer = async (req, res) => {

  try {

    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!(await canAccessCustomer(req.user, customer))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    if (req.body.assignedTo) {
      if (req.user.role === "caller") {
        delete req.body.assignedTo;
      } else if (req.user.role === "manager") {
        const allowed = await isUserInScope(req.user, req.body.assignedTo);

        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: "You can only assign customers to members of your team",
          });
        }

        customer.assignedTo = req.body.assignedTo;
      } else {
        customer.assignedTo = req.body.assignedTo;
      }
    }

    customer.customerName =
      req.body.customerName || customer.customerName;

    customer.email =
      req.body.email || customer.email;

    customer.phone =
      req.body.phone || customer.phone;

    customer.company =
      req.body.company || customer.company;

    customer.address =
      req.body.address || customer.address;

    customer.city =
      req.body.city || customer.city;

    customer.state =
      req.body.state || customer.state;

    customer.country =
      req.body.country || customer.country;

    customer.customerType =
      req.body.customerType || customer.customerType;

    customer.status =
      req.body.status || customer.status;

    customer.revenue =
      req.body.revenue || customer.revenue;

    customer.timeline.push({
      action: "Customer Updated",
      performedBy: req.user?._id || null,
    });

    await customer.save();

    // ==============================
    // Create Notification
    // ==============================

    await createNotification(
      "Customer Updated",
      `${customer.customerName} has been updated successfully.`,
      "customer"
    );

    res.status(200).json({
      success: true,
      message: "Customer Updated Successfully",
      customer,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// ======================================
// Delete Customer
// ======================================
// ======================================
// Delete Customer
// ======================================

export const deleteCustomer = async (req, res) => {

  try {

    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!(await canAccessCustomer(req.user, customer))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    await Customer.findByIdAndDelete(id);

    // ==============================
    // Create Notification
    // ==============================

    await createNotification(
      "Customer Deleted",
      `${customer.customerName} has been deleted successfully.`,
      "customer"
    );

    res.status(200).json({
      success: true,
      message: "Customer Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Add Customer Note
// ======================================

export const addCustomerNote = async (req, res) => {

  try {

    const { id } = req.params;
    const { text } = req.body;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!(await canAccessCustomer(req.user, customer))) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    customer.notes.push({
      text,
      addedBy: req.user?._id || null,
    });

    customer.timeline.push({
      action: "Customer Note Added",
      performedBy: req.user?._id || null,
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer Note Added Successfully",
      customer,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};