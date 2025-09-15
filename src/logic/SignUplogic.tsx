import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpPage from "../pages/SignUpPage";

function SignUpLogic() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://fastapi-turbine-62vm.onrender.com/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (response.ok) {
        // chuyển sang OTP page ngay lập tức
        navigate("/otp-sign-up", { state: { email, phone } });

        // gửi lại OTP async (fire-and-forget)
        fetch("https://fastapi-turbine-62vm.onrender.com/api/v1/auth/resend-registration-otp", {
          method: "POST",
          credentials: "include",
        }).catch((err) => console.error("Resend registration OTP failed:", err));
      } else if (response.status === 400 || response.status === 409 || response.status === 422) {
        // backend trả detail dạng object {status, message}
        setError(data.detail?.message || data.message || "Có lỗi xảy ra.");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối đến server.");
      setLoading(false);
    }
  };

  return (
    <SignUpPage
      name={name}
      email={email}
      phone={phone}
      password={password}
      confirmPassword={confirmPassword}
      errorMessage={error}
      loading={loading}
      onChangeName={setName}
      onChangeEmail={setEmail}
      onChangePhone={setPhone}
      onChangePassword={setPassword}
      onChangeConfirmPassword={setConfirmPassword}
      onSignUp={handleSignUp}
      signUpDisabled={loading}
    />
  );
}

export default SignUpLogic;
