import "../styles/DeleteModal.css";

function DeleteDealModal({

  open,

  onClose,

  onConfirm,

  deal,

}) {

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="delete-modal">

        <div className="delete-header">

          <h2>

            Delete Deal

          </h2>

        </div>

        <div className="delete-body">

          <p>

            Are you sure you want to delete

          </p>

          <h3>

            {deal?.title || "this deal"} ?

          </h3>

          <p>

            This action cannot be undone.

          </p>

        </div>

        <div className="delete-footer">

          <button

            className="cancel-btn"

            onClick={onClose}

          >

            Cancel

          </button>

          <button

            className="delete-btn"

            onClick={onConfirm}

          >

            Delete

          </button>

        </div>

      </div>

    </div>

  );

}

export default DeleteDealModal;