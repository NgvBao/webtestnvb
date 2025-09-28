import "../styles/SettingPage.css";

type SettingPageProps = {
  onLogout: () => void;
  onSave: () => void;
  current: string;
  newPass: string;
  confirm: string;
  setCurrent: (val: string) => void;
  setNewPass: (val: string) => void;
  setConfirm: (val: string) => void;
  title?: string;
  error?: string;
  info?: string;
  loadingSave: boolean;
  loadingLogout: boolean;
};

function SettingPage({
  onLogout,
  onSave,
  current,
  newPass,
  confirm,
  setCurrent,
  setNewPass,
  setConfirm,
  info,
  error,
  title = "Change password",
}: SettingPageProps) {
  return (
    <>
      <div className="setting-header">
        <h1 className="page-title">Setting</h1>
        <button className="btn-logout" onClick={onLogout}>
          Log out
        </button>
      </div>

      <div className="change-password-form">
        <h2>{title}</h2>

        <div className="input-group">
          <label className="title-group">
            <span style={{ color: "red" }}>*</span> Current password
          </label>
          <input
            className="input-field"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="title-group">
            <span style={{ color: "red" }}>*</span> New password
          </label>
          <input
            className="input-field"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="title-group">
            <span style={{ color: "red" }}>*</span> Confirm password
          </label>
          <input
            className="input-field"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {info && <p className="info-text">{info}</p>}

        <button className="save-btn" onClick={onSave}>
          Save
        </button>
      </div>
    </>
  );
}

export default SettingPage;
