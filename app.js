const express = require("express");
const { registerUser, logInUser } = require("./controller/user");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>Hello, Welcome</h1>");
});

app.post("/register", registerUser);

app.post("/login", logInUser);

app.listen(3000, () => {
  console.log("Server listening on Port 3000");
});
