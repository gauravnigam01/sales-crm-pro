import { useState } from "react";
import { toast } from "react-toastify";

import { deletePayment, updatePayment } from "../services/paymentService";
import ConfirmDialog from "./ConfirmDialog";

function PaymentTable({ payments, refreshPayments }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);

  const confirmDelete = async () => {
    try {
      await deletePayment(deleteTarget._id);
      toast.success("Payment Deleted Successfully");
      refreshPayments();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Delete Failed");
    }

    setDeleteTarget(null);
  };

  const confirmRefund = async () => {
    try {
      await updatePayment(refundTarget._id, { status: "Refunded" });
      toast.success("Payment Marked as Refunded");
      refreshPayments();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Refund Failed");
    }

    setRefundTarget(null);
  };

  return (
    <div className="course-table-container">
      <table className="course-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Total Fee</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
            <th>Payment Date</th>
            <th>Payment Method</th>
            <th>Transaction ID</th>
            <th>Payment Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="10" className="no-data">
                No Payments Found
              </td>
            </tr>
          ) : (
            payments.map((payment) => {
              const enrollment = payment.enrollment;
              const pending = enrollment
                ? Math.max((enrollment.totalFee || 0) - (enrollment.paidAmount || 0), 0)
                : 0;

              return (
                <tr key={payment._id}>
                  <td>
                    <strong>{enrollment?.studentName || "-"}</strong>
                  </td>
                  <td>{enrollment?.course?.courseName || "-"}</td>
                  <td>₹{(enrollment?.totalFee || 0).toLocaleString("en-IN")}</td>
                  <td>₹{(enrollment?.paidAmount || 0).toLocaleString("en-IN")}</td>
                  <td>₹{pending.toLocaleString("en-IN")}</td>
                  <td>
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td>{payment.paymentMethod}</td>
                  <td>{payment.transactionId || "-"}</td>
                  <td>
                    <span className={`status ${payment.status?.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {payment.status === "Success" && (
                        <button
                          className="edit-btn"
                          onClick={() => setRefundTarget(payment)}
                        >
                          Refund
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteTarget(payment)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? The enrollment's paid amount will be adjusted."
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!refundTarget}
        title="Refund Payment"
        message="Mark this payment as refunded? The enrollment's paid amount will be reduced accordingly."
        onConfirm={confirmRefund}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  );
}

export default PaymentTable;
