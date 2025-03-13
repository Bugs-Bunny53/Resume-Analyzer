const { User } = require("../data/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authController = {};

authController.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const userExists = await User.findOne({ username: username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json({ message: "Thank you" });
    return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

authController.login = async (req, res, next) => {
  try {
    const { password, username } = req.body;
    const user = await User.findOne({ username: username });
    if (!username) {
      return res.status(400).json({ message: "incorrect username" });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ message: "incorrect password" });
    }
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "0.5hr",
    });

    res.status(200).json({ message: "logged in ", token });

    return next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "error" });
  }
};

authController.checkAuthStatus = async (req, res, next) => {
  // Define a function checkSSID that takes a list of available SSIDs and a target SSID to check against.

  // Inside the function:
  
  // Loop through each SSID in the list.
  // Compare the current SSID with the target SSID.
  // If a match is found, return true.
  // If the loop completes without finding a match, return false.
  // Define another function scanForSSIDs that simulates retrieving available SSIDs:
  
  // Create a list of sample SSIDs.
  // Call checkSSID with the list and a given target SSID.
  // Print whether the target SSID is found or not.
  // Execute the scanForSSIDs function to perform the check.
};

module.exports = authController;
