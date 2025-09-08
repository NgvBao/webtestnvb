// Button.tsx
import React from "react";
import "../components styles/button.css";

type ButtonProps = {
  label: string;
  variant: "cancel" | "delete" | "submit" | "approve" | "detail";
  onClick?: () => void;
  hidden?: boolean;
  loading?: boolean; // thêm prop loading
};

const Button: React.FC<ButtonProps> = ({
  label,
  variant,
  onClick,
  hidden,
  loading,
}) => {
  return (
    <button
      className={`btn btn-${variant} ${hidden ? "hidden" : ""}`}
      onClick={onClick}
      disabled={loading} // disable khi đang loading
    >
      {loading && variant === "approve" ? "Approving..." : label}
    </button>
  );
};

export default Button;
