import { useState } from "react";
import { toast } from "react-toastify";

import { createCaller } from "../services/userService";

import "../styles/AddUserModal.css";

function AddUserModal({

  open,

  onClose,

  onSuccess,

}) {

  const [formData, setFormData] = useState({

    fullName: "",

    email: "",

    phone: "",

    password: "",

  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createCaller(formData);

      toast.success("User Created Successfully");

      setFormData({

        fullName: "",

        email: "",

        phone: "",

        password: "",

      });

      onSuccess();

      onClose();

    } catch (error) {

      console.log(error);

      toast.error("Failed to Create User");

    }

  };

  if (!open) return null;
    return (

    <div className="modal-overlay">

      <div className="modal-box">

        <div className="modal-header">

          <h2>Add New User</h2>

          <button onClick={onClose}>

            ✕

          </button>

        </div>

        <form

          onSubmit={handleSubmit}

          className="modal-form"

        >

          <input

            type="text"

            name="fullName"

            placeholder="Full Name"

            value={formData.fullName}

            onChange={handleChange}

            required

          />

          <input

            type="email"

            name="email"

            placeholder="Email"

            value={formData.email}

            onChange={handleChange}

            required

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

            type="password"

            name="password"

            placeholder="Password"

            value={formData.password}

            onChange={handleChange}

            required

          />

          <div className="modal-actions">

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

              Create User

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddUserModal;