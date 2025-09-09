import React, { useState } from "react";
import OtpPage from "../pages/OtpPage";

function OtpChangeLogic() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [info, setInfo] = useState<string | undefined>(undefined);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  // Gọi API xác thực OTP
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(undefined);
    setInfo(undefined);
    setLoadingSubmit(true);

    try {
      const response = await fetch("http://localhost:8000/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // gửi cookie reset_id
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail?.message || "Xác thực OTP thất bại");
      } else {
        if (data.status === "expired") {
          setInfo(data.message); // "Mã OTP đã hết hạn, đã gửi mới"
        } else {
          setInfo(data.message); // "Xác thực OTP thành công"
          // 👉 điều hướng qua trang đổi mật khẩu
          window.location.href = "/change-password";
        }
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Gọi API resend OTP
  const handleResend = async () => {
    setError(undefined);
    setInfo(undefined);
    setLoadingResend(true);

    try {
      const response = await fetch("http://localhost:8000/auth/resend-reset-otp", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail?.message || "Gửi lại OTP thất bại");
      } else {
        setInfo(data.message || "OTP mới đã được gửi đến email.");
      }
    } catch {
      setError("Có lỗi xảy ra khi gửi lại OTP.");
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <OtpPage
      otp={otp}
      error={error}
      info={info}
      loadingSubmit={loadingSubmit}
      loadingResend={loadingResend}
      onOtpChange={setOtp}
      onSubmit={handleSubmit}
      onResend={handleResend}
    />
  );
}

export default OtpChangeLogic;
