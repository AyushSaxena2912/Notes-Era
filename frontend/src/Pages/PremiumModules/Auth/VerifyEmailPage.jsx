import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  loginRedirectPath,
  verifyStudentEmail,
} from "../../../utils/studentAuth";
import AuthLayout from "./AuthLayout";
import styles from "./StudentAuth.module.css";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        setError("Missing verification token.");
        setLoading(false);
        return;
      }

      const { ok, data } = await verifyStudentEmail(token);
      if (cancelled) return;

      if (!ok) {
        setError(data?.message || "Could not verify email.");
        setLoading(false);
        return;
      }

      navigate(loginRedirectPath(params.get("next")), { replace: true });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, params]);

  return (
    <AuthLayout
      title="Verifying email"
      subtitle={
        loading
          ? "One moment — confirming your account..."
          : "We couldn’t verify that link."
      }
      showGoogle={false}
      footer={
        <>
          Need a new link? <Link to="/login">Sign in &amp; resend</Link>
        </>
      }
    >
      <div className={styles.form}>
        {loading ? (
          <p className={styles.hint}>Please wait...</p>
        ) : (
          <>
            {error ? <p className={styles.error}>{error}</p> : null}
            <Link className={styles.submit} to="/login">
              Go to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
