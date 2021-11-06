const express = require("express");
const {
  registerUser,
  logInUser,
  getProfile,
  updateProfile,
  deleteUser,
  verifyAccount,
} = require("./controller/user");
const Authorization = require("./middleware/Authorization");
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to mongodb
mongoose.connect(process.env.MONGODB_URI, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected to MongoDB");
  }
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>Hello, Welcome</h1>");
});

// creates a user account
app.post("/user/register", registerUser);

// verifies user account
app.get("/user/verify", verifyAccount);

// authenticates the user
app.post("/user/login", logInUser);

// gets the user profile
app.post("/user/profile", Authorization, getProfile);

// updates the user profile
app.patch("/user/profile", Authorization, updateProfile);
app.delete("/user", Authorization, deleteUser);

app.listen(3000, () => {
  console.log("Server listening on Port 3000");
});
