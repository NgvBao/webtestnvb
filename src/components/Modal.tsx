import React from "react";
import "../components styles/Modal.css";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "password" | "textarea";
  placeholder?: string;
  editable?: boolean;
  value?: string;
};

export type FieldColumn = Field & {
  render?: (value: string, onChange: (v: string) => void) => React.ReactNode;
};

type ModalFormProps = {
  isOpen: boolean;
  header?: string;
  fields: FieldColumn[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClose: () => void;
  onSave?: () => void;
  footer?: React.ReactNode; // parent tự thêm nút
};

const ModalForm = ({
  isOpen,
  header,
  fields,
  values,
  onChange,
  onClose,
  onSave,
  footer,
}: ModalFormProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {header && <h2 className="modal-header">{header}</h2>}

        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave?.();
          }}
        >
          {fields.map((field) => {
            const value = values[field.key] || "";
            const handleChange = (v: string) => onChange(field.key, v);

            return (
              <div className="modal-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>

                {field.render ? (
                  field.render(value, handleChange)
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    value={value}
                    placeholder={field.placeholder}
                    disabled={field.editable === false}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type || "text"}
                    value={value}
                    placeholder={field.placeholder}
                    disabled={field.editable === false}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                )}
              </div>
            );
          })}

          {/* Footer do parent tự thêm */}
          {footer && <div className="modal-footer">{footer}</div>}
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
