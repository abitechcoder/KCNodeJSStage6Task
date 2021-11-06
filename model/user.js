const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const profileSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  permission: {
    type: Schema.Types.ObjectId,
    ref: "Permission",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const permissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  type: {
    type: String,
    required: true,
    trim: true,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const userModel = model("Account", userSchema);
const profileModel = model("Profile", profileSchema);
const permissionModel = model("Permission", permissionSchema);

module.exports = { userModel, profileModel, permissionModel };
