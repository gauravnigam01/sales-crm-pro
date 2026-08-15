import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";

const populatePayment = (query) =>
  query.populate({
    path: "enrollment",
    select: "studentName course totalFee paidAmount",
    populate: { path: "course", select: "courseName" },
  });

// ======================================
// Create Payment (also updates the enrollment's paidAmount)
// ======================================

export const createPayment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.body.enrollment);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment Not Found",
      });
    }

    const amount = Number(req.body.amount) || 0;
    const status = req.body.status || "Success";

    const payment = await Payment.create({
      ...req.body,
      amount,
      status,
      createdBy: req.user?._id || null,
    });

    if (status === "Success") {
      enrollment.paidAmount = Math.min(
        (enrollment.paidAmount || 0) + amount,
        enrollment.totalFee
      );
      await enrollment.save();
    }

    const populated = await populatePayment(Payment.findById(payment._id));

    res.status(201).json({
      success: true,
      message: "Payment Recorded Successfully",
      payment: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get All Payments
// ======================================

export const getAllPayments = async (req, res) => {
  try {
    const payments = await populatePayment(Payment.find()).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Payment
// ======================================

export const getPaymentById = async (req, res) => {
  try {
    const payment = await populatePayment(Payment.findById(req.params.id));

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Payment (reconciles the enrollment's paidAmount for the delta)
// ======================================

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    const oldContribution = payment.status === "Success" ? payment.amount : 0;

    if (req.body.amount !== undefined) payment.amount = Number(req.body.amount);
    if (req.body.paymentDate !== undefined) payment.paymentDate = req.body.paymentDate;
    if (req.body.paymentMethod !== undefined) payment.paymentMethod = req.body.paymentMethod;
    if (req.body.transactionId !== undefined) payment.transactionId = req.body.transactionId;
    if (req.body.status !== undefined) payment.status = req.body.status;

    await payment.save();

    const newContribution = payment.status === "Success" ? payment.amount : 0;
    const diff = newContribution - oldContribution;

    if (diff !== 0) {
      const enrollment = await Enrollment.findById(payment.enrollment);

      if (enrollment) {
        enrollment.paidAmount = Math.min(
          Math.max((enrollment.paidAmount || 0) + diff, 0),
          enrollment.totalFee
        );
        await enrollment.save();
      }
    }

    const populated = await populatePayment(Payment.findById(payment._id));

    res.status(200).json({
      success: true,
      message: "Payment Updated Successfully",
      payment: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Payment (reverses its contribution to the enrollment's paidAmount)
// ======================================

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment Not Found",
      });
    }

    if (payment.status === "Success") {
      const enrollment = await Enrollment.findById(payment.enrollment);

      if (enrollment) {
        enrollment.paidAmount = Math.max(
          (enrollment.paidAmount || 0) - payment.amount,
          0
        );
        await enrollment.save();
      }
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payment Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
