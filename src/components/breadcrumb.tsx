// src/components/Breadcrumb.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
// (nếu file css của bạn có dấu cách trong folder, giữ nguyên; nếu không, sửa lại path cho đúng)
import "../components styles/breadcrumb.css";

export type Crumb = {
  label: string;
  path?: string; // nếu có path thì click được
};

type Props = {
  items: Crumb[];
  hideFirstSeparator?: boolean; // ✅ thêm prop
};

const Breadcrumb: React.FC<Props> = ({ items, hideFirstSeparator }) => {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const showSep = !isLast && !(hideFirstSeparator && i === 0);

        return (
          <span key={i} className="breadcrumb-item">
            {item.path ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path!);
                }}
              >
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
            {showSep && (
              // dấu › nằm NGAY SAU nhãn, không có space trước
              <span
                className="breadcrumb-separator"
                aria-hidden="true"
                style={{ marginLeft: 0, marginRight: 6 }} // đảm bảo "sczs›⎵Windfarms"
              >
                ›
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
