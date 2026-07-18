import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <a href="/" className={styles.logoLink}>
            <img src="/Assets2/lightLogo.png" alt="Notes-Era" />
          </a>
          <p className={styles.tagline}>
            Shop exam modules by college and year — structured notes, soft
            copies, and campus-ready prep in one store.
          </p>
          <p className={styles.copy}>
            Copyright © {new Date().getFullYear()} Notes-Era. All Rights
            Reserved.
          </p>
        </div>

        <div className={styles.columns}>
          <div className={styles.col}>
            <h3>Socials</h3>
            <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
              YouTube
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>

          <div className={styles.col}>
            <h3>Legal</h3>
            <a href="/privacypolicy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="mailto:noteseraa@gmail.com">Contact</a>
          </div>

          <div className={styles.col}>
            <h3>Shop</h3>
            <a href="#modules">Modules</a>
            <a href="#pricing">Pricing</a>
            <a href="/courses">Free Notes</a>
            <a href="/premium">Premium</a>
          </div>

          <div className={styles.col}>
            <h3>Pages</h3>
            <a href="/">Home</a>
            <a href="#modules">Buy Modules</a>
            <a href="/courses">Courses</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
