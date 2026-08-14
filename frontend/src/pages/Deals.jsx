import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getAllDeals,
  deleteDeal,
} from "../services/dealService";

import AddDealModal from "../components/AddDealModal";
import EditDealModal from "../components/EditDealModal";
import DeleteDealModal from "../components/DeleteDealModal";

import "../styles/Deals.css";

function Deals() {

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const canManage =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const [deals, setDeals] = useState([]);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const dealsPerPage = 8;

  const [openAddModal, setOpenAddModal] =
    useState(false);

  const [openEditModal, setOpenEditModal] =
    useState(false);

  const [openDeleteModal, setOpenDeleteModal] =
    useState(false);

  const [selectedDeal, setSelectedDeal] =
    useState(null);

  // ==========================
  // Load Deals
  // ==========================

  const loadDeals = async () => {

    try {

      const res = await getAllDeals();

      setDeals(res.deals || []);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    (async () => {

      await loadDeals();

    })();

  }, []);

  // ==========================
  // Delete Deal
  // ==========================

  const handleDelete = async () => {

    try {

      await deleteDeal(selectedDeal._id);

      setOpenDeleteModal(false);

      loadDeals();

    } catch (error) {

      console.log(error);

      toast.error(error.response?.data?.message || "Failed to Delete Deal");

    }

  };

  // ==========================
  // Search
  // ==========================

  const filteredDeals =
    deals.filter((deal) => {

      const keyword =
        search.toLowerCase();

      return (

        deal.title
          ?.toLowerCase()
          .includes(keyword)

        ||

        deal.customer?.customerName
          ?.toLowerCase()
          .includes(keyword)

        ||

        deal.stage
          ?.toLowerCase()
          .includes(keyword)

      );

    });

  // ==========================
  // Pagination
  // ==========================

  const indexOfLastDeal =
    currentPage *
    dealsPerPage;

  const indexOfFirstDeal =
    indexOfLastDeal -
    dealsPerPage;

  const currentDeals =
    filteredDeals.slice(

      indexOfFirstDeal,

      indexOfLastDeal

    );

  const totalPages =
    Math.ceil(

      filteredDeals.length /

      dealsPerPage

    );

  return (

    <div className="deals-page">
              {/* ==========================
          Header
      ========================== */}

      <div className="page-header">

        <div>

          <h1>Deals Management</h1>

          <p>

            Manage Sales Deals & Revenue

          </p>

        </div>

        {canManage && (

          <button
            className="add-btn"
            onClick={() =>
              setOpenAddModal(true)
            }
          >
            + Add Deal
          </button>

        )}

      </div>

      {/* ==========================
          Stats
      ========================== */}

      <div className="deal-stats">

        <div className="stat-card">

          <h2>

            {deals.length}

          </h2>

          <p>Total Deals</p>

        </div>

        <div className="stat-card">

          <h2>

            {

              deals.filter(

                (deal) =>

                  deal.stage === "Won"

              ).length

            }

          </h2>

          <p>Won Deals</p>

        </div>

        <div className="stat-card">

          <h2>

            {

              deals.filter(

                (deal) =>

                  deal.stage === "Lost"

              ).length

            }

          </h2>

          <p>Lost Deals</p>

        </div>

        <div className="stat-card">

          <h2>

            ₹

            {

              deals

                .reduce(

                  (

                    total,

                    item

                  ) =>

                    total +

                    (item.amount || 0),

                  0

                )

                .toLocaleString(

                  "en-IN"

                )

            }

          </h2>

          <p>Total Revenue</p>

        </div>

      </div>

      {/* ==========================
          Search
      ========================== */}

      <div className="search-bar">

        <input

          type="text"

          placeholder="Search Deals..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />

      </div>

      {/* ==========================
          Table
      ========================== */}

      <table className="deals-table">

        <thead>

          <tr>

            <th>Title</th>

            <th>Customer</th>

            <th>Amount</th>

            <th>Stage</th>

            <th>Probability</th>

            <th>Action</th>

          </tr>

        </thead>

        <tbody>
                      {currentDeals.length === 0 ? (

            <tr>

              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "30px",
                }}
              >

                No Deals Found

              </td>

            </tr>

          ) : (

            currentDeals.map((deal) => (

              <tr key={deal._id}>

                <td>

                  <strong>

                    {deal.title || "-"}

                  </strong>

                </td>

                <td>

                  {deal.customer?.customerName || "N/A"}

                </td>

                <td>

                  ₹{(deal.amount || 0).toLocaleString("en-IN")}

                </td>

                <td>

                  <span
                    className={`stage ${
                      deal.stage
                        ? deal.stage
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        : ""
                    }`}
                  >

                    {deal.stage || "-"}

                  </span>

                </td>

                <td>

                  {deal.probability || 0}%

                </td>

                <td>

                  {canManage ? (

                    <>

                      <button
                        className="edit-btn"
                        onClick={() => {

                          setSelectedDeal(deal);

                          setOpenEditModal(true);

                        }}
                      >

                        Edit

                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => {

                          setSelectedDeal(deal);

                          setOpenDeleteModal(true);

                        }}
                      >

                        Delete

                      </button>

                    </>

                  ) : (

                    <span style={{ color: "#94a3b8" }}>View Only</span>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {/* ==========================
          Pagination
      ========================== */}

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
        >

          Previous

        </button>

        <span>

          Page {currentPage} of {totalPages || 1}

        </span>

        <button
          disabled={
            currentPage === totalPages ||
            totalPages === 0
          }
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
        >

          Next

        </button>

      </div>
            {/* ==========================
          Add Deal Modal
      ========================== */}

      <AddDealModal
        open={openAddModal}
        onClose={() =>
          setOpenAddModal(false)
        }
        onSuccess={loadDeals}
      />

      {/* ==========================
          Edit Deal Modal
      ========================== */}

      <EditDealModal
        open={openEditModal}
        deal={selectedDeal}
        onClose={() =>
          setOpenEditModal(false)
        }
        onSuccess={loadDeals}
      />

      {/* ==========================
          Delete Deal Modal
      ========================== */}

      <DeleteDealModal
        open={openDeleteModal}
        deal={selectedDeal}
        onClose={() =>
          setOpenDeleteModal(false)
        }
        onConfirm={handleDelete}
      />

    </div>

  );

}

export default Deals;