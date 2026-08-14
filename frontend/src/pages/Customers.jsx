import { useEffect, useState } from "react";
import {
  MdSearch,
  MdFilterList,
  MdPeopleAlt,
  MdCheckCircle,
  MdCancel,
  MdAttachMoney,
} from "react-icons/md";

import {
  getAllCustomers,
} from "../services/customerService";

import CustomerTable from "../components/CustomerTable";

import AddCustomerModal from "../components/AddCustomerModal";

import "../styles/Customers.css";

function Customers() {

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [openModal, setOpenModal] = useState(false);

  // ===========================
  // Load Customers
  // ===========================

  const loadCustomers = async () => {

    try {

      const res = await getAllCustomers();

      setCustomers(res.customers);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    (async () => {

      await loadCustomers();

    })();

  }, []);
    // ===========================
  // Search + Filter
  // ===========================

  const filteredCustomers = customers.filter((customer) => {

    const keyword = search.toLowerCase();

    const matchesSearch =
      customer.customerName?.toLowerCase().includes(keyword) ||
      customer.phone?.includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword) ||
      customer.company?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" ||
      customer.status === statusFilter;

    return matchesSearch && matchesStatus;

  });

  const totalRevenue = customers.reduce(
    (total, customer) => total + (customer.revenue || 0),
    0
  );

  return (
    <div className="customers-page">

      <div className="customers-header">

        <div>

          <h1>{statusFilter === "All" ? "Customers" : `${statusFilter} Customers`}</h1>

          <p>
            Manage all your customers from one place.
          </p>

        </div>

        <button
          className="add-btn"
          onClick={() => setOpenModal(true)}
        >
          + Add Customer
        </button>

      </div>

      {/* Toolbar: Search + Filter */}

      <div className="customers-toolbar">
        <div className="customers-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <MdFilterList />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}

      <div className="customer-stats">

        <div
          className={`customer-stat-card total ${statusFilter === "All" ? "active" : ""}`}
          onClick={() => setStatusFilter("All")}
        >
          <div className="customer-stat-icon"><MdPeopleAlt /></div>
          <div>
            <h2>{customers.length}</h2>
            <span>Total Customers</span>
          </div>
        </div>

        <div
          className={`customer-stat-card active-status ${statusFilter === "Active" ? "active" : ""}`}
          onClick={() => setStatusFilter("Active")}
        >
          <div className="customer-stat-icon"><MdCheckCircle /></div>
          <div>
            <h2>{customers.filter((c) => c.status === "Active").length}</h2>
            <span>Active</span>
          </div>
        </div>

        <div
          className={`customer-stat-card inactive ${statusFilter === "Inactive" ? "active" : ""}`}
          onClick={() => setStatusFilter("Inactive")}
        >
          <div className="customer-stat-icon"><MdCancel /></div>
          <div>
            <h2>{customers.filter((c) => c.status === "Inactive").length}</h2>
            <span>Inactive</span>
          </div>
        </div>

        <div className="customer-stat-card revenue">
          <div className="customer-stat-icon"><MdAttachMoney /></div>
          <div>
            <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
            <span>Total Revenue</span>
          </div>
        </div>

      </div>
            {/* Customer Table */}

      <CustomerTable
        customers={filteredCustomers}
        refreshCustomers={loadCustomers}
      />

      {/* Add Customer Modal */}

      <AddCustomerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {

          loadCustomers();

          setOpenModal(false);

        }}
      />

    </div>
  );

}

export default Customers;
