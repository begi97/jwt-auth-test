import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { email, username, password, repeatPassword } = req.body;

    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // check if email exists
    const isEmailExisting = await User.findOne({ email });
    if (isEmailExisting) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // check if username exists
    const isUsernameExisting = await User.findOne({ username });
    if (isUsernameExisting) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // check if password and RepeatPassword match
    if (password !== repeatPassword) {
      return res.status(400).json({ error: "Passwords are not matching" });
    }

    // check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    if (!email || !username || !password) {
      return res.status(400).json({
        error: "Please fill out all the fields as soon as possible you mf!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPasswordToSave = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: newHashedPasswordToSave,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("ERROR in SIGNUP controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
  } catch (error) {
    console.error("ERROR in SIGNUP controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
