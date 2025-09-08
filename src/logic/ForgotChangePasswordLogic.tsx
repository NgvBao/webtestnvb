import { useState } from "react";
import ForgotChangePasswordPage from "../pages/ForgotChangePasswordPage";

function ForgotChangePasswordLogic() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [info, setInfo] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    setError(undefined);
    setInfo(undefined);

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không trùng khớp.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // gửi cookie reset_id
        body: JSON.stringify({
          password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail?.message || "Đặt lại mật khẩu thất bại.");
      } else {
        setInfo(data.message || "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
        // 👉 nếu muốn redirect luôn:
        // window.location.href = "/login";
      }
    } catch (err) {
      setError("Có lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
    }
  };

  return (
    <ForgotChangePasswordPage
      onSave={handleSave}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      setNewPassword={setNewPassword}
      setConfirmPassword={setConfirmPassword}
      error={error}
      info={info}
      title="Đặt lại mật khẩu"
    />
  );
}

export default ForgotChangePasswordLogic;
