import RegisterForm from "../components/forms/RegisterForm";
import "../styles/AuthPage.css";

function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-page-copy">
        <p className="auth-page-eyebrow">Join The Platform</p>
        <h1>Create your job board account.</h1>
        <p className="auth-page-text">
          Set up your profile to browse jobs, save listings, and manage your
          applications or postings from one place.
        </p>

        <div className="auth-page-panel">
          <h2>What you can do next</h2>
          <ul>
            <li>Browse open roles across the board</li>
            <li>Create a job seeker or employer account</li>
            <li>Stay signed in with the backend auth session</li>
          </ul>
        </div>
      </section>

      <RegisterForm />
    </main>
  );
}

export default RegisterPage;
