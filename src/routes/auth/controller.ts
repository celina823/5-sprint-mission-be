import express from "express";
import authService from "./service";

const router = express.Router();

// 회원가입 API
router.post("/signUp", authService.registerUser);

// 로그인 API
router.post("/signIn", authService.loginUser);

router.post("/refresh-token", authService.refreshAccessToken);

export default router;
