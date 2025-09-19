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
      // ✅ Service không throw; luôn trả ApiResult
      const loginRes = await authServiceLong.login({ identifier, password });

      if (!loginRes.ok) {
        setError(loginRes.message || "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }

      // ✅ Theo DTO: LoginPendingResponse chỉ có { message }, chuyển sang màn OTP
      navigate("/otp-login", { state: { identifier } });

      // (Tuỳ chọn) gửi lại OTP ngay sau khi điều hướng
      const resendRes = await authServiceLong.resendOtp();
      if (!resendRes.ok) {
        console.error("Resend OTP failed:", resendRes.message);
      }
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
