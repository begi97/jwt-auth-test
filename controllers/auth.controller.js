import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateResetToken,
  generateTokenAndSetCookie,
} from "../lib/generateToken.js";

// signup controller
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

// signin user with username or email
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json({ error: "Please fill out all the fields required" });
    }

    // returns null if there is no such email or username
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    // check if username or email exists in the database
    if (!user) {
      return res
        .status(400)
        .json({ error: "There is no such username or email!" });
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // sign jwt and set cookie
    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("ERROR in LOGIN controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// user Forgot Password controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailExists = await User.findOne({ email });

    // if email doesnt exist
    if (!emailExists) {
      return res.status(404).json({ error: "There is no such email" });
    }

    // if email exists then send reset link
    const userId = emailExists._id;
    const { resetToken, resetTokenExpire } = await generateResetToken(userId);

    // reset token saving to database
    await User.findByIdAndUpdate(userId, {
      resetToken,
      resetTokenExpire,
    });

    // link to send to a user
    const resetLink = `http://localhost:${process.env.PORT}/reset-password/${resetToken}`;

    // TODO: send email here

    res.status(200).json({
      message: "Reset instructions have been sent to your email",
      link: resetLink,
    });
  } catch (error) {
    console.log("Error in forgotPassword controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, repeatNewPassword } = req.body;

    // if passwords not matching
    if (newPassword !== repeatNewPassword) {
      return res.status(400).json({ error: "Password not matching!" });
    }

    // password length verification
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    const userId = decoded.userId;

    const user = await User.findOne({ _id: userId });

    if (user) {
      const { resetToken, resetTokenExpire } = user;

      // // if token is incorrect
      // if (token !== resetToken) {
      //   return res.status(400).json({ error: "Invalid token" });
      // }

      // if token expired
      if (resetTokenExpire < Date.now()) {
        return res
          .status(400)
          .json({ error: "Link expired! Please request a new link" });
      }

      const salt = await bcrypt.genSalt(10);
      const newHashedPasswordToSave = await bcrypt.hash(newPassword, salt);

      await User.findByIdAndUpdate(userId, {
        password: newHashedPasswordToSave,
        resetToken: undefined,
        resetTokenExpire: undefined,
      });

      return res
        .status(200)
        .json({ message: "Password has been updated successfully" });
    } else {
      return res.status(404).json({ error: "No such user found" });
    }
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    return res.status(500).json({ error: "Invalid or expired token" });
  }
};

// get me controller
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
