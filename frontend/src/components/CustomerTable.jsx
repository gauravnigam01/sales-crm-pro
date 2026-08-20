import { useState } from "react";
import { toast } from "react-toastify";

import {
  deleteCustomer,
} from "../services/customerService";

import ViewCustomerModal from "./ViewCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import ConfirmDialog from "./ConfirmDialog";

import "../styles/CustomerTable.css";

function CustomerTable({
  customers,
  refreshCustomers,
}) {

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [editCustomer, setEditCustomer] =
    useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const canDelete =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const handleDelete = (customer) => {
    setDeleteTarget(customer);
  };

  const confirmDelete = async () => {

    try {

      await deleteCustomer(deleteTarget._id);

      toast.success("Customer Deleted Successfully");

      refreshCustomers();

    } catch (error) {

      console.log(error);

      toast.error(error.response?.data?.message || "Delete Failed");

    }

    setDeleteTarget(null);

  };

  return (

    <div className="customer-table-container">

      <table className="customer-table">

        <thead>

          <tr>

            <th>Customer</th>

            <th>Company</th>

            <th>Phone</th>

            <th>Status</th>

            <th>Type</th>

            <th>Revenue</th>

            <th>Created</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {customers.length === 0 ? (

            <tr>

              <td
                colSpan="8"
                className="no-data"
              >
                No Customers Found
              </td>

            </tr>

          ) : (

            customers.map((customer) => (
                              <tr key={customer._id}>

                <td>

                  <div className="customer-info">

                    <div className="avatar">
                      {customer.customerName
  ?.trim()
  .charAt(0)
  .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {customer.customerName}
                      </strong>

                      <p>
                        {customer.email || "-"}
                      </p>

                    </div>

                  </div>

                </td>

                <td>
                  {customer.company || "-"}
                </td>

                <td>
                  {customer.phone}
                </td>

                <td>

                  <span
                    className={`status ${customer.status
                      ?.toLowerCase()
                      .replace(/\s/g, "")}`}
                  >
                    {customer.status}
                  </span>

                </td>

                <td>

                  <span
                  className={`customer-type ${(customer.customerType || "Regular").toLowerCase()}`}
                  >
                   {customer.customerType || "Regular"}
                  </span>

                </td>

                <td>

                  ₹{(customer.revenue || 0).toLocaleString("en-IN")}

                </td>

                <td>

                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString("en-IN")}

                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedCustomer(customer)
                      }
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        setEditCustomer(customer)
                      }
                    >
                      Edit
                    </button>

                    {canDelete && (

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(customer)
                        }
                      >
                        Delete
                      </button>

                    )}

                  </div>

                </td>

              </tr>
                          ))

          )}

        </tbody>

      </table>

      {/* View Customer */}

      <ViewCustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Edit Customer */}

      <EditCustomerModal
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onSuccess={refreshCustomers}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.customerName}"?`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

    </div>

  );

}

export default CustomerTable;