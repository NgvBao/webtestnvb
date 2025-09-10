import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpPage from "../pages/OtpPage";

function OtpSignupLogic() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

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
      const response = await fetch("https://fastapi-turbine-62vm.onrender.com/auth/verify-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ otp })
      });

      const data = await response.json().catch(() => ({}));
      setLoadingSubmit(false);

      if (response.ok) {
        setInfo(data.message || "Xác thực thành công!");
        setError("");
        setTimeout(() => navigate("/login"), 1000);
      } else if (response.status === 422) {
        const firstError = Array.isArray(data.detail)
          ? data.detail[0]?.msg || "Có lỗi xảy ra."
          : data.detail || "Có lỗi xảy ra.";
        setError(firstError);
      } else {
        setError(data.detail?.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến server.");
      setLoadingSubmit(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoadingResend(true);

    try {
      const response = await fetch("https://fastapi-turbine-62vm.onrender.com/auth/resend-registration-otp", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: location.state?.email, phone: location.state?.phone }),
      });
      const data = await response.json().catch(() => ({}));
      setLoadingResend(false);

      if (response.ok) setInfo(data.message || "OTP đã gửi lại.");
      else setError(data.message || "Không thể gửi lại OTP.");
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến server.");
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

export default OtpSignupLogic;
