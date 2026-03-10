import LoginForm from "../components/forms/LoginForm";
import "../styles/AuthPage.css";

function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-page-copy">
        <p className="auth-page-eyebrow">Sign In</p>
        <h1>Access your account and continue your search.</h1>
        <p className="auth-page-text">
          Log in to browse jobs, manage applications, and keep your account
          session active across the board.
        </p>

        <div className="auth-page-panel">
          <h2>After login</h2>
          <ul>
            <li>View the current job board</li>
            <li>Stay signed in with the backend auth session</li>
            <li>Move between public and account pages without re-entering details</li>
          </ul>
        </div>
      </section>

      <LoginForm />
    </main>
  );
}

export default LoginPage;
