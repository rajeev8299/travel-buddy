import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, KeyRound, HelpCircle, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/authContext";
import Logo from "../components/Logo";
import { api } from "../lib/api";

export default function AdminLogin() {
  const { user, ready, signIn, signOut } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "change-password" | "forgot-password"
  
  // Sign in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Change password state
  const [cpEmail, setCpEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");
  const [cpSubmitting, setCpSubmitting] = useState(false);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState("");
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");
  const [fpSubmitting, setFpSubmitting] = useState(false);

  if (ready && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const signedIn = await signIn({ email, password });
      if (signedIn.role !== "admin") {
        signOut();
        throw new Error("That account doesn't have admin access.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setCpError("");
    setCpSuccess("");

    if (newPassword !== confirmPassword) {
      setCpError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setCpError("New password must be at least 8 characters long.");
      return;
    }

    setCpSubmitting(true);
    try {
      const res = await api.post("/auth/change-password", {
        email: cpEmail,
        currentPassword,
        newPassword,
      });
      setCpSuccess(res.message || "Password updated successfully! You can now sign in.");
      setEmail(cpEmail);
      setPassword("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setCpError(err.message || "Failed to update password.");
    } finally {
      setCpSubmitting(false);
    }
  };

  const onForgotPassword = async (e) => {
    e.preventDefault();
    setFpError("");
    setFpSuccess("");

    if (!fpEmail.trim()) {
      setFpError("Please enter your registered admin email address.");
      return;
    }

    setFpSubmitting(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: fpEmail });
      setFpSuccess(res.message || "Recovery instructions sent!");
    } catch (err) {
      setFpError(err.message || "Email address not found.");
    } finally {
      setFpSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      {mode === "signin" && (
        <form className="admin-login__card form" onSubmit={onSubmit} noValidate>
          <Logo size={44} />
          <h1>Admin sign in</h1>
          <p className="admin-login__sub">TravelOnBuddy back office — staff only.</p>

          <div className="field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label htmlFor="admin-password">Password</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setFpEmail(email);
                    setFpError("");
                    setFpSuccess("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "0.80rem",
                    color: "var(--muted)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Forgot ID / password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("change-password");
                    setCpEmail(email);
                    setCpError("");
                    setCpSuccess("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "0.80rem",
                    color: "var(--orange-deeper)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Change?
                </button>
              </div>
            </div>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="form__summary form__summary--server" role="alert">
              <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
              {error}
            </p>
          )}

          <button className="btn btn--solid btn--lg form__submit" type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 size={17} strokeWidth={2.2} aria-hidden="true" className="spin" />
            ) : (
              <LogIn size={17} strokeWidth={2.2} aria-hidden="true" />
            )}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      )}

      {mode === "change-password" && (
        <form className="admin-login__card form" onSubmit={onChangePassword} noValidate>
          <Logo size={44} />
          <h1>Change password</h1>
          <p className="admin-login__sub">Update your administrator account password.</p>

          <div className="field">
            <label htmlFor="cp-email">Admin Email</label>
            <input
              id="cp-email"
              type="email"
              value={cpEmail}
              onChange={(e) => setCpEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cp-current-password">Current Password</label>
            <input
              id="cp-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cp-new-password">New Password (min 8 chars)</label>
            <input
              id="cp-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cp-confirm-password">Confirm New Password</label>
            <input
              id="cp-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {cpError && (
            <p className="form__summary form__summary--server" role="alert">
              <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
              {cpError}
            </p>
          )}

          {cpSuccess && (
            <p className="form__summary form__summary--success" style={{ background: "#EBF8F2", color: "#1A6342", border: "1px solid #B7E4CF" }} role="status">
              <CheckCircle2 size={15} strokeWidth={2.4} aria-hidden="true" />
              {cpSuccess}
            </p>
          )}

          <button className="btn btn--solid btn--lg form__submit" type="submit" disabled={cpSubmitting}>
            {cpSubmitting ? (
              <Loader2 size={17} strokeWidth={2.2} aria-hidden="true" className="spin" />
            ) : (
              <KeyRound size={17} strokeWidth={2.2} aria-hidden="true" />
            )}
            {cpSubmitting ? "Updating password…" : "Update Password"}
          </button>

          <button
            type="button"
            className="btn btn--soft"
            style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
            onClick={() => setMode("signin")}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Sign in
          </button>
        </form>
      )}

      {mode === "forgot-password" && (
        <form className="admin-login__card form" onSubmit={onForgotPassword} noValidate>
          <Logo size={44} />
          <h1>Account recovery</h1>
          <p className="admin-login__sub">Recover admin access or identify your login ID.</p>

          <div className="field">
            <label htmlFor="fp-email">Admin Email Address</label>
            <input
              id="fp-email"
              type="email"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              placeholder="e.g. admin@example.com"
              required
            />
          </div>

          {fpError && (
            <p className="form__summary form__summary--server" role="alert">
              <AlertCircle size={15} strokeWidth={2.4} aria-hidden="true" />
              {fpError}
            </p>
          )}

          {fpSuccess && (
            <div className="form__summary form__summary--success" style={{ background: "#EBF8F2", color: "#1A6342", border: "1px solid #B7E4CF", display: "flex", flexDirection: "column", gap: "6px" }} role="status">
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} strokeWidth={2.4} aria-hidden="true" />
                <strong>Account Identified</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.45 }}>{fpSuccess}</p>
            </div>
          )}

          <button className="btn btn--solid btn--lg form__submit" type="submit" disabled={fpSubmitting}>
            {fpSubmitting ? (
              <Loader2 size={17} strokeWidth={2.2} aria-hidden="true" className="spin" />
            ) : (
              <HelpCircle size={17} strokeWidth={2.2} aria-hidden="true" />
            )}
            {fpSubmitting ? "Verifying…" : "Recover Admin Access"}
          </button>

          <button
            type="button"
            className="btn btn--soft"
            style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
            onClick={() => setMode("signin")}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Sign in
          </button>
        </form>
      )}
    </div>
  );
}
