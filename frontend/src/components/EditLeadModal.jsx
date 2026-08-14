import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateLead } from "../services/leadService";
import "../styles/EditLeadModal.css";

function EditLeadModal({
  lead,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    company: "",
    status: "",
    priority: "",
    leadValue: 0,
    region: "Not Specified",
  });

  useEffect(() => {
    (async () => {
      if (lead) {
        setFormData({
          customerName: lead.customerName || "",
          email: lead.email || "",
          phone: lead.phone || "",
          company: lead.company || "",
          status: lead.status || "New",
          priority: lead.priority || "Medium",
          leadValue: lead.leadValue || 0,
          region: lead.region || "Not Specified",
        });
      }
    })();
  }, [lead]);

  if (!lead) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await updateLead(
        lead._id,
        formData
      );

      toast.success("Lead Updated Successfully");

      onSuccess();

      onClose();

    } catch (err) {
      console.log(err);
      toast.error("Update Failed");
    }
  };

  return (
    <div className="edit-overlay">

      <div className="edit-modal">

        <h2>Edit Lead</h2>

        <input
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <input
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option>New</option>
          <option>Contacted</option>
          <option>Interested</option>
          <option>Follow Up</option>
          <option>Qualified</option>
          <option>Closed Won</option>
          <option>Closed Lost</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
        >
          <option>Not Specified</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
          <option>Central</option>
        </select>

        <input
          type="number"
          name="leadValue"
          value={formData.leadValue}
          onChange={handleChange}
        />

        <div className="edit-buttons">

          <button
            className="save-btn"
            onClick={handleSubmit}
          >
            Save
          </button>

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditLeadModal;