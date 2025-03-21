// Express 서버를 실행하고, auth.routes.ts를 등록합니다.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth/controller";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 인증 관련 라우트 추가
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
