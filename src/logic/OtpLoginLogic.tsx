// OtpLoginLogic.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpPage from "../pages/OtpPage";
import { useUser } from "../context"; // hook context user

function OtpLoginLogic() {
  const { setUser } = useUser(); // để cập nhật user sau OTP login
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  // Submit OTP
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otp) {
      setError("Vui lòng nhập OTP.");
      return;
    }

    setLoadingSubmit(true);

    try {
      const response = await fetch("http://localhost:8000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp }),
      });

      const data = await response.json().catch(() => ({}));
      setLoadingSubmit(false);

      if (response.ok) {
        // backend trả về thông tin user
        const userData = data.user;
        if (userData) {
          setUser(userData); // cập nhật context user
          setInfo(data.message || "Đăng nhập thành công!");
          setError("");
          navigate("/dashboard"); // chuyển thẳng sang dashboard
        } else {
          setError("Không thể xác thực user.");
        }
      } else if (response.status === 401 || response.status === 400) {
        setError(data.detail?.message || "Mã OTP không hợp lệ hoặc hết hạn");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
      setLoadingSubmit(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoadingResend(true);

    try {
      const response = await fetch("http://localhost:8000/auth/resend-otp", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));
      setLoadingResend(false);

      if (response.ok) {
        setInfo(data.message || "OTP đã gửi lại thành công");
      } else {
        setError(data.detail?.message || "Không thể gửi lại OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối tới server");
      setLoadingResend(false);
    }
  };

  return (
    <OtpPage
      otp={otp}
      error={error}
      info={info}
      onOtpChange={setOtp}
      onSubmit={handleSubmit}
      onResend={handleResend}
      loadingSubmit={loadingSubmit}
      loadingResend={loadingResend}
    />
  );
}

export default OtpLoginLogic;
