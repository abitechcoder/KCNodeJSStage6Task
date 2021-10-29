const { userDB, profileDB } = require("../model/data");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// function to register a new user
const registerUser = async (req, res) => {
  // Schema to describe the type of data
  const schema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    repeat_password: Joi.ref("password"),
    email: Joi.string().email({ minDomainSegments: 2 }),
  });

  try {
    // Validating the values coming from the request body
    const value = await schema.validateAsync(req.body);
    // Destructuring the values validated againt the schema
    const { name, email, password } = value;

    // Checking if a user exist in user database
    let foundUser = userDB.find((data) => email === data.email);
    // If the user does not exist create a new user
    if (!foundUser) {
      // hashing the password from the client
      let hashPassword = await bcrypt.hash(password, 10);
      // Create a new User object
      let newUser = {
        id: uuidv4(),
        name: name,
        email: email,
        status: "pending",
        password: hashPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Create a new user profile
      let profile = {
        id: uuidv4(),
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add the newly created user to the user database
      userDB.push(newUser);
      // Add the user information to the profile database
      profileDB.push(profile);
      console.log(userDB);
      console.log(profileDB);

      res
        .status(200)
        .json([{ success: true, message: "User created successfully" }]);
    } else {
      res
        .status(400)
        .json([{ success: false, message: "Email already exist" }]);
    }
  } catch (err) {
    res.status(422).json([{ success: false, message: err.details[0] }]);
  }
};

const logInUser = async (req, res) => {
  // Schema to describe the type of data
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  });
  try {
    // Validating the values coming from the request body
    const value = await schema.validateAsync(req.body);
    // Destructuring the values validated againt the schema
    const { email, password } = value;

    // Checking if a user exist in user database
    let foundUser = userDB.find((data) => email === data.email);
    // If user is found compare the submitted password with the stored password
    if (foundUser) {
      let submittedPass = password;
      let storedPass = foundUser.password;
      // Checks if the submitted password matches with the stored password
      const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
      // if password matches
      if (passwordMatch) {
        // generate a user token for the user
        const token = jwt.sign(
          { id: foundUser.id, email: foundUser.email },
          "abitech_secret",
          {
            expiresIn: "2d",
          }
        );

        res.status(200).json([
          {
            success: true,
            token: `${token}`,
            message: "User logged in Successfully",
          },
        ]);
      } else {
        res.status(400).json([
          {
            success: false,
            message: "Password is incorrect",
          },
        ]);
      }
    } else {
      res.status(422).json([
        {
          success: false,
          message:
            "User does not exist, please proceed to the registration page",
        },
      ]);
    }
  } catch {
    res.status(500).send("Something went wrong Internal server error");
  }
};

const getProfile = async (req, res) => {
  // Gets the user email from the res.locals object
  const userEmail = res.locals.userEmail;

  // find if the user exist in the User Database
  const account = userDB.find((user) => user.email === userEmail);

  if (account) {
    profileDB.find((profile) => {
      if (profile.email === account.email) {
        // attach account id to the profile object
        (profile.accountId = account.id),
          // attach the account status to the profile object
          (profile.status = account.status);

        res.status(200).json({ success: true, data: profile });
      } else {
        res
          .status(404)
          .json({ success: false, message: "User profile not found" });
      }
    });
  } else {
    res.status(404).json({ success: false, message: "User account not found" });
  }
};

const updateProfile = async (req, res) => {
  // Gets the user email from the res.locals object
  const userEmail = res.locals.userEmail;

  // find if the user exist in the User Database
  const user = userDB.find((account) => account.email === userEmail);

  if (user) {
    profileDB.find((profile) => {
      const updatedProfile = { ...profile, ...req.body };
      res.status(201).json({ success: true, data: updatedProfile });
    });
  } else {
    res
      .status(404)
      .json({ success: false, messsage: "User account not found" });
  }
};
module.exports = { registerUser, logInUser, getProfile, updateProfile };
