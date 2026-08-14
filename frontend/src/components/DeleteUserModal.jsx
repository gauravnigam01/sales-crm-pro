import "../styles/DeleteUserModal.css";

function DeleteUserModal({

  open,

  onClose,

  onDelete,

  user,

}) {

  if (!open) return null;

  return (

    <div className="modal-overlay">

      <div className="delete-modal">

        <h2>

          Delete User

        </h2>

        <p>

          Are you sure you want to delete

          <strong>

            {" "}
            {user?.fullName}

          </strong>

          ?

        </p>

        <p className="warning">

          This action cannot be undone.

        </p>
                <div className="delete-actions">

          <button

            className="cancel-btn"

            onClick={onClose}

          >

            Cancel

          </button>

          <button

            className="delete-btn"

            onClick={onDelete}

          >

            Delete

          </button>

        </div>

      </div>

    </div>

  );

}

export default DeleteUserModal;