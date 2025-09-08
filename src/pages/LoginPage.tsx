/*
  DOCUMENT TREE - LoginPage Component
  
  login-page (div.login-page)
  ├── login-background-image (img.login-background-image)
  └── login-form-container (div.login-form-container)
      ├── login-title (h1.login-title)
      └── form
          ├── input-form-container (div.input-form-container) — Username field
          │    ├── input-label (label.input-label)
          │    └── input-container (div.input-container)
          │         └── login-input (input.login-input) [type="text"]
          ├── input-form-container (div.input-form-container) — Password field
          │    ├── input-label (label.input-label)
          │    └── input-container (div.input-container)
          │         └── login-input (input.login-input) [type="password"]
          ├── error-message (p.error-message) — rendered conditionally if error exists
          └── login-submit-button (button.login-submit-button)
          └── sign-up-button (button.sign-up-button)
*/
import React from "react";
import "../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
  username: string;
  password: string;
  error?: string;
  loading?: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

function LoginPage({
  username,
  password,
  error,
  loading = false,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginPageProps) {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2 className="login-title">Login</h2>
        <form onSubmit={onSubmit}>
          <div className="input-form-container">
            <label className="input-label">Your email or phone</label>
            <div className="input-container">
              <input
                type="text"
                className="login-input"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="Enter your email or phone"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-form-container">
            <label className="input-label">Your password</label>
            <div className="input-container">
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button
            type="button"
            className="forgot-password-button"
            onClick={() => navigate("/forgot-password")}
            disabled={loading}
          >
            Forgot Password?
            </button>

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Login..." : "Login"}
          </button>

          <button
            type="button"
            className="sign-up-button"
            onClick={() => navigate("/sign-up")}
            disabled={loading}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
