import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpPage from "../pages/SignUpPage";
import { authServiceLong } from "../api/auth/authService"; // ✅ giữ đúng path

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

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirm_password: confirmPassword,
    };

    if (!payload.name || !payload.email || !payload.phone || !password || !confirmPassword) {
      setError("Vui long nhap day du thong tin.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mat khau va xac nhan khong khop.");
      setLoading(false);
      return;
    }

    // ✅ Service khong throw: luon tra ApiResult
    const registerRes = await authServiceLong.register(payload);

    if (!registerRes.ok) {
      setError(registerRes.message || "Co loi xay ra, vui long thu lai.");
      setLoading(false);
      return;
    }

    // ✅ Dang ky thanh cong → chuyen sang man OTP
    navigate("/otp-sign-up", { state: { email: payload.email, phone: payload.phone } });

    // (Tuy chon) Gui lai OTP, khong block UI
    authServiceLong.resendRegistrationOtp().then((res) => {
      if (!res.ok) {
        console.error("Resend registration OTP failed:", res.message);
      }
    });

    setLoading(false);
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
