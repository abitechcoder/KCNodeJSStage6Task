const express = require("express");
const {
  registerUser,
  logInUser,
  getProfile,
  updateProfile,
} = require("./controller/user");
const Authorization = require("./middleware/Authorization");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>Hello, Welcome</h1>");
});

app.post("/register", registerUser);

app.post("/login", logInUser);

app.post("/profile", Authorization, getProfile);

app.patch("/profile", Authorization, updateProfile);

app.listen(3000, () => {
  console.log("Server listening on Port 3000");
});
