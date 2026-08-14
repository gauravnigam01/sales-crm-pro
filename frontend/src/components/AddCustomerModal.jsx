import { useState } from "react";
import { toast } from "react-toastify";
import { createCustomer } from "../services/customerService";
import "../styles/AddCustomerModal.css";

function AddCustomerModal({
  open,
  onClose,
  onSuccess,
}) {

  const [formData, setFormData] = useState({

    customerName: "",

    email: "",

    phone: "",

    company: "",

    customerType: "Regular",

    status: "Active",

    revenue: "",

    address: "",

    city: "",

    state: "",

    country: "",

  });

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

      await createCustomer(formData);

      toast.success("Customer Created Successfully");

      setFormData({

        customerName: "",

        email: "",

        phone: "",

        company: "",

        customerType: "Regular",

        status: "Active",

        revenue: "",

        address: "",

        city: "",

        state: "",

        country: "",

      });

      onSuccess();

    } catch (error) {

      console.log(error);

      toast.error("Failed to create customer");

    }

  };

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>Add New Customer</h2>

        <form onSubmit={handleSubmit}>
                      <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            type="number"
            name="revenue"
            placeholder="Revenue"
            value={formData.revenue}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
          />

          <select
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
          >
            <option>Regular</option>
            <option>Premium</option>
            <option>VIP</option>
          </select>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
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
            >
              Save Customer
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddCustomerModal;