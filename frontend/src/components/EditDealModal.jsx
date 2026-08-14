import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  updateDeal,
} from "../services/dealService";

import {
  getAllCustomers,
} from "../services/customerService";

import "../styles/AddDealModal.css";

function EditDealModal({

  open,

  onClose,

  onSuccess,

  deal,

}) {

  const [customers, setCustomers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({

      title: "",

      customer: "",

      amount: "",

      stage: "New",

      probability: 10,

      expectedCloseDate: "",

      description: "",

    });

  useEffect(() => {

    const loadCustomers = async () => {

      try {

        const res =
          await getAllCustomers();

        setCustomers(
          res.customers || []
        );

      } catch (error) {

        console.log(error);

      }

    };

    loadCustomers();

  }, []);

  useEffect(() => {

    (async () => {

      if (deal) {

        setFormData({

          title: deal.title || "",

          customer:
            deal.customer?._id || "",

          amount:
            deal.amount || "",

          stage:
            deal.stage || "New",

          probability:
            deal.probability || 10,

          expectedCloseDate:
            deal.expectedCloseDate
              ? deal.expectedCloseDate.slice(0, 10)
              : "",

          description:
            deal.description || "",

        });

      }

    })();

  }, [deal]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    });

  };

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      await updateDeal(
        deal._id,
        formData
      );

      setLoading(false);

      onSuccess();

      onClose();

    } catch (error) {

      console.log(error);

      setLoading(false);

      toast.error("Failed to Update Deal");

    }

  };

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="modal">

        <div className="modal-header">

          <h2>

            Edit Deal

          </h2>

          <button

            className="close-btn"

            onClick={onClose}

          >

            ✕

          </button>

        </div>

        <form
          onSubmit={handleSubmit}
        >
                      <div className="form-grid">

            <div className="form-group">

              <label>Deal Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>Customer</label>

              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Customer
                </option>

                {customers.map((customer) => (

                  <option
                    key={customer._id}
                    value={customer._id}
                  >

                    {customer.customerName}

                  </option>

                ))}

              </select>

            </div>

            <div className="form-group">

              <label>Amount</label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>Stage</label>

              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
              >

                <option>New</option>

                <option>Qualified</option>

                <option>Proposal</option>

                <option>Negotiation</option>

                <option>Won</option>

                <option>Lost</option>

              </select>

            </div>

            <div className="form-group">

              <label>Probability %</label>

              <input
                type="number"
                name="probability"
                min="0"
                max="100"
                value={formData.probability}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>Expected Close Date</label>

              <input
                type="date"
                name="expectedCloseDate"
                value={formData.expectedCloseDate}
                onChange={handleChange}
              />

            </div>

          </div>
                    <div className="form-group full-width">

            <label>Description</label>

            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          <div className="modal-footer">

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

              {

                loading

                  ? "Updating..."

                  : "Update Deal"

              }

            </button>

          </div>

        </form>

      </div>
          </div>

  );

}

export default EditDealModal;