import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotMailPassword from "../pages/ForgotMailPassword";

function ForgotMailPasswordLogic() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // quan trọng để lưu cookie temp_password_reset_id
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // chuyển sang trang nhập OTP
        navigate("/otp-forgot", { state: { email } });
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ForgotMailPassword
      email={email}
      error={error || undefined}
      loading={loading}
      onEmailChange={setEmail}
      onSubmit={handleSubmit}
    />
  );
}

export default ForgotMailPasswordLogic;
