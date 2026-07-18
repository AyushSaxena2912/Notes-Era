import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginRedirectPath,
  resendVerificationEmail,
  verifyStudentOtp,
} from "../../../utils/studentAuth";
import AuthLayout from "./AuthLayout";
import styles from "./StudentAuth.module.css";

const OTP_LENGTH = 6;

const CheckEmailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleOtpChange = (event) => {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!email) {
      setError("Missing email. Go back to sign up.");
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError("");
    setMessage("");
    setVerifying(true);
    const { ok, data } = await verifyStudentOtp({ email, otp });
    setVerifying(false);
    if (!ok) {
      setError(data?.message || "Could not verify OTP.");
      return;
    }
    navigate(loginRedirectPath(params.get("next")), { replace: true });
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email. Go back to sign up.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    const { ok, data } = await resendVerificationEmail(email);
    setLoading(false);
    if (!ok) {
      setError(data?.message || "Could not resend email.");
      return;
    }
    setOtp("");
    const exposed = data?.body?.otp;
    setMessage(
      exposed
        ? `Code sent. For local testing use: ${exposed}`
        : "New code sent. Check inbox + spam.",
    );
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle="Enter the 6-digit code we sent to activate your account."
      showGoogle={false}
      footer={
        <>
          Already verified? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={handleVerify}>
        {email ? (
          <p className={styles.hint}>
            Sent to <strong>{email}</strong>
          </p>
        ) : null}

        <label className={styles.label}>
          Verification code
          <input
            className={`${styles.input} ${styles.otpField}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={handleOtpChange}
            placeholder="••••••"
            aria-label="6-digit verification code"
          />
        </label>

        <p className={styles.hint}>
          Expires in 30 minutes.{" "}
          <button
            type="button"
            className={styles.textBtn}
            onClick={handleResend}
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Resend code"}
          </button>
        </p>

        {error ? <p className={styles.error}>{error}</p> : null}
        {message ? <p className={styles.success}>{message}</p> : null}

        <button
          className={styles.submit}
          type="submit"
          disabled={verifying || !email || otp.length !== OTP_LENGTH}
        >
          {verifying ? "Verifying..." : "Verify & continue"}
        </button>

        <p className={styles.forgot}>
          <Link to="/signup">Use a different email</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default CheckEmailPage;
