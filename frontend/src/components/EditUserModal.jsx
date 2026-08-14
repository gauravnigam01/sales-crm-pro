import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { updateUser } from "../services/userService";

import "../styles/AddUserModal.css";

function EditUserModal({

  open,

  onClose,

  user,

  managers,

  onSuccess,

}) {

  const [formData, setFormData] = useState({

    fullName: "",

    email: "",

    phone: "",

    role: "",

    status: "",

    manager: "",

  });

  useEffect(() => {

    (async () => {

      if (user) {

        setFormData({

          fullName: user.fullName || "",

          email: user.email || "",

          phone: user.phone || "",

          role: user.role || "caller",

          status: user.status || "active",

          manager: user.manager || "",

        });

      }

    })();

  }, [user]);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

  };

  if (!open) return null;
  const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    await updateUser(

      user._id,

      {

        ...formData,

        manager: formData.role === "caller" ? (formData.manager || null) : null,

      }

    );

    toast.success("User Updated Successfully");

    onSuccess();

    onClose();

  } catch (error) {

    console.log(error);

    toast.error("Failed to Update User");

  }

};

return (

<div className="modal-overlay">

<div className="modal-box">

<div className="modal-header">

<h2>Edit User</h2>

<button onClick={onClose}>

✕

</button>

</div>

<form

className="modal-form"

onSubmit={handleSubmit}

>

<input

type="text"

name="fullName"

placeholder="Full Name"

value={formData.fullName}

onChange={handleChange}

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

/>

<select

name="role"

value={formData.role}

onChange={handleChange}

>

<option value="admin">Admin</option>

<option value="manager">Manager</option>

<option value="caller">Caller</option>

</select>

{formData.role === "caller" && (

<select

name="manager"

value={formData.manager}

onChange={handleChange}

>

<option value="">— No Manager (Reports to Admin) —</option>

{(managers || []).map((m) => (

<option key={m._id} value={m._id}>

Reports to: {m.fullName}

</option>

))}

</select>

)}

<select

name="status"

value={formData.status}

onChange={handleChange}

>

<option value="active">Active</option>

<option value="inactive">Inactive</option>

</select>
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

Update User

</button>

</div>

</form>

</div>

</div>

);

}

export default EditUserModal;