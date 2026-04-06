import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import ProfileMediaPanel from "../../profile/ProfileMediaPanel";
import { uploadCurrentSeekerProfilePicture } from "../../lib/seekerProfileApi";

function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    "/default-profile.png"
  );
  const previewUrlRef = useRef();
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

    if (name === "role" && value === "employer") {
      setProfilePictureFile(null);
      setProfilePicturePreview("/default-profile.png");
    }
  }

  function handleProfilePictureUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setProfilePictureFile(file);
    setProfilePicturePreview(previewUrl);
    event.target.value = "";
  }

  function handleRemoveProfilePicture() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = undefined;
    }

    setProfilePictureFile(null);
    setProfilePicturePreview("/default-profile.png");
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function validateFields() {
    const errors = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/;

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      errors.push({ field: "Name", message: "Name is required" });
    } else if (nameTrimmed.length < 2) {
      errors.push({ field: "Name", message: "Name must be at least 2 characters" });
    } else if (nameTrimmed.length > 60) {
      errors.push({ field: "Name", message: "Name must be at most 60 characters" });
    }

    const usernameTrimmed = formData.username.trim();
    if (!usernameTrimmed) {
      errors.push({ field: "Username", message: "Username is required" });
    } else if (usernameTrimmed.length < 3) {
      errors.push({ field: "Username", message: "Username must be at least 3 characters" });
    } else if (usernameTrimmed.length > 30) {
      errors.push({ field: "Username", message: "Username must be at most 30 characters" });
    } else if (!/^[a-zA-Z0-9_]+$/.test(usernameTrimmed)) {
      errors.push({ field: "Username", message: "Username may only contain letters, numbers, and underscores" });
    }

    const emailTrimmed = formData.email.trim().toLowerCase();
    if (!emailTrimmed) {
      errors.push({ field: "Email", message: "Email is required" });
    } else if (emailTrimmed.length > 128) {
      errors.push({ field: "Email", message: "Email must be at most 128 characters" });
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.push({ field: "Email", message: "Invalid email" });
    }

    const password = formData.password || "";
    if (!password) {
      errors.push({ field: "Password", message: "Password is required" });
    } else {
      if (password.length < 8) {
        errors.push({ field: "Password", message: "Password must be at least 8 characters" });
      }
      if (password.length > 72) {
        errors.push({ field: "Password", message: "Password must be at most 72 characters" });
      }
      if (!passwordRegex.test(password)) {
        errors.push({ field: "Password", message: "Password must include uppercase, lowercase, number, and symbol, and contain no spaces" });
      }
    }

    if (formData.confirmPassword !== password) {
      errors.push({ field: "Confirm Password", message: "Passwords do not match" });
    }

    const valid = errors.length === 0;

    if (!valid) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted errors.",
        details: errors,
      });
      setIsSubmitting(false);
    }

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "", details: [] });

    if (!validateFields()) { return; }

    const registerPayload = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
    };

    try {
      const { data, ok } = await register(registerPayload);

      if (!ok) {
        const fieldErrors = [];
        if (data.code === "EMAIL_ALREADY_IN_USE") {
          fieldErrors.push({ field: "Email", message: "Email is already registered" });
        } else if (data.code === "USERNAME_ALREADY_IN_USE") {
          fieldErrors.push({ field: "Username", message: "Username is already taken" });
        }

        setStatus({
          type: "error",
          message: fieldErrors.length > 0 ? "Please fix the highlighted errors." : (data.message || "Could not create account"),
          details: fieldErrors.length > 0 ? fieldErrors : (Array.isArray(data.details) ? data.details : []),
        });
        return;
      }

      if (profilePictureFile && !isEmployer) {
        const uploadResult = await uploadCurrentSeekerProfilePicture(profilePictureFile);

        if (!uploadResult.ok) {
          setStatus({
            type: "error",
            message: "Account created, but profile picture upload failed.",
            details: uploadResult.error?.details || [
              {
                field: "profilePicture",
                message: uploadResult.error?.message || "Failed to upload profile picture",
              },
            ],
          });
          return;
        }
      }

      setStatus({
        type: "success",
        message: `Account created for ${data.user.name}.`,
        details: [],
      });
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "seeker",
      });
      setProfilePictureFile(null);
      setProfilePicturePreview("/default-profile.png");
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
        <span>Username</span>
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="jane_smith"
          autoComplete="username"
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

      <label className="auth-field">
        <span>Confirm Password</span>
        <input
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          autoComplete="new-password"
        />
      </label>

      {isEmployer ? null : (
        <ProfileMediaPanel
          imageSrc={profilePicturePreview}
          imageAlt="Profile Picture"
          isEditing
          inputLabel="Profile Picture"
          inputClassName="profile-file-input"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onFileChange={handleProfilePictureUpload}
          isUploading={isSubmitting}
          hasCustomImage={profilePictureFile !== null}
          onRemove={handleRemoveProfilePicture}
          removeLabel="Remove picture"
        />
      )}

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
