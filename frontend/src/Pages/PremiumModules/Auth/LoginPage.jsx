import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  loginRedirectPath,
  loginStudent,
  resendVerificationEmail,
} from "../../../utils/studentAuth";
import { wakeBackend } from "../../../utils/modules";
import AuthLayout from "./AuthLayout";
import styles from "./StudentAuth.module.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(true);
  const [resending, setResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const nextQuery = params.get("next")
    ? `?next=${encodeURIComponent(params.get("next"))}`
    : "";

  useEffect(() => {
    let cancelled = false;
    setWaking(true);
    setInfo("Connecting to server…");
    wakeBackend().finally(() => {
      if (cancelled) return;
      setWaking(false);
      setInfo("");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setUnverifiedEmail("");
    setLoading(true);
    try {
      // Ensure Render free tier is awake before auth
      setInfo("Waking server…");
      await wakeBackend();
      setInfo("");
      const { ok, data } = await loginStudent(form);
      if (!ok) {
        if (data?.code === "EMAIL_NOT_VERIFIED") {
          const email = data?.body?.email || form.email;
          setUnverifiedEmail(email);
          setError(data?.message || "Please verify your email first.");
          return;
        }
        setError(data?.message || "Could not log in.");
        return;
      }
      navigate(loginRedirectPath(params.get("next")), { replace: true });
    } catch (err) {
      setError(err?.message || "Could not log in. Please try again.");
    } finally {
      setLoading(false);
      setInfo("");
    }
  };

  const handleResend = async () => {
    const email = unverifiedEmail || form.email;
    if (!email) return;
    setResending(true);
    setInfo("");
    const { ok, data } = await resendVerificationEmail(email);
    setResending(false);
    if (!ok) {
      setError(data?.message || "Could not resend verification email.");
      return;
    }
    setInfo(data?.message || "Verification email sent.");
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back — continue learning with Notes-Era."
      onGoogle={() =>
        setError(
          "Google sign-in will be available soon. Use email/password for now.",
        )
      }
      footer={
        <>
          Don&apos;t have an account? <Link to={`/signup${nextQuery}`}>Sign up</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email Address
          <input
            className={styles.input}
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          Password
          <div className={styles.passwordWrap}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange("password")}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </label>

        <p className={styles.forgot}>
          <a href="mailto:noteseraa@gmail.com">Forgot password?</a>
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}
        {info ? <p className={styles.success}>{info}</p> : null}

        {unverifiedEmail ? (
          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
        ) : null}

        <button
          className={styles.submit}
          type="submit"
          disabled={loading || waking}
        >
          {loading
            ? "Logging in..."
            : waking
              ? "Connecting..."
              : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
