import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateCustomer } from "../services/customerService";
import "../styles/EditCustomerModal.css";

function EditCustomerModal({
  customer,
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

  useEffect(() => {

    (async () => {

      if (customer) {

        setFormData({

          customerName: customer.customerName || "",

          email: customer.email || "",

          phone: customer.phone || "",

          company: customer.company || "",

          customerType: customer.customerType || "Regular",

          status: customer.status || "Active",

          revenue: customer.revenue || "",

          address: customer.address || "",

          city: customer.city || "",

          state: customer.state || "",

          country: customer.country || "",

        });

      }

    })();

  }, [customer]);

  if (!customer) return null;

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateCustomer(
        customer._id,
        formData
      );

      toast.success("Customer Updated Successfully");

      onSuccess();

      onClose();

    } catch (error) {

      console.log(error);

      toast.error("Update Failed");

    }

  };

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>Edit Customer</h2>

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
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
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
              Update Customer
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default EditCustomerModal;