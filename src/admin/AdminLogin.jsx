import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../auth/authContext";
import Logo from "../components/Logo";

export default function AdminLogin() {
  const { user, ready, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="admin-login">
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
          <label htmlFor="admin-password">Password</label>
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
    </div>
  );
}
