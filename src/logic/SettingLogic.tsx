// src/logic/SettingLogic.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingPage from "../pages/SettingPage";
import { useUser } from "../context"; // import hook context user

function SettingLogic() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [info, setInfo] = useState<string | undefined>();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const { setUser } = useUser(); // dùng để reset user khi logout
  const navigate = useNavigate();

  // Logout
  const handleLogout = async () => {
    setLoadingLogout(true);
    setError(undefined);
    try {
      const res = await fetch("https://fastapi-turbine-62vm.onrender.com/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setLoadingLogout(false);

      if (res.ok) {
        setUser(null); // reset user context
        navigate("/login"); // điều hướng về login
      } else {
        setError(data.message || "Logout failed");
      }
    } catch (err) {
      console.error("❌ Error logout:", err);
      setError("Network error");
      setLoadingLogout(false);
    }
  };

  // Save password
  const handleSave = async () => {
    if (!current || !newPass || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (newPass !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoadingSave(true);
    setError(undefined);
    setInfo(undefined);

    try {
      const res = await fetch("https://fastapi-turbine-62vm.onrender.com/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: current, new_password: newPass }),
      });

      const data = await res.json();
      setLoadingSave(false);

      if (res.ok) {
        setInfo("Password changed successfully");
        setCurrent("");
        setNewPass("");
        setConfirm("");
      } else {
        setError(data.message || "Change password failed");
      }
    } catch (err) {
      console.error("❌ Error change password:", err);
      setError("Network error");
      setLoadingSave(false);
    }
  };

  return (
    <SettingPage
      onLogout={handleLogout}
      onSave={handleSave}
      current={current}
      newPass={newPass}
      confirm={confirm}
      setCurrent={setCurrent}
      setNewPass={setNewPass}
      setConfirm={setConfirm}
      error={error}
      info={info}
      loadingSave={loadingSave}
      loadingLogout={loadingLogout}
    />
  );
}

export default SettingLogic;
