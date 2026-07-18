import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styles from "./HeroSection.module.css";

// Temporarily commented out — restore later for 5s swap with yoga
// const DEVELOPER_LOTTIE =
//   "https://lottie.host/8879c876-20c4-4ba7-ac46-e1b9a4cc0b44/fl8a3j2zZm.json";
// const SWAP_MS = 5000;

const YOGA_LOTTIE = "/Assets2/Premium-Modules/yoga-developer.json";

const HeroSection = () => {
  // const [showYoga, setShowYoga] = useState(false);
  // useEffect(() => {
  //   const id = window.setInterval(() => {
  //     setShowYoga((prev) => !prev);
  //   }, SWAP_MS);
  //   return () => window.clearInterval(id);
  // }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.arcs} aria-hidden>
        <span className={styles.arc} />
        <span className={`${styles.arc} ${styles.arcTwo}`} />
        <span className={`${styles.arc} ${styles.arcThree}`} />
      </div>

      <div className={styles.content}>
        <p className={styles.badge}>
          <span className={styles.badgeStar} aria-hidden>
            ✦
          </span>
          India&apos;s trusted notes marketplace
        </p>

        <h1 className={styles.headline}>
          Notes-Era 2.0
          <br className={styles.titleBreak} />{" "}
          <span className={styles.accentWord}>is Here</span>
        </h1>

        <p className={styles.sub}>Exam ka NO Fear!</p>

        <div className={styles.lottieWrap} aria-hidden>
          <div className={styles.lottiePlayer}>
            <DotLottieReact
              src={YOGA_LOTTIE}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <p className={styles.desc}>
          <span className={styles.descLine}>
            Premium study materials specially designed for B.Tech CSE/IT
            students,
          </span>
          <span className={styles.descLine}>
            enabling focused learning and stress-free exam preparation.
          </span>
        </p>

        <div className={styles.actions}>
          <a href="/courses" className={styles.secondary}>
            Free Notes
          </a>
          <a href="#modules" className={styles.primary}>
            Shop Modules
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
