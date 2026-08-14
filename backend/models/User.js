import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "caller"],
      default: "caller",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    manager: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

team: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

permissions: {
  // Leads
  viewLeads: { type: Boolean, default: true },
  createLead: { type: Boolean, default: true },
  editLead: { type: Boolean, default: true },
  deleteLead: { type: Boolean, default: false },

  // Customers
  viewCustomers: { type: Boolean, default: true },
  createCustomer: { type: Boolean, default: true },
  editCustomer: { type: Boolean, default: true },
  deleteCustomer: { type: Boolean, default: false },

  // Deals
  viewDeals: { type: Boolean, default: true },
  createDeal: { type: Boolean, default: true },
  editDeal: { type: Boolean, default: true },
  deleteDeal: { type: Boolean, default: false },

  // Tasks
  viewTasks: { type: Boolean, default: true },
  createTask: { type: Boolean, default: true },
  editTask: { type: Boolean, default: true },
  deleteTask: { type: Boolean, default: false },

  // Documents
  viewDocuments: { type: Boolean, default: true },
  uploadDocument: { type: Boolean, default: true },
  deleteDocument: { type: Boolean, default: false },

  // Calendar
  viewCalendar: { type: Boolean, default: true },
  manageCalendar: { type: Boolean, default: true },

  // Reports
  viewReports: { type: Boolean, default: false },

  // Users
  manageUsers: { type: Boolean, default: false },
},

    profileImage: {
      type: String,
      default: "",
    },

    assignedLeads: {
      type: Number,
      default: 0,
    },

    totalCalls: {
      type: Number,
      default: 0,
    },

    totalSales: {
      type: Number,
      default: 0,
    },

    monthlyTarget: {
      type: Number,
      default: 10,
    },

    lastLogin: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Password Hash
// Password Hash
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Password Compare
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;