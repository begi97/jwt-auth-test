import { Router } from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
} from "../controllers/auth.controller.js";

const router = Router();
// get requests
router.get("/getMe", logout);

// post requests
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);

export default router;
