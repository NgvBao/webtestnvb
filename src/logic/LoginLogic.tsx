// src/logic/LoginLogic.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { authServiceLong } from "../api/auth/authService"; // ✅ giữ đúng path

function LoginLogic() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = username.trim();
    if (!identifier || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      setLoading(false);
      return;
    }

try {
  const loginRes = await authServiceLong.login({ identifier, password });
  if (!loginRes.ok) {
    setError(loginRes.message || "Có lỗi xảy ra, vui lòng thử lại.");
    return;
  }

  // GỌI resend ngay khi còn trong cùng context
  const resendRes = await authServiceLong.resendOtp();
  if (!resendRes.ok) {
    console.error("Resend OTP failed:", resendRes.message);
  }

  // Sau đó mới navigate
  navigate("/otp-login", { state: { identifier } });
} finally {
  setLoading(false);
}

  };

  return (
    <LoginPage
      username={username}
      password={password}
      error={error}
      loading={loading}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

export default LoginLogic;
