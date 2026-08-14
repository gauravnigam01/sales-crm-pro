import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createLead } from "../services/leadService";
import { getAllUsers } from "../services/userService";
import "../styles/AddLeadModal.css";

function AddLeadModal({
  open,
  onClose,
  onSuccess,
}) {

  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    company: "",
    leadValue: "",
    priority: "Medium",
    temperature: "Warm",
    source: "Manual",
    status: "New",
    region: "Not Specified",
    followUpDate: "",
    tags: "",
    assignedTo: "",
    initialNote: "",
  });

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await getAllUsers();

          setUsers(res.users || []);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",")
          : [],
      };

      if (!payload.assignedTo) {
        delete payload.assignedTo;
      }

      try {
        await createLead(payload);
      } catch (error) {
        if (error.response?.status === 409 && error.response?.data?.duplicate) {
          const existing = error.response.data.existingLead;

          const confirmCreate = window.confirm(
            `A lead with this phone already exists:\n\n` +
              `${existing.customerName} — ${existing.status}\n` +
              `Assigned to: ${existing.assignedTo}\n` +
              `Created: ${new Date(existing.createdAt).toLocaleDateString("en-IN")}\n\n` +
              `Create a new lead anyway?`
          );

          if (!confirmCreate) {
            setLoading(false);
            return;
          }

          await createLead({ ...payload, force: true });
        } else {
          throw error;
        }
      }

      toast.success("Lead Created Successfully");

      setFormData({
        customerName: "",
        email: "",
        phone: "",
        company: "",
        leadValue: "",
        priority: "Medium",
        temperature: "Warm",
        source: "Manual",
        status: "New",
        region: "Not Specified",
        followUpDate: "",
        tags: "",
        assignedTo: "",
        initialNote: "",
      });

      onSuccess();
      onClose();

    } catch (error) {

      console.log(error);
      toast.error("Failed to create lead");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>➕ Add New Lead</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="customerName"
            placeholder="👤 Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="📱 Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="company"
            placeholder="🏢 Company Name"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            type="number"
            name="leadValue"
            placeholder="💰 Lead Value"
            value={formData.leadValue}
            onChange={handleChange}
          />
                    <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟡 Medium</option>
            <option value="High">🔴 High</option>
          </select>

          <select
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
          >
            <option value="Cold">🧊 Cold</option>
            <option value="Warm">🌤️ Warm</option>
            <option value="Hot">🔥 Hot</option>
          </select>

          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
          >
            <option value="Manual">✍️ Manual</option>
            <option value="Meta Ads">📘 Meta Ads</option>
            <option value="Google Ads">🔍 Google Ads</option>
            <option value="Website">🌐 Website</option>
            <option value="WhatsApp">💬 WhatsApp</option>
            <option value="Referral">🤝 Referral</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
          </select>

          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
          >
            <option value="Not Specified">🌍 Region (Not Specified)</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="Central">Central</option>
          </select>

          <label className="field-label">
            👤 Assign To (leave empty = Auto Round-Robin)
          </label>

          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
          >
            <option value="">🤖 Auto-Assign (Round Robin)</option>

            {users
              .filter((u) => u.role !== "admin")
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {u.fullName}
                </option>
              ))}
          </select>

          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
          />

          <input
            type="text"
            name="tags"
            placeholder="🏷️ Tags (VIP, Hot, Premium)"
            value={formData.tags}
            onChange={handleChange}
          />

          <textarea
            name="initialNote"
            placeholder="📝 Notes (NRI? Special requirement?)"
            value={formData.initialNote}
            onChange={handleChange}
            rows={2}
          />

          <div className="modal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "🚀 Save Lead"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default AddLeadModal;
