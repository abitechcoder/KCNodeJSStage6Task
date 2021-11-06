const { userModel, profileModel, permissionModel } = require("../model/user");
const { userDB, profileDB } = require("../model/data");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const EmailService = require("../utils/mailsender");

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
        name: name,
        email: email,
        password: hashPassword,
      };

      // Add the newly created user to the accounts collection
      const createdUser = await userModel.create(newUser);

      // Setup Permission
      const permission = {
        user: createdUser._id,
      };

      // Save permission
      const createdPermission = await permissionModel.create(permission);

      // Create a new user profile
      let profile = {
        name: name,
        email: email,
        status: createdUser._id,
        permission: createdPermission._id,
      };

      // Add the user information to the profiles collection
      const createdProfile = await profileModel.create(profile);

      // console.log(createdUser, createdProfile, createdPermission);
      const token = jwt.sign({ id: createdUser._id }, "abitech_secret", {
        expiresIn: "1d",
      });

      EmailService({
        mail: createdUser.email,
        subject: "Verify your Account",
        body: `<h3>Hey ${createdUser.name}</h3>
        <h4>Welcome to our platform</h4>
        <p>Pleaese click the link below to Activate your account.</p>
        <a href="http://localhost:3000/user/verify/?secure=${token}">Activate account</a>`,
      });

      res
        .status(200)
        .json([{ success: true, message: "User created successfully" }]);
    } else {
      res
        .status(400)
        .json([{ success: false, message: "Email already exist" }]);
    }
  } catch (err) {
    if (err.details) {
      res.status(422).json([{ success: false, message: err.details[0] }]);
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
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
    const foundUser = await userModel.findOne({ email: email }).exec();
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
          { id: foundUser._id, email: foundUser.email },
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
  const account = await userModel.findOne({ email: userEmail }).exec();

  if (account) {
    profileModel
      .findOne({ email: userEmail })
      .populate({ path: "status", select: "status" })
      .populate({ path: "permission", select: "type" })
      .then((profile) => {
        if (profile.email === account.email) {
          // attach account id to the profile object
          // profile.accountId = account._id;
          // attach the account status to the profile object
          // profile.status = profile.status.status;
          // console.log(profile);
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

const deleteUser = async (req, res) => {
  const accountId = res.locals.userId;
  try {
    // Delete User Account from the database
    const deletedUser = await userModel.findByIdAndDelete(accountId);

    // Delete user profile from the database
    const deletedProfile = await profileModel.findOneAndDelete({
      email: deletedUser.email,
    });

    // Delete user permission record from the database
    const deletedPermission = await permissionModel.findOneAndDelete({
      user: deletedUser._id,
    });

    res.status(200).json({
      success: true,
      message: "User deleted Successfully",
      deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyAccount = async (req, res) => {
  const token = req.query.secure;

  const { id } = jwt.verify(token, "abitech_secret");
  let foundIndex;
  // check if user exist and fetch user info from the database
  userModel.findByIdAndUpdate(id, { status: "activated" }, (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      res
        .status(201)
        .json({ success: true, message: "User Activated Successfully" });
    }
    // if (user.status === "pending") {
    //   user.status = "activated";
    //   userDB.splice(foundIndex, 1, user);
    //   res
    //     .status(201)
    //     .json({ success: true, message: "User Activated Successfully" });
    // } else {
    //   res
    //     .status(304)
    //     .json({ success: false, message: "User already Activated" });
    // }
  });
};
module.exports = {
  registerUser,
  logInUser,
  getProfile,
  updateProfile,
  deleteUser,
  verifyAccount,
};
