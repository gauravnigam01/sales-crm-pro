import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createPayment } from "../services/paymentService";
import { getAllEnrollments } from "../services/enrollmentService";

const emptyForm = {
  enrollment: "",
  amount: "",
  paymentDate: new Date().toISOString().substring(0, 10),
  paymentMethod: "Cash",
  transactionId: "",
  status: "Success",
};

function AddPaymentModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState(emptyForm);
  const [enrollments, setEnrollments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!open) return;

      setFormData(emptyForm);

      try {
        const res = await getAllEnrollments();
        setEnrollments(res.enrollments || []);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.enrollment) {
      toast.error("Please select a student enrollment");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      await createPayment({
        ...formData,
        amount: Number(formData.amount),
      });

      toast.success("Payment Recorded Successfully");
      onSuccess();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Record Payment");
    }

    setSaving(false);
  };

  const selectedEnrollment = enrollments.find(
    (e) => e._id === formData.enrollment
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Payment</h2>

        <form onSubmit={handleSubmit}>
          <select
            name="enrollment"
            value={formData.enrollment}
            onChange={handleChange}
            required
          >
            <option value="">Select Student / Enrollment</option>
            {enrollments.map((e) => (
              <option key={e._id} value={e._id}>
                {e.studentName} — {e.course?.courseName}
              </option>
            ))}
          </select>

          {selectedEnrollment && (
            <input
              type="text"
              value={`Pending: ₹${(selectedEnrollment.pendingAmount || 0).toLocaleString("en-IN")}`}
              disabled
            />
          )}

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            required
          />

          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
          />

          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Bank Transfer</option>
            <option>Other</option>
          </select>

          <input
            type="text"
            name="transactionId"
            placeholder="Transaction ID (optional)"
            value={formData.transactionId}
            onChange={handleChange}
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Success</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaymentModal;
