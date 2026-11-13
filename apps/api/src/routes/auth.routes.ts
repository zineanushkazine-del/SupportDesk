import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller";
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: { message: "Too many login attempts. Try again later." },
    meta: null,
  },
});

const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);

export default router;