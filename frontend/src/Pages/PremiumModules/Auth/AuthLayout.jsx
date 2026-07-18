import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styles from "./StudentAuth.module.css";

const YOGA_LOTTIE = "/Assets2/Premium-Modules/yoga-developer.json";

const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
  showGoogle = true,
  onGoogle,
  googleLabel = "Continue with Google",
}) => {
  return (
    <div className={styles.shell}>
      <aside className={styles.promo}>
        <Link to="/" className={styles.backHome}>
          ← Back to home
        </Link>

        <div className={styles.promoInner}>
          <div className={styles.lottieWrap} aria-hidden>
            <DotLottieReact
              src={YOGA_LOTTIE}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <h2 className={styles.promoTitle}>
            Study smarter.
            <br />
            Exam ka NO Fear.
          </h2>
          <p className={styles.promoSub}>
            Premium modules, unit-wise notes &amp; PYQs — built for B.Tech
            CSE/IT.
          </p>
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={styles.panelInner}>
          <Link to="/" className={styles.brand} aria-label="Notes-Era home">
            <img src="/Assets2/lightLogo.png" alt="Notes-Era" />
          </Link>

          <header className={styles.panelHeader}>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>

          {children}

          {showGoogle ? (
            <>
              <div className={styles.orRow} aria-hidden>
                <span />
                <em>OR</em>
                <span />
              </div>
              <button
                type="button"
                className={styles.google}
                onClick={onGoogle}
              >
                <GoogleIcon />
                {googleLabel}
              </button>
            </>
          ) : null}

          {footer ? <p className={styles.footer}>{footer}</p> : null}
        </div>
      </main>
    </div>
  );
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.9 26.8 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l.1.1 6.2 5.2C39.2 36.3 44 32 44 24c0-1.3-.1-2.7-.4-3.9z"
      />
    </svg>
  );
}

export default AuthLayout;
