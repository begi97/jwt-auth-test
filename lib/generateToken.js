import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  // sign JWT
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  //  set jwt cookie
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
};

export const generateResetToken = async (userId) => {
  const resetToken = jwt.sign({ userId }, process.env.JWT_RESET_SECRET, {
    expiresIn: "30m",
  });

  const resetTokenExpire = Date.now() + 30 * 60 * 1000; // 30 minutes from now

  return { resetToken, resetTokenExpire };
};
