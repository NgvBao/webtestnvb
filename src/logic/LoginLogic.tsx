import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

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

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: username, password }),
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (response.ok) {
        // redirect ngay
        navigate("/otp-login");

        // gửi OTP/email async (fire-and-forget)
        fetch("http://localhost:8000/auth/resend-otp", {
          method: "POST",
          credentials: "include",
        }).catch((err) => console.error("Resend OTP failed:", err));

      } else if (response.status === 401 || response.status === 403) {
        setError(data.detail?.message || "Đăng nhập không thành công");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
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
