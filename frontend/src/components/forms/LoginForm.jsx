import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { routePaths } from "../../routing/routes";

function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({ type: "", message: "", details: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "", details: [] });

    try {
      const { data, ok } = await login(formData);

      if (!ok) {
        setStatus({
          type: "error",
          message: data.message || "Could not log in",
          details: Array.isArray(data.details) ? data.details : [],
        });
        return;
      }

      setStatus({
        type: "success",
        message: `Logged in as ${data.user.name}.`,
        details: [],
      });
      setFormData({
        email: "",
        password: "",
      });
    } catch {
      setStatus({
        type: "error",
        message: "Could not connect to the server.",
        details: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form-card" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <p className="auth-form-label">Welcome Back</p>
        <h2>Login</h2>
      </div>

      <label className="auth-field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          autoComplete="email"
        />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </label>

      {status.message && (
        <div className={`auth-status auth-status-${status.type}`}>
          <p>{status.message}</p>
          {status.details.length > 0 && (
            <ul className="auth-status-list">
              {status.details.map((detail, index) => (
                <li key={`${detail.field}-${index}`}>
                  {detail.field}: {detail.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging In..." : "Login"}
      </button>

      <p className="auth-form-helper">
        Need an account? <Link to={routePaths.register}>Register here</Link>.
      </p>
    </form>
  );
}

export default LoginForm;
