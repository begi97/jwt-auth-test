import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 6 },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
