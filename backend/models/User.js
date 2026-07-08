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
      enum: ["active", "inactive"],
      default: "active",
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

    lastLogin: {
      type: Date,
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