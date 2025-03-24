import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/client";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/token";
import { ExceptionMessage } from "../../constant/ExceptionMessage";

// 회원가입 서비스
const registerUser = async (req, res) => {
  try {
    const { email, nickname, password, passwordConfirmation } = req.body;

    // 🔹 비밀번호 확인 일치 여부 검사
    if (password !== passwordConfirmation) {
      return res.status(400).json({
        message: ExceptionMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
        details: {
          passwordConfirmation: {
            message: ExceptionMessage.PASSWORD_CONFIRMATION_NOT_MATCH,
          },
        },
      });
    }

    // 🔹 이미 존재하는 이메일인지 확인
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: ExceptionMessage.ALREADY_REGISTERED_EMAIL,
        details: {
          email: { message: ExceptionMessage.ALREADY_REGISTERED_EMAIL },
        },
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.users.create({
      data: { email, nickname, encryptedPassword: hashedPassword, image: null },
    });
    // 🔹 AccessToken & RefreshToken 생성
    const accessToken = generateToken(user.id, "access");
    const refreshToken = generateToken(user.id, "refresh");

    // 🔹 응답 데이터 포맷 맞추기
    res.status(200).json({
      message: "회원가입 성공",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "회원가입 중 오류 발생" });
  }
};

// 로그인 서비스
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 이메일 존재 여부 확인
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: ExceptionMessage.CURRENT_PASSWORD_NOT_MATCH,
        details: {
          email: { message: ExceptionMessage.CURRENT_PASSWORD_NOT_MATCH },
        },
      });
    }

    // 🔹 비밀번호 일치 여부 확인
    const isPasswordValid = await bcrypt.compare(
      password,
      user.encryptedPassword
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        message: ExceptionMessage.CURRENT_PASSWORD_NOT_MATCH,
        details: {
          password: { message: ExceptionMessage.CURRENT_PASSWORD_NOT_MATCH },
        },
      });
    }

    // 🔹 AccessToken & RefreshToken 생성
    const accessToken = generateToken(user.id, "access");
    const refreshToken = generateToken(user.id, "refresh");

    // 🔹 응답 데이터 포맷 맞추기
    res.status(200).json({
      message: "로그인 성공",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "로그인 중 오류 발생" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 🔹 토큰이 없는 경우
    if (!refreshToken) {
      return res.status(400).json({ message: ExceptionMessage.INVALID_TOKEN });
    }

    // 🔹 Refresh Token 검증
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res
        .status(400)
        .json({ message: ExceptionMessage.INVALID_REFRESH_TOKEN });
    }

    // 🔹 유저가 존재하는지 확인
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res
        .status(400)
        .json({ message: ExceptionMessage.INVALID_REFRESH_TOKEN });
    }

    // 🔹 새로운 Access Token 생성
    const accessToken = generateToken(user.id, "access");

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "토큰 갱신 중 오류 발생" });
  }
};

// 서비스 객체로 내보내기
const authService = { registerUser, loginUser, refreshAccessToken };
export default authService;
