import { useState } from "react";
import { useAuth } from "../../auth/useAuth";

function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker",
  });
  const [status, setStatus] = useState({ type: "", message: "", details: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEmployer = formData.role === "employer";
  const nameLabel = isEmployer ? "Company Name" : "Full Name";
  const namePlaceholder = isEmployer ? "Northstar Labs" : "Jane Smith";
  const nameAutoComplete = isEmployer ? "organization" : "name";

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
      const { data, ok } = await register(formData);

      if (!ok) {
        setStatus({
          type: "error",
          message: data.message || "Could not create account",
          details: Array.isArray(data.details) ? data.details : [],
        });
        return;
      }

      setStatus({
        type: "success",
        message: `Account created for ${data.user.name}.`,
        details: [],
      });
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "seeker",
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
        <p className="auth-form-label">Create Account</p>
        <h2>Register</h2>
      </div>

      <label className="auth-field">
        <span>Account Type</span>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="seeker">Job Seeker</option>
          <option value="employer">Employer</option>
          {/* <option value="admin">Admin</option> */}
        </select>
      </label>

      <label className="auth-field">
        <span>{nameLabel}</span>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder={namePlaceholder}
          autoComplete={nameAutoComplete}
        />
      </label>

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
          placeholder="Create a strong password"
          autoComplete="new-password"
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
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

export default RegisterForm;
